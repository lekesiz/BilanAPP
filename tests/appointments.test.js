const request = require('supertest');
const app = require('../app');
const sequelize = require('../config/database');
const {
  User, Beneficiary, Appointment,
} = require('../models');
const { createDefaultForfaits } = require('../scripts/init-db');

let agent; // Agent for session cookies
let consultantUser;
let beneficiaryUser;
let testBeneficiary;
let csrfToken;

// Helper to get CSRF token (can be reused or moved to a helper file)
async function getCsrfToken(agentInstance, url) {
  const response = await agentInstance.get(url);
  const match = response.text.match(/<input[^>]*name="_csrf"[^>]*value="([^"]*)"[^>]*>/);
  if (!match || !match[1]) {
    console.error(`Could not extract CSRF token from URL: ${url}`);
    console.error(`Response Status: ${response.statusCode}`);
    throw new Error(`Could not extract CSRF token from ${url}`);
  }
  return match[1];
}

beforeAll(async () => {
  try {
    await sequelize.sync({ force: true });
    await createDefaultForfaits();

    consultantUser = await User.create({
      email: 'consultant.appt@example.com',
      password: 'password123',
      firstName: 'ApptConsultant',
      lastName: 'Test',
      userType: 'consultant',
      forfaitType: 'Premium',
    });

    beneficiaryUser = await User.create({
      email: 'beneficiary.appt@example.com',
      password: 'password123',
      firstName: 'ApptBeneficiary',
      lastName: 'Test',
      userType: 'beneficiary',
    });

    testBeneficiary = await Beneficiary.create({
      userId: beneficiaryUser.id,
      consultantId: consultantUser.id,
      status: 'active',
      currentPhase: 'investigation',
    });

    agent = request.agent(app);

    // Login consultant
    csrfToken = await getCsrfToken(agent, '/auth/login');
    const loginRes = await agent.post('/auth/login').send({
      email: 'consultant.appt@example.com',
      password: 'password123',
      _csrf: csrfToken,
    });

    if (loginRes.statusCode !== 302 || loginRes.headers.location !== '/dashboard') {
      throw new Error('Test consultant login failed in appointment tests');
    }
    // Get CSRF token after login
    csrfToken = await getCsrfToken(agent, '/profile/settings'); // /appointments/new -> /profile/settings
  } catch (error) {
    console.error('[APPOINTMENT TEST SETUP] Error during beforeAll:', error);
    throw error;
  }
});

// Add afterEach hook for cleanup
afterEach(async () => {
  try {
    // Delete appointments created during tests
    await Appointment.destroy({ where: {}, force: true });
  } catch (error) {
    console.error('Error during afterEach appointment cleanup:', error);
  }
});

afterAll(async () => {
  await sequelize.close();
});

describe('Appointment Routes', () => {
  it('GET /appointments - Should list appointments', async () => {
    const res = await agent.get('/appointments');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('Rendez-vous');
  });

  it('GET /appointments/add - Should render the add appointment form', async () => {
    const res = await agent.get('/appointments/add');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('Planifier un rendez-vous');
    expect(res.text).toContain('_csrf');
  });

  it('POST /appointments/add - Should fail without beneficiaryId', async () => {
    // Fetch CSRF token just for this test
    const addCsrfToken = await getCsrfToken(agent, '/appointments/add');
    const res = await agent.post('/appointments/add').send({
      _csrf: addCsrfToken,
      type: 'Entretien Préliminaire',
      date: '2025-11-11',
      time: '11:00',
    });

    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('Bénéficiaire requis.');
  });

  it('POST /appointments/add - Should add a new appointment successfully', async () => {
    // Fetch CSRF token just for this test
    const addCsrfToken = await getCsrfToken(agent, '/appointments/add');
    const newAppointmentData = {
      beneficiaryId: testBeneficiary.id,
      type: "Entretien d'Investigation",
      date: '2025-10-20',
      time: '14:30',
      description: 'Test appointment description',
      _csrf: addCsrfToken,
    };
    const res = await agent.post('/appointments/add').send(newAppointmentData);

    expect(res.statusCode).toEqual(302);
    expect(res.headers.location).toEqual('/appointments');

    const appointment = await Appointment.findOne({
      where: {
        beneficiaryId: testBeneficiary.id,
        type: "Entretien d'Investigation",
      },
    });
    expect(appointment).not.toBeNull();
    // No need to save ID globally
  });

  it('GET /appointments/:id/edit - Should show edit form', async () => {
    // Create an appointment for this test
    const appt = await Appointment.create({
      beneficiaryId: testBeneficiary.id,
      consultantId: consultantUser.id,
      type: 'Test Edit Form',
      date: '2025-11-01',
      time: '09:00',
      description: 'For Edit Form',
    });

    const res = await agent.get(`/appointments/${appt.id}/edit`);
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('Modifier le rendez-vous');
    expect(res.text).toContain('For Edit Form');
    expect(res.text).toContain('_csrf');
  });

  it('POST /appointments/:id/edit - Should update the appointment', async () => {
    // Create an appointment for this test
    const appt = await Appointment.create({
      beneficiaryId: testBeneficiary.id,
      consultantId: consultantUser.id,
      type: 'Test Edit Post',
      date: '2025-11-02',
      time: '10:00',
      description: 'Initial Edit Post',
      status: 'scheduled',
    });

    // Fetch CSRF token from edit page
    const editCsrfToken = await getCsrfToken(agent, `/appointments/${appt.id}/edit`);
    const updatedData = {
      // beneficiaryId: testBeneficiary.id, // Usually not changed here, handled by controller/route?
      type: 'Entretien de Synthèse',
      date: '2025-11-03',
      time: '11:00',
      description: 'Updated description',
      status: 'completed',
      _csrf: editCsrfToken,
    };
    const res = await agent.post(`/appointments/${appt.id}/edit`).send(updatedData);

    expect(res.statusCode).toEqual(302);
    expect(res.headers.location).toEqual('/appointments');

    const updatedAppointment = await Appointment.findByPk(appt.id);
    expect(updatedAppointment.type).toEqual('Entretien de Synthèse');
    expect(updatedAppointment.status).toEqual('completed');
  });

  it('POST /appointments/:id/delete - Should delete the appointment', async () => {
    // Create an appointment for this test
    const appt = await Appointment.create({
      beneficiaryId: testBeneficiary.id,
      consultantId: consultantUser.id,
      type: 'Test Delete',
      date: '2025-11-04',
      time: '12:00',
    });

    // Use global token (or fetch from a reliable page like settings/dashboard)
    const deleteCsrfToken = csrfToken;

    const res = await agent
      .post(`/appointments/${appt.id}/delete`)
      .send({ _csrf: deleteCsrfToken });

    expect(res.statusCode).toEqual(302);
    expect(res.headers.location).toEqual('/appointments');

    const deletedAppointment = await Appointment.findByPk(appt.id);
    expect(deletedAppointment).toBeNull();
  });
});

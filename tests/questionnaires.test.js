const request = require('supertest');
const app = require('../app');
const sequelize = require('../config/database');
const { User, Beneficiary, Questionnaire, Question, Answer, Forfait } = require('../models');
const { createDefaultForfaits } = require('../scripts/init-db');

let agent;
let consultantUser;
let beneficiaryUser;
let testBeneficiary;
let csrfToken;
let createdQuestionnaireId;

// Helper to get CSRF token
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
      email: 'consultant.quest@example.com',
      password: 'password123',
      firstName: 'QuestConsultant',
      lastName: 'Test',
      userType: 'consultant',
      forfaitType: 'Standard', // Standard forfait for questionnaire creation
      availableCredits: 200, // Add credits for assigning
    });

    beneficiaryUser = await User.create({
      email: 'beneficiary.quest@example.com',
      password: 'password123',
      firstName: 'QuestBeneficiary',
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
      email: 'consultant.quest@example.com',
      password: 'password123',
      _csrf: csrfToken,
    });

    if (loginRes.statusCode !== 302 || loginRes.headers.location !== '/dashboard') {
      throw new Error('Test consultant login failed in questionnaire tests');
    }
    csrfToken = await getCsrfToken(agent, '/profile/settings');
  } catch (error) {
    console.error('[QUESTIONNAIRE TEST SETUP] Error during beforeAll:', error);
    throw error;
  }
});

afterAll(async () => {
  await sequelize.close();
});

describe('Questionnaire Routes', () => {
  it('GET /questionnaires - Should list questionnaires', async () => {
    const res = await agent.get('/questionnaires');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('Mes Questionnaires');
  });

  it('GET /questionnaires/new - Should render the new questionnaire form', async () => {
    const res = await agent.get('/questionnaires/new');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('Créer un nouveau questionnaire');
    expect(res.text).toContain('_csrf');
  });

  it('POST /questionnaires/new - Should fail without title or description', async () => {
    csrfToken = await getCsrfToken(agent, '/questionnaires/new');
    const res = await agent.post('/questionnaires/new').send({ _csrf: csrfToken }); // Empty body except CSRF

    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('Le titre est requis.');
    expect(res.text).toContain('La description est requise.');
  });

  it('POST /questionnaires/new - Should create a new questionnaire (draft)', async () => {
    csrfToken = await getCsrfToken(agent, '/questionnaires/new');
    const questionnaireData = {
      title: 'Test Questionnaire - Intérêts',
      description: 'Test description for interests questionnaire.',
      category: 'Intérêts Professionnels',
      questions: [
        { text: 'Q1 Text?', type: 'text' },
        { text: 'Q2 Scale?', type: 'scale' },
        { text: 'Q3 Radio?', type: 'radio', options: 'Option A\nOption B' },
      ],
      _csrf: csrfToken,
    };
    const res = await agent.post('/questionnaires/new').send(questionnaireData);

    // Should redirect to the questionnaire details page
    const questionnaires = await Questionnaire.findAll({
      where: { title: 'Test Questionnaire - Intérêts' },
    });
    expect(questionnaires.length).toBe(1);
    createdQuestionnaireId = questionnaires[0].id;

    expect(res.statusCode).toEqual(302);
    expect(res.headers.location).toEqual(`/questionnaires/${createdQuestionnaireId}`);

    // Verify questions were created
    const questions = await Question.findAll({
      where: { questionnaireId: createdQuestionnaireId },
    });
    expect(questions.length).toBe(3);
    expect(questions[0].text).toBe('Q1 Text?');
    expect(questions[2].options).toContain('Option A');

    csrfToken = await getCsrfToken(agent, '/profile/settings'); // Refresh token
  });

  it('GET /questionnaires/:id - Should show details of the created questionnaire', async () => {
    expect(createdQuestionnaireId).toBeDefined();
    const res = await agent.get(`/questionnaires/${createdQuestionnaireId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('Test Questionnaire - Intérêts');
    expect(res.text).toContain('Q1 Text?');
    expect(res.text).toContain('Assigner à un bénéficiaire'); // Check assign button is present
  });

  it('POST /questionnaires/:id/assign - Should assign the questionnaire to a beneficiary', async () => {
    expect(createdQuestionnaireId).toBeDefined();
    csrfToken = await getCsrfToken(agent, `/questionnaires/${createdQuestionnaireId}`); // Get token from details page
    const assignData = {
      beneficiaryId: testBeneficiary.id,
      dueDate: '2025-12-31',
      _csrf: csrfToken,
    };
    const res = await agent
      .post(`/questionnaires/${createdQuestionnaireId}/assign`)
      .send(assignData);

    expect(res.statusCode).toEqual(302);
    expect(res.headers.location).toEqual(`/questionnaires/${createdQuestionnaireId}`);

    // Verify DB update
    const assignedQuestionnaire = await Questionnaire.findByPk(createdQuestionnaireId);
    expect(assignedQuestionnaire.beneficiaryId).toEqual(testBeneficiary.id);
    expect(assignedQuestionnaire.status).toEqual('pending');
    // expect(assignedQuestionnaire.dueDate).toEqual(new Date('2025-12-31')); // Date comparison can be tricky

    csrfToken = await getCsrfToken(agent, '/profile/settings'); // Refresh token
  });

  it('POST /questionnaires/:id/delete - Should delete the questionnaire', async () => {
    expect(createdQuestionnaireId).toBeDefined();
    const res = await agent
      .post(`/questionnaires/${createdQuestionnaireId}/delete`)
      .send({ _csrf: csrfToken });

    expect(res.statusCode).toEqual(302);
    expect(res.headers.location).toEqual('/questionnaires');

    // Verify deletion
    const deletedQuestionnaire = await Questionnaire.findByPk(createdQuestionnaireId);
    expect(deletedQuestionnaire).toBeNull();
  });

  // TODO: Add tests for answering questionnaires (requires beneficiary login)
  // TODO: Add tests for viewing results
  // TODO: Add tests for adding/deleting questions after creation
});

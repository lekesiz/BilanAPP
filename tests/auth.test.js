const request = require('supertest');
const app = require('../app'); // Express uygulamasını import et
const sequelize = require('../config/database');
const { User, Beneficiary } = require('../models');
const { createDefaultForfaits } = require('../scripts/init-db'); // Fonksiyonu import et

beforeAll(async () => {
  try {
    console.log('[TEST SETUP] Syncing database...');
    await sequelize.sync({ force: true });
    console.log('[TEST SETUP] Database synced.');

    console.log('[TEST SETUP] Creating default forfaits...');
    await createDefaultForfaits(); // Varsayılan forfait'ları oluştur
    console.log('[TEST SETUP] Default forfaits created.');
  } catch (error) {
    console.error('[TEST SETUP] Error during beforeAll:', error);
    throw error;
  }
});

// Cleanup hook after each test
afterEach(async () => {
  // Clean up created beneficiaries and their associated users
  try {
    // Delete users with specific test emails
    const emailsToDelete = [
      'wrongpass.test@example.com',
      'correctpass.test@example.com',
      'dash.test@example.com',
      'logout.test@example.com',
      'register.test@example.com',
      'existing.test@example.com',
    ];
    const usersToDelete = await User.findAll({
      where: { email: emailsToDelete }, // Use exact emails
      attributes: ['id'],
    });
    const userIds = usersToDelete.map((u) => u.id);
    if (userIds.length > 0) {
      // Explicitly delete Beneficiaries first if User cascade isn't guaranteed
      await Beneficiary.destroy({ where: { userId: userIds }, force: true });
      await User.destroy({ where: { id: userIds }, force: true });
    }
  } catch (error) {
    console.error('Error during afterEach auth cleanup:', error);
  }
});

afterAll(async () => {
  await sequelize.close();
});

describe('Auth Routes', () => {
  it('GET /auth/login - Should render login page', async () => {
    const agent = request.agent(app); // Create agent locally for this test
    const res = await agent.get('/auth/login');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('Connexion');
  });

  it('POST /auth/login - Should fail with wrong password', async () => {
    // Create user specifically for this test
    await User.create({
      email: 'wrongpass.test@example.com',
      password: 'password123',
      firstName: 'Wrong',
      lastName: 'Pass',
      userType: 'consultant',
      forfaitType: 'Standard',
    });

    const agent = request.agent(app); // Create agent locally
    const loginPageRes = await agent.get('/auth/login');
    const csrfToken = loginPageRes.text.match(/<input[^>]*name="_csrf"[^>]*value="([^"]*)"[^>]*>/)[1];

    const res = await agent.post('/auth/login').send({
      email: 'wrongpass.test@example.com',
      password: 'wrongpassword',
      _csrf: csrfToken,
    });
    expect(res.statusCode).toEqual(302);
    expect(res.headers.location).toEqual('/auth/login');
  });

  it('POST /auth/login - Should login successfully with correct credentials', async () => {
    // Create user specifically for this test
    await User.create({
      email: 'correctpass.test@example.com',
      password: 'password123',
      firstName: 'Correct',
      lastName: 'Pass',
      userType: 'consultant',
      forfaitType: 'Standard',
    });

    // Need a fresh agent for this test to avoid carrying over session state
    const testAgent = request.agent(app);
    const loginPageRes = await testAgent.get('/auth/login');
    const csrfToken = loginPageRes.text.match(/<input[^>]*name="_csrf"[^>]*value="([^"]*)"[^>]*>/)[1];

    const res = await testAgent.post('/auth/login').send({
      email: 'correctpass.test@example.com',
      password: 'password123',
      _csrf: csrfToken,
    });
    expect(res.statusCode).toEqual(302);
    expect(res.headers.location).toEqual('/dashboard');
  });

  it('GET /dashboard - Should require authentication after login', async () => {
    // Create user and log in for this test
    await User.create({
      email: 'dash.test@example.com',
      password: 'password123',
      firstName: 'Dash',
      lastName: 'Test',
      userType: 'consultant',
      forfaitType: 'Standard',
    });
    const testAgent = request.agent(app);
    // let csrf = await getCsrfToken(testAgent, '/auth/login'); // REMOVED
    // Login process needs a valid token
    const loginPageRes = await testAgent.get('/auth/login');
    const csrf = loginPageRes.text.match(/<input[^>]*name="_csrf"[^>]*value="([^"]*)"[^>]*>/)[1];
    await testAgent.post('/auth/login').send({ email: 'dash.test@example.com', password: 'password123', _csrf: csrf });

    const res = await testAgent.get('/dashboard');
    expect(res.statusCode).toEqual(302);
    expect(res.headers.location).toEqual('/dashboard/consultant');
  });

  it('GET /auth/logout - Should logout successfully', async () => {
    // Create user and log in for this test
    await User.create({
      email: 'logout.test@example.com',
      password: 'password123',
      firstName: 'Logout',
      lastName: 'Test',
      userType: 'consultant',
      forfaitType: 'Standard',
    });
    const testAgent = request.agent(app);
    // let csrf = await getCsrfToken(testAgent, '/auth/login'); // REMOVED
    // Login process needs a valid token
    const loginPageRes = await testAgent.get('/auth/login');
    const csrf = loginPageRes.text.match(/<input[^>]*name="_csrf"[^>]*value="([^"]*)"[^>]*>/)[1];
    await testAgent.post('/auth/login').send({ email: 'logout.test@example.com', password: 'password123', _csrf: csrf });

    // Perform logout
    const res = await testAgent.get('/auth/logout');
    expect(res.statusCode).toEqual(302);
    expect(res.headers.location).toEqual('/');

    // Verify access is denied after logout
    const dashboardRes = await testAgent.get('/dashboard');
    expect(dashboardRes.statusCode).toEqual(302);
    expect(dashboardRes.headers.location).toEqual('/auth/login');
  });

  it('GET /auth/register - Should render register page', async () => {
    const agent = request.agent(app); // Create agent locally
    const res = await agent.get('/auth/register');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('Inscription');
    expect(res.text).toContain('_csrf');
  });

  it('POST /auth/register - Should fail with missing fields', async () => {
    const agent = request.agent(app); // Create agent locally
    const regPageRes = await agent.get('/auth/register');
    const regCsrfToken = regPageRes.text.match(/<input[^>]*name="_csrf"[^>]*value="([^"]*)"[^>]*>/)[1];
    const res = await agent.post('/auth/register').send({ _csrf: regCsrfToken });
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('Le prénom est requis');
    // ... other validation checks
  });

  it('POST /auth/register - Should register a new user successfully', async () => {
    const agent = request.agent(app); // Create agent locally
    const regPageRes = await agent.get('/auth/register');
    const regCsrfToken = regPageRes.text.match(/<input[^>]*name="_csrf"[^>]*value="([^"]*)"[^>]*>/)[1];
    const userData = {
      firstName: 'Register',
      lastName: 'TestUser',
      email: 'register.test@example.com',
      password: 'password123',
      password2: 'password123',
      userType: 'consultant',
      _csrf: regCsrfToken,
    };
    const res = await agent.post('/auth/register').send(userData);
    expect(res.statusCode).toEqual(302);
    expect(res.headers.location).toEqual('/auth/login');
    const newUser = await User.findOne({ where: { email: 'register.test@example.com' } });
    expect(newUser).not.toBeNull();
    // afterEach cleans this user
  });

  it('POST /auth/register - Should fail if email already exists', async () => {
    // Create user specifically for this test to ensure it exists
    await User.create({
      email: 'existing.test@example.com',
      password: 'password123',
      firstName: 'Existing',
      lastName: 'User',
      userType: 'consultant',
      forfaitType: 'Standard',
    });

    const agent = request.agent(app); // Create agent locally
    const regPageRes = await agent.get('/auth/register');
    const regCsrfToken = regPageRes.text.match(/<input[^>]*name="_csrf"[^>]*value="([^"]*)"[^>]*>/)[1];
    const userData = {
      firstName: 'Another',
      lastName: 'User',
      email: 'existing.test@example.com', // Use the email just created
      password: 'password123',
      password2: 'password123',
      userType: 'consultant',
      _csrf: regCsrfToken,
    };
    const res = await agent.post('/auth/register').send(userData);
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('Cet email est déjà enregistré.'); // Corrected message
  });
});

const request = require('supertest');
const app = require('../app'); // Express uygulamasını import et
const sequelize = require('../config/database');
const { User } = require('../models');
const { createDefaultForfaits } = require('../scripts/init-db'); // Fonksiyonu import et

let agent; // Session cookie'lerini saklamak için agent

beforeAll(async () => {
  try {
    console.log('[TEST SETUP] Syncing database...');
    await sequelize.sync({ force: true });
    console.log('[TEST SETUP] Database synced.');
    
    console.log('[TEST SETUP] Creating default forfaits...');
    await createDefaultForfaits(); // Varsayılan forfait'ları oluştur
    console.log('[TEST SETUP] Default forfaits created.');

    console.log('[TEST SETUP] Creating test user...');
    await User.create({
        email: 'test@example.com',
        password: 'password123', // Hook hashleyecek
        firstName: 'Test',
        lastName: 'User',
        userType: 'consultant',
        forfaitType: 'Standard',
    });
    console.log('[TEST SETUP] Test user created.');

    agent = request.agent(app);
    console.log('[TEST SETUP] Agent created.');
  } catch (error) {
      console.error('[TEST SETUP] Error during beforeAll:', error); // Hata loglandı
      throw error; // Hatanın testi fail etmesini sağla
  }
});

afterAll(async () => {
  // Test sonrası veritabanı bağlantısını kapat
  await sequelize.close();
});

describe('Auth Routes', () => {
  it('GET /auth/login - Should render login page', async () => {
    const res = await agent.get('/auth/login');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('Connexion'); // Sayfada 'Connexion' metni var mı?
  });

  it('POST /auth/login - Should fail with wrong password', async () => {
    // CSRF token'ını almak için önce GET isteği yapalım
    const loginPageRes = await agent.get('/auth/login');
    const csrfToken = loginPageRes.text.match(/<input type="hidden" name="_csrf" value="(.*)">/)[1];

    const res = await agent
      .post('/auth/login')
      .send({ 
          email: 'test@example.com', 
          password: 'wrongpassword', 
          _csrf: csrfToken 
        });
    // Başarısız login /auth/login'e geri yönlendirmeli
    expect(res.statusCode).toEqual(302);
    expect(res.headers.location).toEqual('/auth/login');
    // TODO: Flash mesajını kontrol etmek daha karmaşık, şimdilik atlayalım.
  });

  it('POST /auth/login - Should login successfully with correct credentials', async () => {
    const loginPageRes = await agent.get('/auth/login');
    const csrfToken = loginPageRes.text.match(/<input type="hidden" name="_csrf" value="(.*)">/)[1];

    const res = await agent
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
        _csrf: csrfToken
      });
    // Başarılı login /dashboard'a yönlendirmeli
    expect(res.statusCode).toEqual(302);
    expect(res.headers.location).toEqual('/dashboard');
  });

  it('GET /dashboard - Should require authentication after login', async () => {
      // Agent session cookie'sini sakladığı için bu istek başarılı olmalı
      const res = await agent.get('/dashboard');
      // /dashboard -> /dashboard/consultant yönlendirmesi olmalı
      expect(res.statusCode).toEqual(302);
      expect(res.headers.location).toEqual('/dashboard/consultant');
  });

  it('GET /auth/logout - Should logout successfully', async () => {
    // Önce login olalım (zaten önceki testte olmuştuk, agent cookie'yi tutuyor)
    const res = await agent.get('/auth/logout');
    // Başarılı logout ana sayfaya (/) yönlendirmeli
    expect(res.statusCode).toEqual(302);
    expect(res.headers.location).toEqual('/');

    // Logout sonrası /dashboard'a erişememeli
    const dashboardRes = await agent.get('/dashboard');
    expect(dashboardRes.statusCode).toEqual(302);
    expect(dashboardRes.headers.location).toEqual('/auth/login'); // Login'e yönlendirilmeli
  });

  // TODO: Add tests for /register route

}); 
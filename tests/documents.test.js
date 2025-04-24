const request = require('supertest');
const path = require('path');
const fs = require('fs');
const app = require('../app');
const sequelize = require('../config/database');
const { User, Beneficiary, Document, Forfait } = require('../models');
const { createDefaultForfaits } = require('../scripts/init-db');

let agent;
let consultantUser;
let beneficiaryUser;
let testBeneficiary;
let csrfToken;
let uploadedDocumentId;
let uploadedFilePath;

// CSRF Token Helper (copied from other tests)
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

// Helper to clean up uploaded test files
function cleanupTestUploads() {
  const uploadDir = path.join(__dirname, '../public/uploads/documents');
  if (fs.existsSync(uploadDir)) {
    fs.readdirSync(uploadDir).forEach((file) => {
      if (file.includes('test-upload')) {
        // Delete files created by test
        fs.unlinkSync(path.join(uploadDir, file));
      }
    });
  }
}

beforeAll(async () => {
  try {
    await sequelize.sync({ force: true });
    await createDefaultForfaits();

    consultantUser = await User.create({
      email: 'consultant.doc@example.com',
      password: 'password123',
      firstName: 'DocConsultant',
      lastName: 'Test',
      userType: 'consultant',
      forfaitType: 'Premium',
      availableCredits: 100,
    });

    beneficiaryUser = await User.create({
      email: 'beneficiary.doc@example.com',
      password: 'password123',
      firstName: 'DocBeneficiary',
      lastName: 'Test',
      userType: 'beneficiary',
    });

    testBeneficiary = await Beneficiary.create({
      userId: beneficiaryUser.id,
      consultantId: consultantUser.id,
      status: 'active',
      currentPhase: 'investigation',
      phone: '5551234567',
    });

    fs.writeFileSync(path.join(__dirname, 'test-upload.txt'), 'Test content');

    agent = request.agent(app);

    // Login consultant
    csrfToken = await getCsrfToken(agent, '/auth/login');
    const loginRes = await agent.post('/auth/login').send({
      email: 'consultant.doc@example.com',
      password: 'password123',
      _csrf: csrfToken,
    });
    if (loginRes.statusCode !== 302 || loginRes.headers.location !== '/dashboard') {
      throw new Error('Test consultant login failed in document tests');
    }
    csrfToken = await getCsrfToken(agent, '/profile/settings');
  } catch (error) {
    console.error('[DOCUMENT TEST SETUP] Error during beforeAll:', error);
    throw error;
  }
});

afterAll(async () => {
  cleanupTestUploads();
  try {
    // try-catch eklendi
    fs.unlinkSync(path.join(__dirname, 'test-upload.txt'));
  } catch (e) {
    if (e.code !== 'ENOENT') {
      // Dosya yoksa hata verme
      console.error('Error deleting dummy test file:', e);
    }
  }
  await sequelize.close();
});

describe('Document Routes', () => {
  it('GET /documents - Should list documents', async () => {
    const res = await agent.get('/documents');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('Mes Documents');
  });

  it('GET /documents/upload - Should render the upload form', async () => {
    const res = await agent.get('/documents/upload');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('Télécharger un document');
    expect(res.text).toContain('_csrf');
  });

  it('POST /documents/upload - Should fail without a file', async () => {
    csrfToken = await getCsrfToken(agent, '/documents/upload');
    const res = await agent
      .post('/documents/upload')
      .set('csrf-token', csrfToken)
      .field('category', 'CV');

    expect(res.statusCode).toEqual(302);
    expect(res.headers.location).toEqual('/documents/upload');
  });

  it('POST /documents/upload - Should upload a document successfully', async () => {
    csrfToken = await getCsrfToken(agent, '/documents/upload');
    const filePath = path.join(__dirname, 'test-upload.txt');

    const res = await agent
      .post('/documents/upload')
      .set('csrf-token', csrfToken)
      .field('beneficiaryId', testBeneficiary.id)
      .field('category', 'CV')
      .field('description', 'Test CV Upload')
      .attach('documentFile', filePath, { contentType: 'text/plain' });

    expect(res.statusCode).toEqual(302);
    expect(res.headers.location).toEqual('/documents');

    // Verify DB record
    const document = await Document.findOne({
      where: { beneficiaryId: testBeneficiary.id, originalName: 'test-upload.txt' },
    });
    expect(document).not.toBeNull();
    expect(document.category).toEqual('CV');
    uploadedDocumentId = document.id;
    uploadedFilePath = path.join(__dirname, '../public', document.filePath);

    // Verify file exists on server
    expect(fs.existsSync(uploadedFilePath)).toBe(true);

    csrfToken = await getCsrfToken(agent, '/profile/settings'); // Refresh token
  });

  it('GET /documents/:id/edit - Should show edit form', async () => {
    expect(uploadedDocumentId).toBeDefined();
    const res = await agent.get(`/documents/${uploadedDocumentId}/edit`);
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('Modifier: test-upload.txt');
    expect(res.text).toContain('Test CV Upload');
    expect(res.text).toContain('_csrf');
  });

  it('POST /documents/:id/edit - Should update document metadata', async () => {
    expect(uploadedDocumentId).toBeDefined();
    csrfToken = await getCsrfToken(agent, `/documents/${uploadedDocumentId}/edit`);
    const updatedData = {
      description: 'Updated Description',
      category: 'Autre',
      bilanPhase: 'Conclusion',
      beneficiaryId: '', // Unassign
    };
    const res = await agent
      .post(`/documents/${uploadedDocumentId}/edit`)
      .set('csrf-token', csrfToken)
      .send(updatedData);

    expect(res.statusCode).toEqual(302);
    expect(res.headers.location).toEqual('/documents');

    // Verify update in DB
    const updatedDocument = await Document.findByPk(uploadedDocumentId);
    expect(updatedDocument.description).toEqual('Updated Description');
    expect(updatedDocument.category).toEqual('Autre');
    expect(updatedDocument.beneficiaryId).toBeNull(); // Check unassignment
    csrfToken = await getCsrfToken(agent, '/profile/settings'); // Refresh token
  });

  it('POST /documents/:id/delete - Should delete the document and file', async () => {
    expect(uploadedDocumentId).toBeDefined();
    const res = await agent
      .post(`/documents/${uploadedDocumentId}/delete`)
      .set('csrf-token', csrfToken)
      .send({});

    expect(res.statusCode).toEqual(302);
    expect(res.headers.location).toEqual('/documents');

    // Verify DB deletion
    const deletedDocument = await Document.findByPk(uploadedDocumentId);
    expect(deletedDocument).toBeNull();

    // Verify file deletion
    expect(fs.existsSync(uploadedFilePath)).toBe(false);
  });
});

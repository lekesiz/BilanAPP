const request = require('supertest');
const path = require('path');
const fs = require('fs');
const app = require('../app');
const sequelize = require('../config/database');
const {
  User, Beneficiary, Document,
} = require('../models');
const { createDefaultForfaits } = require('../scripts/init-db');

let agent;
let consultantUser;
let beneficiaryUser;
let testBeneficiary;
let csrfToken;

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

// Add afterEach hook for cleanup
afterEach(async () => {
  try {
    // Delete DB records
    await Document.destroy({ where: {}, force: true }); // force: true might be needed if paranoid
    // Clean up uploaded files
    cleanupTestUploads();
  } catch (error) {
    console.error('Error during afterEach cleanup:', error);
  }
});

afterAll(async () => {
  // Remove specific file deletion, cleanupTestUploads handles it
  // try {
  //   fs.unlinkSync(path.join(__dirname, 'test-upload.txt'));
  // } catch (e) { ... }
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
    const testFileName = 'test-upload-success.txt'; // Use unique name
    const filePath = path.join(__dirname, testFileName);

    // *** Create the dummy file just for this test ***
    fs.writeFileSync(filePath, 'Test content for upload');

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
      where: { beneficiaryId: testBeneficiary.id, originalName: testFileName },
    });
    expect(document).not.toBeNull();
    expect(document.category).toEqual('CV');

    // Verify file exists on server
    const uploadedFilePath = path.join(__dirname, '../public', document.filePath);
    expect(fs.existsSync(uploadedFilePath)).toBe(true);

    // *** Clean up the dummy file used for upload ***
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      // Ignore error if file doesn't exist (already cleaned up?)
      if (err.code !== 'ENOENT') {
        console.error('Error cleaning up source test file:', err);
      }
    }
    // Note: afterEach will clean the uploaded file and DB record

    // csrfToken = await getCsrfToken(agent, '/profile/settings'); // No longer needed here
  });

  it('GET /documents/:id/edit - Should show edit form for an existing document', async () => {
    // Create a document for this test
    const doc = await Document.create({
      fileName: 'edit-form-test.txt',
      originalName: 'edit-form-test.txt',
      filePath: 'documents/edit-form-test.txt', // Dummy path, file doesn't need to exist for form
      fileType: 'text/plain',
      fileSize: 100,
      uploadedBy: consultantUser.id,
      beneficiaryId: testBeneficiary.id,
      description: 'Doc for edit form test',
    });

    const res = await agent.get(`/documents/${doc.id}/edit`);
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('Modifier: edit-form-test.txt');
    expect(res.text).toContain('Doc for edit form test');
    expect(res.text).toContain('_csrf');
  });

  it('POST /documents/:id/edit - Should update document metadata', async () => {
    // Create a document for this test
    const doc = await Document.create({
      fileName: 'edit-meta-test.txt',
      originalName: 'edit-meta-test.txt',
      filePath: 'documents/edit-meta-test.txt',
      fileType: 'text/plain',
      fileSize: 100,
      uploadedBy: consultantUser.id,
      beneficiaryId: testBeneficiary.id,
      description: 'Initial Description',
      category: 'CV',
    });

    const editPageCsrf = await getCsrfToken(agent, `/documents/${doc.id}/edit`);
    const updatedData = {
      description: 'Updated Description',
      category: 'Autre',
      bilanPhase: 'Conclusion',
      beneficiaryId: '', // Unassign
      _csrf: editPageCsrf,
    };
    const res = await agent
      .post(`/documents/${doc.id}/edit`)
      // Use send() for form data when not attaching files
      .send(updatedData);

    expect(res.statusCode).toEqual(302);
    expect(res.headers.location).toEqual('/documents');

    const updatedDocument = await Document.findByPk(doc.id);
    expect(updatedDocument.description).toEqual('Updated Description');
    expect(updatedDocument.category).toEqual('Autre');
    expect(updatedDocument.beneficiaryId).toBeNull();
  });

  it('POST /documents/:id/delete - Should delete the document record and file', async () => {
    // Create a dummy file and DB record for this test
    const testFileName = 'delete-test-upload.txt';
    const testFilePathRelative = `documents/${testFileName}`;
    const testFilePathAbsolute = path.join(__dirname, '../public/uploads', testFilePathRelative);
    fs.writeFileSync(testFilePathAbsolute, 'Delete me'); // Create the physical file

    const doc = await Document.create({
      fileName: testFileName,
      originalName: testFileName,
      filePath: testFilePathRelative,
      fileType: 'text/plain',
      fileSize: 9,
      uploadedBy: consultantUser.id,
      beneficiaryId: testBeneficiary.id,
    });

    // Need a valid CSRF token - get from a reliable page like settings
    const deleteCsrfToken = await getCsrfToken(agent, '/profile/settings');

    const res = await agent
      .post(`/documents/${doc.id}/delete`)
      .send({ _csrf: deleteCsrfToken }); // Send token in body for POST

    expect(res.statusCode).toEqual(302);
    expect(res.headers.location).toEqual('/documents');

    const deletedDocument = await Document.findByPk(doc.id);
    expect(deletedDocument).toBeNull();

    expect(fs.existsSync(testFilePathAbsolute)).toBe(false);
  });
});

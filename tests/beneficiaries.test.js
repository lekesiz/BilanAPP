const request = require('supertest');
const app = require('../app');
const sequelize = require('../config/database');
const { User, Beneficiary, Forfait } = require('../models');
const { createDefaultForfaits } = require('../scripts/init-db');

let agent; // Agent for session cookies
let consultantUser; // Test consultant user
let csrfToken; // Store CSRF token
let createdBeneficiaryId; // Store ID of created beneficiary for later tests

beforeAll(async () => {
    try {
        await sequelize.sync({ force: true });
        await createDefaultForfaits();

        consultantUser = await User.create({
            email: 'consultant.test@example.com',
            password: 'password123',
            firstName: 'Consultant',
            lastName: 'Test',
            userType: 'consultant',
            forfaitType: 'Premium', // Ensure forfait allows adding beneficiaries
        });

        agent = request.agent(app);

        // Login için CSRF token'ını al
        csrfToken = await getCsrfToken(agent, '/auth/login'); 

        // Login the consultant user once
        const loginRes = await agent
            .post('/auth/login')
            .send({
                email: 'consultant.test@example.com',
                password: 'password123',
                _csrf: csrfToken // Aldığımız token'ı kullan
            });
        
        if (loginRes.statusCode !== 302 || loginRes.headers.location !== '/dashboard') {
            throw new Error('Test consultant login failed');
        }
        // Login sonrası yeni bir CSRF token'ı alıp saklayalım
        csrfToken = await getCsrfToken(agent, '/profile/settings'); // /beneficiaries/add -> /profile/settings

    } catch (error) {
        console.error('[BENEFICIARY TEST SETUP] Error during beforeAll:', error);
        throw error;
    }
});

// Helper to get CSRF token
async function getCsrfToken(agentInstance, url) {
    const response = await agentInstance.get(url);
    // Daha esnek regex: value içindeki tırnak işaretlerine ve aradaki boşluklara izin ver
    const match = response.text.match(/<input[^>]*name="_csrf"[^>]*value="([^"]*)"[^>]*>/);
    if (!match || !match[1]) {
        // Hata mesajını logla
        console.error(`Could not extract CSRF token from URL: ${url}`);
        console.error(`Response Status: ${response.statusCode}`);
        // console.error(`Response Text Snippet: ${response.text.substring(0, 500)}`); // Debug için gerekirse eklenebilir
        throw new Error(`Could not extract CSRF token from ${url}`);
    }
    return match[1];
}

afterAll(async () => {
    await sequelize.close();
});

describe('Beneficiary Routes', () => {
    
    it('GET /beneficiaries - Should list beneficiaries for logged in consultant', async () => {
        const res = await agent.get('/beneficiaries');
        expect(res.statusCode).toEqual(200);
        expect(res.text).toContain('Bénéficiaires');
        // Initially, no beneficiaries should be listed for this consultant
        expect(res.text).toContain('Aucun bénéficiaire trouvé'); 
    });

    it('GET /beneficiaries/add - Should render the add beneficiary form', async () => {
        const res = await agent.get('/beneficiaries/add');
        expect(res.statusCode).toEqual(200);
        expect(res.text).toContain('Ajouter un nouveau bénéficiaire');
        expect(res.text).toContain('_csrf'); // Check CSRF token input exists
    });

    it('POST /beneficiaries/add - Should fail without required fields', async () => {
        csrfToken = await getCsrfToken(agent, '/beneficiaries/add');
        const res = await agent
            .post('/beneficiaries/add')
            .send({ _csrf: csrfToken }); 
        
        expect(res.statusCode).toEqual(200);
        expect(res.text).toContain('Le prénom est requis.');
        expect(res.text).toContain('Le nom est requis.');
        // expect(res.text).toContain('Adresse email invalide.'); // Kaldırıldı
    });

    it('POST /beneficiaries/add - Should add a new beneficiary successfully', async () => {
        csrfToken = await getCsrfToken(agent, '/beneficiaries/add');
        const newBeneficiaryData = {
            firstName: 'New',
            lastName: 'Benef',
            email: 'new.benef@example.com',
            phone: '1234567890',
            status: 'active',
            currentPhase: 'investigation',
            _csrf: csrfToken,
        };
        const res = await agent
            .post('/beneficiaries/add')
            .send(newBeneficiaryData);

        expect(res.statusCode).toEqual(302); // Should redirect after successful add
        expect(res.headers.location).toEqual('/beneficiaries');

        // Verify the user and beneficiary were created in the DB
        const user = await User.findOne({ where: { email: 'new.benef@example.com' } });
        expect(user).not.toBeNull();
        expect(user.firstName).toEqual('New');
        const beneficiary = await Beneficiary.findOne({ where: { userId: user.id } });
        expect(beneficiary).not.toBeNull();
        expect(beneficiary.consultantId).toEqual(consultantUser.id);
        createdBeneficiaryId = beneficiary.id; // Save for later tests
        // Testin sonunda token'ı yenile
        csrfToken = await getCsrfToken(agent, '/profile/settings'); // /appointments/new -> /profile/settings
    });

    it('GET /beneficiaries/:id - Should show details of the created beneficiary', async () => {
        expect(createdBeneficiaryId).toBeDefined(); // Ensure ID was captured
        const res = await agent.get(`/beneficiaries/${createdBeneficiaryId}`);
        expect(res.statusCode).toEqual(200);
        expect(res.text).toContain('New');
        expect(res.text).toContain('Benef');
        expect(res.text).toContain('active');
    });

    it('GET /beneficiaries/:id/edit - Should show edit form for the created beneficiary', async () => {
        expect(createdBeneficiaryId).toBeDefined();
        const res = await agent.get(`/beneficiaries/${createdBeneficiaryId}/edit`);
        expect(res.statusCode).toEqual(200);
        expect(res.text).toContain('Modifier:');
        expect(res.text).toContain('new.benef@example.com');
        expect(res.text).toContain('_csrf');
    });

    it('POST /beneficiaries/:id/edit - Should update the beneficiary', async () => {
        expect(createdBeneficiaryId).toBeDefined();
        csrfToken = await getCsrfToken(agent, `/beneficiaries/${createdBeneficiaryId}/edit`);
        const updatedData = {
            firstName: 'Updated',
            lastName: 'Beneficiary',
            email: 'new.benef@example.com', // Keep email same for simplicity
            phone: '0987654321',
            status: 'completed',
            currentPhase: 'conclusion',
            _csrf: csrfToken,
            consentGiven: 'false', 
            agreementSigned: 'false',
            synthesisFinalized: 'false',
            prelim_entretienInfoFait: 'false', 
            prelim_conventionSignee: 'false',
            invest_parcoursDetailleFait: 'false',
            invest_competencesEvaluees: 'false',
            invest_interetsExplores: 'false',
            invest_projetExplore: 'false',
            conclu_syntheseRedigee: 'false',
            conclu_planActionDefini: 'false',
            conclu_entretienSyntheseFait: 'false',
            satisfactionSurveySent: 'false',
            suivi_entretien6moisFait: 'false'
        };
        const res = await agent
            .post(`/beneficiaries/${createdBeneficiaryId}/edit`)
            .send(updatedData);
        
        expect(res.statusCode).toEqual(302); 
        expect(res.headers.location).toEqual(`/beneficiaries/${createdBeneficiaryId}`);

        // Verify update in DB
        const updatedBeneficiary = await Beneficiary.findByPk(createdBeneficiaryId, { include: 'user' });
        expect(updatedBeneficiary.user.firstName).toEqual('Updated');
        expect(updatedBeneficiary.status).toEqual('completed');
        csrfToken = await getCsrfToken(agent, '/profile/settings'); // /appointments/new -> /profile/settings
    });

    it('POST /beneficiaries/:id/delete - Should delete the beneficiary', async () => {
        expect(createdBeneficiaryId).toBeDefined();
        csrfToken = await getCsrfToken(agent, `/beneficiaries/${createdBeneficiaryId}/edit`); // Token'ı edit sayfasından al
        const res = await agent
            .post(`/beneficiaries/${createdBeneficiaryId}/delete`)
            .send({ _csrf: csrfToken }); 

        expect(res.statusCode).toEqual(302);
        expect(res.headers.location).toEqual('/beneficiaries');

        // Verify deletion in DB
        const deletedBeneficiary = await Beneficiary.findByPk(createdBeneficiaryId);
        expect(deletedBeneficiary).toBeNull();
        const deletedUser = await User.findOne({ where: { email: 'new.benef@example.com' } });
        expect(deletedUser).toBeNull(); // User should also be deleted via cascade
    });

}); 
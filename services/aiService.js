const OpenAI = require('openai');
const { Beneficiary } = require('../models'); // Gerekirse ek modeller

// ÖNEMLİ NOT: Bu kodun çalışması için:
// 1. `npm install openai` komutunu çalıştırın.
// 2. OpenAI API anahtarınızı projenin kök dizinindeki `.env` dosyasına
//    `OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxx` şeklinde ekleyin.
// 3. `app.js` veya başlangıç dosyanızda `require('dotenv').config();` olduğundan emin olun.

let openai;
try {
    // API anahtarını ortam değişkenlerinden yükle
    if (!process.env.OPENAI_API_KEY) {
        console.warn('OpenAI API Key bulunamadı. AI özellikleri çalışmayacak.');
    } else {
        openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
        console.log('OpenAI client başarıyla başlatıldı.')
    }
} catch (error) {
    console.error("OpenAI client başlatılırken hata:", error);
    openai = null; // Hata durumunda null yap
}

// Helper function to format date (already in handlebars helpers, but useful here too)
function formatDate(dateString) {
    if (!dateString) return '';
    try {
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return ''; 
        return d.toLocaleDateString('fr-FR');
    } catch (e) { return '';}
}

/**
 * Verilen bilgilere göre Bilan de Compétences sentez taslağı oluşturur.
 * @param {object} beneficiaryData Yararlanıcı verileri.
 * @returns {Promise<string>} Oluşturulan sentez taslağı metni.
 */
async function generateSynthesisDraft(beneficiaryData) {
    if (!openai) return Promise.reject('OpenAI client non initialisé. Vérifiez la clé API.');

    const prompt = `
        **Tâche:** Rédiger une ébauche de **Synthèse de Bilan de Compétences** pour le bénéficiaire ci-dessous, en suivant la structure réglementaire (Code du Travail R6313-7) et les exigences Qualiopi.
        Le document doit être objectif, précis, confidentiel et utiliser un langage clair et accessible.
        Utiliser le **markdown** pour la structure (titres ##, listes -, gras **).
        Laisser des sections **[Analyse/Conclusion Consultant à ajouter]** pour l'intervention humaine.

        **Bénéficiaire:** ${beneficiaryData.user?.firstName || ''} ${beneficiaryData.user?.lastName || ''}

        **Informations Fournies (à intégrer et synthétiser):**
        - Parcours (Formation/Expérience): ${beneficiaryData.education || 'Non renseigné'} / ${beneficiaryData.experience || 'Non renseigné'}
        - Compétences clés identifiées: ${beneficiaryData.identifiedSkills || 'À détailler lors des entretiens'}
        - Projet(s) Professionnel(s) envisagé(s): ${beneficiaryData.careerObjectives || 'À explorer'}
        - Contexte/Demande Initiale: ${beneficiaryData.notes || 'Standard'}
        - Synthèse des Questionnaires: ${summarizeAnswers(beneficiaryData.assignedQuestionnaires)}

        **Structure Exigée:**

        ## 1. Circonstances Actuelles et Demande Initiale
        - Contexte professionnel et personnel du bénéficiaire au début du bilan.
        - Objectifs initiaux exprimés par le bénéficiaire.
        - Modalités de déroulement convenues (dates: ${formatDate(beneficiaryData.bilanStartDate)} au ${formatDate(beneficiaryData.bilanEndDate)}, lieu(x), convention signée le ${formatDate(beneficiaryData.agreementDate)}).
        
        ## 2. Parcours Professionnel et Formation
        - Synthèse chronologique et analytique des expériences professionnelles marquantes.
        - Principaux diplômes et formations.
        - [Analyse consultant sur la dynamique du parcours à ajouter]

        ## 3. Compétences et Aptitudes Professionnelles et Personnelles
        - Identification et description des compétences techniques (savoir-faire) et transversales (savoir-être).
        - Aptitudes clés (autonomie, adaptation, etc.).
        - Éléments issus de l'auto-évaluation et des questionnaires (si disponibles).
        - [Validation et approfondissement par le consultant]

        ## 4. Intérêts Professionnels, Motivations et Valeurs
        - Synthèse des intérêts professionnels majeurs.
        - Analyse des principales sources de motivation au travail.
        - Valeurs professionnelles importantes.
        - [Synthèse des résultats des tests/questionnaires spécifiques à ajouter]

        ## 5. Identification du/des Projet(s) Professionnel(s)
        - Description détaillée du projet principal (et éventuellement alternatif) : ${beneficiaryData.careerObjectives || '[Projet principal à définir]'}
        - Analyse de la cohérence du projet avec le profil (compétences, intérêts, valeurs).
        - Évaluation de la faisabilité (opportunités marché, contraintes personnelles).
        - [Analyse approfondie et validation du projet par le consultant]

        ## 6. Principaux Atouts et Points de Vigilance
        - Récapitulatif des points forts du bénéficiaire en lien avec le projet.
        - Identification des freins potentiels et des points de vigilance.
        - Besoins en développement de compétences.

        ## 7. Conclusions Détaillées et Préconisations
        - Réponse argumentée à la demande initiale.
        - Facteurs susceptibles de favoriser la réalisation du projet.
        - Préconisations d'actions concrètes (formations, VAE, démarches réseau...). 
        - [Conclusion finale du consultant à ajouter]

        **Instruction Initiale:** Commence le document par: "[SYNTHÈSE DU BILAN DE COMPÉTENCES - ${new Date().toLocaleDateString('fr-FR')} - ÉBAUCHE IA À VALIDER]"
    `;

    try {
        console.log('Sending request to OpenAI for Synthesis...');
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "Tu es un expert en bilans de compétences et rédacteur de synthèses conformes Qualiopi." },
                { role: "user", content: prompt }
            ],
            temperature: 0.5,
            max_tokens: 1500
        });

        console.log('Received response from OpenAI.');
        return completion.choices[0].message.content.trim();

    } catch (error) {
        console.error("Error calling OpenAI API for Synthesis:", error);
        throw new Error('Erreur lors de la communication avec l\'API OpenAI pour la synthèse.');
    }
}

/**
 * Verilen bilgilere göre Aksiyon Planı taslağı oluşturur.
 * @param {object} beneficiaryData Yararlanıcı verileri.
 * @returns {Promise<string>} Oluşturulan aksiyon planı taslağı metni.
 */
async function generateActionPlanDraft(beneficiaryData) {
    if (!openai) return Promise.reject('OpenAI client non initialisé. Vérifiez la clé API.');

    const prompt = `
        **Tâche:** Rédiger une ébauche de **Plan d'Action** post-bilan de compétences, structuré et orienté **SMART**.
        Ce plan doit être concret et aider le bénéficiaire à passer à l'action.

        **Informations Disponibles:**
        - Bénéficiaire: ${beneficiaryData.user?.firstName || ''} ${beneficiaryData.user?.lastName || ''}
        - Projet(s) Retenu(s): ${beneficiaryData.careerObjectives || '[Projet principal à confirmer]'}
        - Préconisations issues de la Synthèse: ${beneficiaryData.synthesis ? extractRecommendations(beneficiaryData.synthesis) : 'Consulter la synthèse'}
        - Compétences à développer / Points de vigilance: (Se référer à la synthèse)

        **Structure Demandée (utiliser markdown gras ## et listes):**

        ## 1. Rappel du Projet Professionnel Principal
        - [Reformulation claire et concise de l'objectif professionnel validé]

        ## 2. Actions Prioritaires (Court Terme: 0-6 mois)
        *(Pour chaque action, définir Objectif SMART, Moyens, Échéance Précise, Indicateur de succès)*
        - **Action 1:** [Ex: Se renseigner sur la formation X]
            - *Objectif:* Obtenir le programme détaillé et les modalités de financement.
            - *Moyens:* Site web de l'organisme, contact téléphonique.
            - *Échéance:* JJ/MM/AAAA
            - *Indicateur:* Programme et devis reçus.
        - **Action 2:** [Ex: Contacter 3 professionnels du secteur Y]
            - *Objectif:* Mieux comprendre la réalité du métier et développer son réseau.
            - *Moyens:* LinkedIn, réseau personnel, annuaires.
            - *Échéance:* JJ/MM/AAAA
            - *Indicateur:* 3 entretiens informatifs réalisés.
        - **Action 3:** [Ex: Mettre à jour le CV]
            - *Objectif:* Adapter le CV au projet professionnel visé.
            - *Moyens:* Atelier CV, relecture par le consultant.
            - *Échéance:* JJ/MM/AAAA
            - *Indicateur:* CV finalisé et validé.
        - *[Générer 1-2 autres actions pertinentes basées sur les préconisations si possible]*

        ## 3. Actions Secondaires (Moyen Terme: 6-12 mois)
        - [Action 4]
        - [Action 5]

        ## 4. Ressources et Appuis
        - [Identifier contacts clés, organismes, aides financières...]

        ## 5. Modalités de Suivi
        - Point d'étape prévu avec le consultant le: [Date/Fréquence]
        - Entretien de suivi obligatoire à 6 mois le: ${formatDate(beneficiaryData.followUpDate)}

        **Instruction Initiale:** Commence par: "[PLAN D'ACTION POST-BILAN - ${new Date().toLocaleDateString('fr-FR')} - ÉBAUCHE IA À VALIDER ET PERSONNALISER]"
        Utilise un ton encourageant et motivant.
    `;

    try {
        console.log('Sending request to OpenAI for Action Plan...');
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "Tu es un coach professionnel expert en plans d'action SMART." },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 1000
        });
        console.log('Received response from OpenAI.');
        return completion.choices[0].message.content.trim();

    } catch (error) {
        console.error("Error calling OpenAI API for Action Plan:", error);
        throw new Error('Erreur lors de la communication avec l\'API OpenAI pour le plan d\'action.');
    }
}

// Anket cevaplarını özetleyen yardımcı fonksiyon (geliştirildi)
function summarizeAnswers(questionnaires) {
    if (!questionnaires || questionnaires.length === 0) return 'Aucun questionnaire pertinent trouvé.';

    let summaries = [];
    questionnaires.forEach(q => {
        if (q.status === 'completed' && q.questions && q.questions.length > 0) {
            let keyPoints = [];
            q.questions.forEach(question => {
                if (question.answers && question.answers.length > 0) {
                    const answerText = question.answers[0].answer;
                    keyPoints.push(`- ${question.text}: ${answerText.substring(0, 100)}${answerText.length > 100 ? '...' : ''}`);
                }
            });
            
            if (keyPoints.length > 0) {
                 summaries.push(`**Questionnaire '${q.title}' (${q.category || 'Non Catégorisé'}):**\n${keyPoints.join('\n')}`);
            }
        }
    });

    if (summaries.length === 0) {
        return 'Aucun questionnaire pertinent complété ou avec réponses trouvées.';
    }
    
    return summaries.join('\n\n');
}

// TODO: Sentezden önerileri çıkaran basit bir fonksiyon
function extractRecommendations(synthesisText) {
    if (!synthesisText) return '[Consulter la synthèse]';
    // Çok basit bir arama, gerçek senaryoda daha iyi bir NLP gerekebilir
    const match = synthesisText.match(/## 7\. Conclusion et Préconisations([\s\S]*)/);
    return match && match[1] ? match[1].trim().substring(0, 300) + '...' : '[Voir préconisations dans la synthèse]';
}

module.exports = {
    generateSynthesisDraft,
    generateActionPlanDraft
}; 

// script.js

// CODE DE PROTECTION

document.addEventListener('DOMContentLoaded', () => {

    // CODE DE PROTECTION
    const motDePasseRequis = '00A1';
    
    // Demande le mot de passe
    let motDePasseSaisi = prompt('Veuillez entrer le mot de passe pour accéder à l\'application.');

    // Si la saisie n'est PAS le mot de passe requis
    if (motDePasseSaisi !== motDePasseRequis) {
        
        alert('Mot de passe incorrect ou non saisi. Accès refusé !');
        
        // CORRECTION : Redirige vers l'URL de l'image de nature 🏞️
        // REMPLACEZ L'URL CI-DESSOUS par l'adresse réelle de votre image.
        window.location.replace("https://exemple.com/ma-belle-photo-nature.jpg"); 
        
        return; // Stoppe l'exécution
    }

    // Accès accordé
    alert('Accès accordé !');
    
    // Le reste du code de votre application continue ici
    // ...
});



























// 🛑 DÉFINITION DE L'URL DE L'API (Doit correspondre à Server + Port + Préfixe du backend)
const API_URL = 'http://localhost:3000/api'; 


// =======================================================
// INITIALISATION
// =======================================================

document.addEventListener('DOMContentLoaded', () => {
    // Afficher la première section active
    const activeSection = document.querySelector('.app-section.active');
    if (activeSection) {
        activeSection.style.display = 'block';
    }

    // Initialisation de l'heure et date
    updateDateTime();
    setInterval(updateDateTime, 1000);

    // Chargement initial des données depuis l'API
    fetchAndRenderAllData(); 
    
    // Initialisation des écouteurs de boutons d'impression
    const printBilanBtn = document.getElementById('printBilanBtn');
    const printButton = document.getElementById('printButton');
    if (printBilanBtn) printBilanBtn.addEventListener('click', printBilanReport);
    if (printButton) printButton.addEventListener('click', printDiagrammeReport);
});


// =======================================================
// VARIABLES GLOBALES (DOM ELEMENTS & DATA)
// =======================================================

// Champs de texte principaux
const responsableNameInput = document.getElementById('responsibleName');
const responsableAchatInput = document.getElementById('responsableAchat');

// Navigation
const navLinks = document.querySelectorAll('.sidebar-nav a');
const appSections = document.querySelectorAll('.app-section');

// Formulaires
const entrepriseForm = document.getElementById('entrepriseForm');
const achatForm = document.getElementById('achatForm');
const resteUtiliserForm = document.getElementById('resteUtiliserForm');
const fournisseurForm = document.getElementById('fournisseurForm');

// Tables
const entrepriseTableBody = document.querySelector('#entrepriseTable tbody');
const achatTableBody = document.querySelector('#achatTable tbody');
const resteUtiliserTableBody = document.querySelector('#resteUtiliserTable tbody');
const fournisseursTableBody = document.querySelector('#fournisseursTable tbody');

// Champs de formulaire spécifiques
const achatTypeEntrepriseSelect = document.getElementById('achatTypeEntreprise');
const resteUtiliserTypeEntrepriseSelect = document.getElementById('resteUtiliserTypeEntreprise');
const bilanTypeEntrepriseSelect = document.getElementById('bilanTypeEntreprise');
const diagrammeTypeEntrepriseSelect = document.getElementById('diagrammeTypeEntreprise');
const montantAchatInput = document.getElementById('montantAchat');
const coutMatierePremiereInput = document.getElementById('coutMatierePremiere');
const coutTransportInput = document.getElementById('coutTransport');
const autresDepensesInput = document.getElementById('autresDepenses');
const resteArgentInput = document.getElementById('resteArgent');
const montantUtiliseInput = document.getElementById('montantUtilise');
const montantResteTotalInput = document.getElementById('montantResteTotal');
const resteArgentFinalInput = document.getElementById('resteArgentFinal');


// 🛑 DONNÉES GLOBALES (Remplies par l'API)
let entrepriseData = []; 
let achatData = []; 
let resteUtiliserData = []; 
let fournisseurData = []; 


// =======================================================
// FONCTION DE CHARGEMENT ET RENDU DES DONNÉES (GET)
// =======================================================

/**
 * Récupère toutes les données de l'API et met à jour l'interface utilisateur.
 */
async function fetchAndRenderAllData() {
    try {
        const [resEntreprise, resAchat, resReste, resFournisseur] = await Promise.all([
            fetch(`${API_URL}/entreprises`),
            fetch(`${API_URL}/achats`),
            fetch(`${API_URL}/restes`),
            fetch(`${API_URL}/fournisseurs`)
        ]);

        // Assurez-vous que les réponses sont OK avant de parser
        if (!resEntreprise.ok || !resAchat.ok || !resReste.ok || !resFournisseur.ok) {
            throw new Error('Une des requêtes API a échoué. Statuts: ' + 
                            `${resEntreprise.status}, ${resAchat.status}, ${resReste.status}, ${resFournisseur.status}`);
        }

        entrepriseData = await resEntreprise.json();
        achatData = await resAchat.json();
        resteUtiliserData = await resReste.json();
        fournisseurData = await resFournisseur.json();

        // Rendu et mises à jour de l'UI
        renderEntrepriseData();
        renderAchatData();
        renderResteUtiliserData();
        renderFournisseurData();
        
        populateEntrepriseSelects();
        updateDashboardMetrics();
        updateNextReportNumbers();

        // Mettre à jour les champs "Reste" si l'utilisateur est sur cette section
        if (resteUtiliserTypeEntrepriseSelect && resteUtiliserTypeEntrepriseSelect.value) {
            updateResteUtiliserFields();
        }

    } catch (error) {
        console.error("Erreur critique lors du chargement des données initiales:", error);
        alert(`Erreur de connexion à l'API. Assurez-vous que le serveur Express est en cours d'exécution sur ${API_URL}. Détail : ${error.message}`);
    }
}

// =======================================================
// NAVIGATION ET UTILITAIRES
// =======================================================

// Navigation et affichage des sections
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = e.target.closest('a').dataset.navTarget;
        
        navLinks.forEach(l => l.classList.remove('active'));
        e.target.closest('a').classList.add('active');

        appSections.forEach(section => {
            section.style.display = 'none';
        });
        document.getElementById(targetId).style.display = 'block';

        if (targetId === 'achat' && responsableAchatInput && responsableNameInput) {
            // Synchronisation du nom du responsable
            responsableAchatInput.value = responsableNameInput.value;
        }

        if (targetId === 'dashboard') {
            updateDashboardMetrics();
        } else if (targetId === 'bilans' || targetId === 'diagrammes') {
            populateEntrepriseSelects();
        }
    });
});

/** Met à jour la date et l'heure en temps réel */
function updateDateTime() {
    const now = new Date();
    const currentDateElement = document.getElementById('currentDate');
    const currentTimeElement = document.getElementById('currentTime');

    if (currentDateElement) currentDateElement.textContent = now.toLocaleDateString('fr-FR');
    if (currentTimeElement) currentTimeElement.textContent = now.toLocaleTimeString('fr-FR');
}

/** Met à jour les numéros de rapport basés sur la taille des données de l'API */
function updateNextReportNumbers() {
    if (document.getElementById('numeroRapportAchat')) document.getElementById('numeroRapportAchat').value = `RA${achatData.length + 1}`;
    if (document.getElementById('numeroRapportReste')) document.getElementById('numeroRapportReste').value = `RR${resteUtiliserData.length + 1}`;
    if (document.getElementById('numeroRapportFournisseur')) document.getElementById('numeroRapportFournisseur').value = `RF${fournisseurData.length + 1}`;
}

/** Remplit les <select> d'entreprise avec les données de l'API */
function populateEntrepriseSelects() {
    const selects = [achatTypeEntrepriseSelect, resteUtiliserTypeEntrepriseSelect, bilanTypeEntrepriseSelect, diagrammeTypeEntrepriseSelect].filter(s => s);
    selects.forEach(select => {
        const selectedValue = select.value;
        select.innerHTML = '<option value="">Sélectionner</option>';
        entrepriseData.forEach(entreprise => {
            const option = document.createElement('option');
            option.value = entreprise.nom;
            option.textContent = entreprise.nom;
            select.appendChild(option);
        });
        select.value = selectedValue;
    });
}

/** Formate une chaîne de date en format local (fr-FR) */
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; 
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}


// =======================================================
// GESTION DES FORMULAIRES (POST vers l'API)
// =======================================================

// 1. ENTREPRISE
if (entrepriseForm) entrepriseForm.addEventListener('submit', async (e) => { 
    e.preventDefault();
    
    const newEntrepriseData = {
        nom: document.getElementById('entrepriseNom').value,
        directeur: document.getElementById('directeurCommercial').value,
        budget: parseFloat(document.getElementById('budgetMensuel').value),
        date: document.getElementById('dateEntreprise').value 
    };

    try {
        const response = await fetch(`${API_URL}/entreprises`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newEntrepriseData) 
        });

        const data = await response.json();

        if (response.ok) {
            alert(`Entreprise "${data.nom}" enregistrée avec succès !`);
            entrepriseForm.reset();
            await fetchAndRenderAllData(); // Recharger toutes les données
        } else {
            console.error("Erreur API:", data.error);
            alert(`Échec de l'enregistrement : ${data.message || data.error || 'Erreur inconnue'}. Vérifiez la console.`);
        }
    } catch (error) {
        console.error("Erreur réseau/connexion:", error);
        alert("Impossible de communiquer avec le serveur API.");
    }
});


// 2. ACHAT
if (achatForm) achatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const montantAchat = parseFloat(montantAchatInput.value) || 0;
    const coutMatierePremiere = parseFloat(coutMatierePremiereInput.value) || 0;
    const coutTransport = parseFloat(coutTransportInput.value) || 0;
    const autresDepenses = parseFloat(autresDepensesInput.value) || 0;

    // CALCUL DE resteArgent
    const resteArgentCalculated = montantAchat - (coutMatierePremiere + coutTransport + autresDepenses);

    const newAchatData = {
        numeroRapport: document.getElementById('numeroRapportAchat').value,
        montantAchat: montantAchat,
        entreprise: achatTypeEntrepriseSelect.value,
        coutMatierePremiere: coutMatierePremiere,
        coutTransport: coutTransport,
        autresDepenses: autresDepenses,
        resteArgent: resteArgentCalculated, // <-- ENVOI DU CHAMP CALCULÉ
        responsable: responsableNameInput.value,
        justificatifs: document.getElementById('justificatifsAchat').value,
        date: new Date().toISOString().split('T')[0] // Date du jour
    };

    try {
        const response = await fetch(`${API_URL}/achats`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newAchatData)
        });

        const data = await response.json();

        if (response.ok) {
            alert(`Achat N° ${data.numeroRapport} enregistré avec succès !`);
            achatForm.reset();
            await fetchAndRenderAllData();
        } else {
            console.error("Erreur API:", data.error);
            alert(`Échec de l'enregistrement : ${data.message || data.error || 'Erreur inconnue'}.`);
        }
    } catch (error) {
        console.error("Erreur réseau/connexion:", error);
        alert("Impossible de communiquer avec le serveur API.");
    }
});

// Calcul dynamique du reste d'argent dans le formulaire d'achat
[montantAchatInput, coutMatierePremiereInput, coutTransportInput, autresDepensesInput].filter(i => i).forEach(input => {
    input.addEventListener('input', () => {
        const montantAchat = parseFloat(montantAchatInput.value) || 0;
        const coutMatierePremiere = parseFloat(coutMatierePremiereInput.value) || 0;
        const coutTransport = parseFloat(coutTransportInput.value) || 0;
        const autresDepenses = parseFloat(autresDepensesInput.value) || 0;
        const resteArgent = montantAchat - (coutMatierePremiere + coutTransport + autresDepenses);
        if (resteArgentInput) resteArgentInput.value = resteArgent.toFixed(2);
    });
});


// 3. RESTE UTILISÉ
if (resteUtiliserForm) resteUtiliserForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const entreprise = resteUtiliserTypeEntrepriseSelect.value;
    const montantUtilise = parseFloat(montantUtiliseInput.value) || 0;
    
    // Récupérer les valeurs calculées dynamiquement pour Mongoose
    const montantResteTotalCalculated = parseFloat(montantResteTotalInput.value) || 0;
    const resteArgentFinalCalculated = parseFloat(resteArgentFinalInput.value) || 0;

    // Validation (pour éviter d'enregistrer des restes négatifs)
    if (resteArgentFinalCalculated < 0) {
        alert("Erreur: Le montant utilisé dépasse le reste disponible.");
        return;
    }

    const newResteData = {
        numeroRapport: document.getElementById('numeroRapportReste').value,
        entreprise: entreprise,
        mois: document.getElementById('moisReste').value,
        montantUtilise: montantUtilise,
        date: document.getElementById('dateReste').value,
        justificatifs: document.getElementById('justificatifsReste').value,
        montantResteTotal: montantResteTotalCalculated, // ENVOI DU CHAMP CALCULÉ
        resteArgentFinal: resteArgentFinalCalculated // ENVOI DU CHAMP CALCULÉ
    };

    try {
        const response = await fetch(`${API_URL}/restes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newResteData)
        });

        const data = await response.json();

        if (response.ok) {
            alert(`Dépense sur reste N° ${data.numeroRapport} enregistrée avec succès !`);
            resteUtiliserForm.reset();
            await fetchAndRenderAllData();
        } else {
            console.error("Erreur API:", data.error);
            alert(`Échec de l'enregistrement : ${data.message || data.error || 'Erreur inconnue'}.`);
        }
    } catch (error) {
        console.error("Erreur réseau/connexion:", error);
        alert("Impossible de communiquer avec le serveur API.");
    }
});

// Mettre à jour le champ Reste Total dynamiquement
if (resteUtiliserTypeEntrepriseSelect) resteUtiliserTypeEntrepriseSelect.addEventListener('change', updateResteUtiliserFields);
if (montantUtiliseInput) montantUtiliseInput.addEventListener('input', updateResteUtiliserFields);

/**
 * Calcule le montant total restant et le reste final en se basant sur les données API
 */
function updateResteUtiliserFields() {
    if (!resteUtiliserTypeEntrepriseSelect || !montantUtiliseInput || !montantResteTotalInput || !resteArgentFinalInput) return;

    const entreprise = resteUtiliserTypeEntrepriseSelect.value;
    const montantUtilise = parseFloat(montantUtiliseInput.value) || 0;

    // 1. Calcul du montant Reste Total initial (Somme de tous les restes des achats pour cette entreprise)
    const montantResteTotal = achatData
        .filter(a => a.entreprise === entreprise)
        .reduce((sum, a) => sum + a.resteArgent, 0);

    // 2. Calcul du total déjà dépensé sur le reste (Somme de tous les "restes utilisés" précédents)
    const totalResteUsed = resteUtiliserData
        .filter(r => r.entreprise === entreprise)
        .reduce((sum, r) => sum + r.montantUtilise, 0);

    // 3. Calcul du Reste Argent Final
    const resteArgentFinal = montantResteTotal - totalResteUsed - montantUtilise;

    montantResteTotalInput.value = montantResteTotal.toFixed(2);
    resteArgentFinalInput.value = resteArgentFinal.toFixed(2);
}


// 4. FOURNISSEUR
if (fournisseurForm) fournisseurForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const newFournisseurData = {
        numeroRapport: document.getElementById('numeroRapportFournisseur').value,
        nom: document.getElementById('fournisseurNomPrenom').value,
        phone: document.getElementById('fournisseurPhone').value,
        adresse: document.getElementById('fournisseurAdresse').value
    };

    try {
        const response = await fetch(`${API_URL}/fournisseurs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newFournisseurData) 
        });

        const data = await response.json();

        if (response.ok) {
            alert(`Fournisseur N° ${data.numeroRapport} enregistré avec succès !`);
            fournisseurForm.reset();
            await fetchAndRenderAllData(); 
        } else {
            console.error("Erreur API:", data.error);
            alert(`Échec de l'enregistrement : ${data.message || data.error || 'Erreur inconnue'}.`);
        }
    } catch (error) {
        console.error("Erreur réseau/connexion:", error);
        alert("Impossible de communiquer avec le serveur API.");
    }
});


// =======================================================
// RENDU DES TABLEAUX
// =======================================================

function renderEntrepriseData() {
    if (!entrepriseTableBody) return;
    entrepriseTableBody.innerHTML = '';
    entrepriseData.forEach((data) => { 
        const row = entrepriseTableBody.insertRow();
        row.innerHTML = `
            <td>${data.nom}</td>
            <td>${data.directeur}</td>
            <td>${(data.budget || 0).toLocaleString('fr-FR')} FCFA</td>
            <td>${formatDate(data.date)}</td>
            <td>
                <button class="delete-btn" onclick="deleteEntreprise('${data.nom}')">Supprimer</button>
            </td>
        `;
    });
}

function renderAchatData() {
    if (!achatTableBody) return;
    achatTableBody.innerHTML = '';
    // Filtrage optionnel par entreprise (si le sélecteur est utilisé)
    const filterValue = achatTypeEntrepriseSelect ? achatTypeEntrepriseSelect.value : '';
    const filteredData = achatData.filter(achat => achat.entreprise === filterValue || !filterValue);

    filteredData.forEach((data) => { 
        const row = achatTableBody.insertRow();
        row.innerHTML = `
            <td>${data.numeroRapport}</td>
            <td>${(data.montantAchat || 0).toLocaleString('fr-FR')}</td>
            <td>${data.entreprise}</td>
            <td>${(data.coutMatierePremiere || 0).toLocaleString('fr-FR')}</td>
            <td>${(data.resteArgent || 0).toLocaleString('fr-FR')}</td>
            <td>${(data.coutTransport || 0).toLocaleString('fr-FR')}</td>
            <td>${(data.autresDepenses || 0).toLocaleString('fr-FR')}</td>
            <td>${data.responsable}</td>
            <td>${data.justificatifs}</td>
            <td>
                <button class="delete-btn" onclick="deleteAchat('${data.numeroRapport}')">Supprimer</button>
            </td>
        `;
    });
}

function renderResteUtiliserData() {
    if (!resteUtiliserTableBody) return;
    resteUtiliserTableBody.innerHTML = '';
    resteUtiliserData.forEach((data) => {
        const row = resteUtiliserTableBody.insertRow();
        row.innerHTML = `
            <td>${data.numeroRapport}</td>
            <td>${data.entreprise}</td>
            <td>${data.mois}</td>
            <td>${(data.montantUtilise || 0).toLocaleString('fr-FR')}</td>
            <td>${formatDate(data.date)}</td>
            <td>${data.justificatifs}</td>
            <td>${(data.montantResteTotal || 0).toLocaleString('fr-FR')}</td>
            <td>${(data.resteArgentFinal || 0).toLocaleString('fr-FR')}</td>
            <td>
                <button class="delete-btn" onclick="deleteResteUtiliser('${data.numeroRapport}')">Supprimer</button>
            </td>
        `;
    });
}

function renderFournisseurData() {
    if (!fournisseursTableBody) return;
    fournisseursTableBody.innerHTML = '';
    fournisseurData.forEach((data) => { 
        const row = fournisseursTableBody.insertRow();
        row.innerHTML = `
            <td>${data.numeroRapport}</td>
            <td>${data.nom}</td>
            <td>${data.phone}</td>
            <td>${data.adresse}</td>
            <td>
                <button class="delete-btn" onclick="deleteFournisseur('${data.numeroRapport}')">Supprimer</button>
            </td>
        `;
    });
}


// =======================================================
// FONCTIONS DE SUPPRESSION (DELETE vers l'API)
// =======================================================

/**
 * Fonction générique pour envoyer une requête DELETE à l'API.
 * @param {string} endpoint - L'endpoint de l'API (ex: 'entreprises')
 * @param {string} identifier - L'identifiant unique (nom ou numeroRapport)
 * @param {string} successMessage - Description de l'élément pour la confirmation
 */
async function deleteData(endpoint, identifier, successMessage) {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${successMessage} ? Cette action est irréversible.`)) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${endpoint}/${identifier}`, {
            method: 'DELETE',
        });

        if (response.status === 204) { // 204 No Content est la réponse standard pour DELETE
            alert(`Suppression de ${successMessage} réussie.`);
            await fetchAndRenderAllData(); // Recharger les données après suppression
        } else if (response.status === 404) {
            alert(`Élément introuvable sur le serveur.`);
        } else {
            const errorData = await response.json();
            alert(`Échec de la suppression : ${errorData.message || 'Erreur serveur.'}`);
        }
    } catch (error) {
        console.error("Erreur réseau lors de la suppression:", error);
        alert("Impossible de communiquer avec le serveur API pour la suppression.");
    }
}

// Les fonctions spécifiques appellent la fonction générique
window.deleteEntreprise = (nom) => deleteData('entreprises', nom, `l'entreprise ${nom}`);
window.deleteAchat = (numeroRapport) => deleteData('achats', numeroRapport, `l'achat N° ${numeroRapport}`);
window.deleteResteUtiliser = (numeroRapport) => deleteData('restes', numeroRapport, `la dépense sur reste N° ${numeroRapport}`);
window.deleteFournisseur = (numeroRapport) => deleteData('fournisseurs', numeroRapport, `le fournisseur N° ${numeroRapport}`);

// =======================================================
// DASHBOARD ET IMPRESSION (MOCK/LOGIQUE FRONTEND)
// =======================================================

function updateDashboardMetrics() {
    // Calcul du budget total
    const totalBudget = entrepriseData.reduce((sum, e) => sum + e.budget, 0);

    // Calcul du montant total des achats
    const totalAchat = achatData.reduce((sum, a) => sum + a.montantAchat, 0);

    // Calcul du reste total disponible (somme des "resteArgent" des achats - somme des "montantUtilise" des restes)
    const totalResteAchat = achatData.reduce((sum, a) => sum + a.resteArgent, 0);
    const totalResteUtilise = resteUtiliserData.reduce((sum, r) => r.montantUtilise + sum, 0);

    const resteNetTotal = totalResteAchat - totalResteUtilise;

    if (document.getElementById('totalEntreprises')) document.getElementById('totalEntreprises').textContent = entrepriseData.length;
    if (document.getElementById('totalBudget')) document.getElementById('totalBudget').textContent = totalBudget.toLocaleString('fr-FR') + ' FCFA';
    if (document.getElementById('totalAchats')) document.getElementById('totalAchats').textContent = totalAchat.toLocaleString('fr-FR') + ' FCFA';
    if (document.getElementById('resteNetTotal')) document.getElementById('resteNetTotal').textContent = resteNetTotal.toLocaleString('fr-FR') + ' FCFA';
}

function printBilanReport() {
    alert("Fonction d'impression du Bilan à implémenter.");
}

function printDiagrammeReport() {
    alert("Fonction d'impression du Diagramme à implémenter.");
}
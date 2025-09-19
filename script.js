// Variables globales
const responsableNameInput = document.getElementById('responsibleName');
const responsableAchatInput = document.getElementById('responsableAchat');

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

// Champs de formulaire
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

// Boutons d'impression
const printBilanBtn = document.getElementById('printBilanBtn');
const printButton = document.getElementById('printButton');

// Données stockées localement
let entrepriseData = JSON.parse(localStorage.getItem('entrepriseData')) || [];
let achatData = JSON.parse(localStorage.getItem('achatData')) || [];
let resteUtiliserData = JSON.parse(localStorage.getItem('resteUtiliserData')) || [];
let fournisseurData = JSON.parse(localStorage.getItem('fournisseurData')) || [];

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Affiche la première section active (Tableau de bord par défaut)
    const activeSection = document.querySelector('.app-section.active');
    if (activeSection) {
        activeSection.style.display = 'block';
    }

    updateDateTime();
    setInterval(updateDateTime, 1000);

    // ✅ Appels pour afficher les données dès le chargement de la page
    renderEntrepriseData();
    renderAchatData();
    renderResteUtiliserData();
    renderFournisseurData();
    
    populateEntrepriseSelects();
    updateDashboardMetrics();
    updateNextReportNumbers();
    
    // Ajout des écouteurs d'événements pour l'impression
    printBilanBtn.addEventListener('click', printBilanReport);
    printButton.addEventListener('click', printDiagrammeReport);
});


// Navigation et affichage des sections
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = e.target.closest('a').dataset.navTarget;
        
        // Mettre à jour la classe "active" pour la navigation
        navLinks.forEach(l => l.classList.remove('active'));
        e.target.closest('a').classList.add('active');

        // Afficher la section cible et cacher les autres
        appSections.forEach(section => {
            section.style.display = 'none';
        });
        document.getElementById(targetId).style.display = 'block';

        // Synchroniser le nom du responsable si on est sur la section "Achats"
        if (targetId === 'achat') {
            responsableAchatInput.value = responsableNameInput.value;
        }

        // Mettre à jour l'affichage des données
        if (targetId === 'dashboard') {
            updateDashboardMetrics();
        } else if (targetId === 'bilans') {
            populateEntrepriseSelects();
        } else if (targetId === 'diagrammes') {
            populateEntrepriseSelects();
        }
    });
});

// Fonctions utilitaires
function updateDateTime() {
    const now = new Date();
    document.getElementById('currentDate').textContent = now.toLocaleDateString('fr-FR');
    document.getElementById('currentTime').textContent = now.toLocaleTimeString('fr-FR');
}

function updateNextReportNumbers() {
    document.getElementById('numeroRapportAchat').value = `RA${achatData.length + 1}`;
    document.getElementById('numeroRapportReste').value = `RR${resteUtiliserData.length + 1}`;
    document.getElementById('numeroRapportFournisseur').value = `RF${fournisseurData.length + 1}`;
}

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function populateEntrepriseSelects() {
    const selects = [achatTypeEntrepriseSelect, resteUtiliserTypeEntrepriseSelect, bilanTypeEntrepriseSelect, diagrammeTypeEntrepriseSelect];
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

function formatDate(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

// Gestion des formulaires et des données
entrepriseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const entreprise = document.getElementById('entrepriseNom').value;
    const directeur = document.getElementById('directeurCommercial').value;
    const budget = parseFloat(document.getElementById('budgetMensuel').value);
    const date = document.getElementById('dateEntreprise').value;

    const newEntreprise = { nom: entreprise, directeur: directeur, budget: budget, date: date };
    entrepriseData.push(newEntreprise);
    saveData('entrepriseData', entrepriseData);
    renderEntrepriseData();
    populateEntrepriseSelects();
    entrepriseForm.reset();
});

achatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const numeroRapport = document.getElementById('numeroRapportAchat').value;
    const montantAchat = parseFloat(montantAchatInput.value);
    const entreprise = achatTypeEntrepriseSelect.value;
    const coutMatierePremiere = parseFloat(coutMatierePremiereInput.value);
    const coutTransport = parseFloat(coutTransportInput.value) || 0;
    const autresDepenses = parseFloat(autresDepensesInput.value) || 0;
    const responsable = responsableNameInput.value; // Champ responsable automatique
    const justificatifs = document.getElementById('justificatifsAchat').value;

    const resteArgent = montantAchat - (coutMatierePremiere + coutTransport + autresDepenses);

    const newAchat = {
        numeroRapport,
        montantAchat,
        entreprise,
        coutMatierePremiere,
        coutTransport,
        autresDepenses,
        resteArgent,
        responsable,
        justificatifs,
        date: new Date().toISOString().split('T')[0] // Ajout de la date de l'achat
    };

    achatData.push(newAchat);
    saveData('achatData', achatData);
    renderAchatData();
    achatForm.reset();
    updateNextReportNumbers();
    updateDashboardMetrics();
});

// Calcul dynamique du reste d'argent dans le formulaire d'achat
[montantAchatInput, coutMatierePremiereInput, coutTransportInput, autresDepensesInput].forEach(input => {
    input.addEventListener('input', () => {
        const montantAchat = parseFloat(montantAchatInput.value) || 0;
        const coutMatierePremiere = parseFloat(coutMatierePremiereInput.value) || 0;
        const coutTransport = parseFloat(coutTransportInput.value) || 0;
        const autresDepenses = parseFloat(autresDepensesInput.value) || 0;
        const resteArgent = montantAchat - (coutMatierePremiere + coutTransport + autresDepenses);
        resteArgentInput.value = resteArgent.toFixed(2);
    });
});

resteUtiliserForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const numeroRapport = document.getElementById('numeroRapportReste').value;
    const entreprise = resteUtiliserTypeEntrepriseSelect.value;
    const mois = document.getElementById('moisReste').value;
    const montantUtilise = parseFloat(montantUtiliseInput.value);
    const date = document.getElementById('dateReste').value;
    const justificatifs = document.getElementById('justificatifsReste').value;

    // Calcul du Montant du Reste Total basé sur l'historique des achats
    const montantResteTotal = achatData
        .filter(a => a.entreprise === entreprise)
        .reduce((sum, a) => sum + a.resteArgent, 0);

    // Calcul du Reste d'Argent Final
    const totalResteUsed = resteUtiliserData
        .filter(r => r.entreprise === entreprise)
        .reduce((sum, r) => sum + r.montantUtilise, 0);

    const resteArgentFinal = montantResteTotal - totalResteUsed - montantUtilise;

    const newReste = {
        numeroRapport,
        entreprise,
        mois,
        montantUtilise,
        date,
        justificatifs,
        montantResteTotal,
        resteArgentFinal
    };

    resteUtiliserData.push(newReste);
    saveData('resteUtiliserData', resteUtiliserData);
    renderResteUtiliserData();
    resteUtiliserForm.reset();
    updateNextReportNumbers();
    updateDashboardMetrics();
    updateResteUtiliserFields();
});

// Mettre à jour le champ Reste Total dynamiquement
resteUtiliserTypeEntrepriseSelect.addEventListener('change', () => {
    updateResteUtiliserFields();
});

montantUtiliseInput.addEventListener('input', () => {
    updateResteUtiliserFields();
});

function updateResteUtiliserFields() {
    const entreprise = resteUtiliserTypeEntrepriseSelect.value;
    const montantUtilise = parseFloat(montantUtiliseInput.value) || 0;

    const montantResteTotal = achatData
        .filter(a => a.entreprise === entreprise)
        .reduce((sum, a) => sum + a.resteArgent, 0);

    const totalResteUsed = resteUtiliserData
        .filter(r => r.entreprise === entreprise)
        .reduce((sum, r) => sum + r.montantUtilise, 0);

    const resteArgentFinal = montantResteTotal - totalResteUsed - montantUtilise;

    document.getElementById('montantResteTotal').value = montantResteTotal.toFixed(2);
    document.getElementById('resteArgentFinal').value = resteArgentFinal.toFixed(2);
}

fournisseurForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const numeroRapport = document.getElementById('numeroRapportFournisseur').value;
    const nom = document.getElementById('fournisseurNomPrenom').value;
    const phone = document.getElementById('fournisseurPhone').value;
    const adresse = document.getElementById('fournisseurAdresse').value;

    const newFournisseur = { numeroRapport, nom, phone, adresse };
    fournisseurData.push(newFournisseur);
    saveData('fournisseurData', fournisseurData);
    renderFournisseurData();
    fournisseurForm.reset();
    updateNextReportNumbers();
});

// Rendu des tableaux
function renderEntrepriseData() {
    entrepriseTableBody.innerHTML = '';
    entrepriseData.forEach((data, index) => {
        const row = entrepriseTableBody.insertRow();
        row.innerHTML = `
            <td>${data.nom}</td>
            <td>${data.directeur}</td>
            <td>${data.budget.toLocaleString('fr-FR')} FCFA</td>
            <td>${formatDate(data.date)}</td>
            <td>
                <button class="delete-btn" onclick="deleteEntreprise(${index})">Supprimer</button>
            </td>
        `;
    });
}

function renderAchatData() {
    achatTableBody.innerHTML = '';
    const filteredData = achatData.filter(achat => achat.entreprise === achatTypeEntrepriseSelect.value || !achatTypeEntrepriseSelect.value);
    filteredData.forEach((data, index) => {
        const row = achatTableBody.insertRow();
        row.innerHTML = `
            <td>${data.numeroRapport}</td>
            <td>${data.montantAchat.toLocaleString('fr-FR')}</td>
            <td>${data.entreprise}</td>
            <td>${data.coutMatierePremiere.toLocaleString('fr-FR')}</td>
            <td>${data.resteArgent.toLocaleString('fr-FR')}</td>
            <td>${(data.coutTransport || 0).toLocaleString('fr-FR')}</td>
            <td>${(data.autresDepenses || 0).toLocaleString('fr-FR')}</td>
            <td>${data.responsable}</td>
            <td>${data.justificatifs}</td>
            <td>
                <button class="delete-btn" onclick="deleteAchat(${index})">Supprimer</button>
            </td>
        `;
    });
}

function renderResteUtiliserData() {
    resteUtiliserTableBody.innerHTML = '';
    resteUtiliserData.forEach((data, index) => {
        const row = resteUtiliserTableBody.insertRow();
        row.innerHTML = `
            <td>${data.numeroRapport}</td>
            <td>${data.entreprise}</td>
            <td>${data.mois}</td>
            <td>${data.montantUtilise.toLocaleString('fr-FR')}</td>
            <td>${formatDate(data.date)}</td>
            <td>${data.justificatifs}</td>
            <td>${data.montantResteTotal.toLocaleString('fr-FR')}</td>
            <td>${data.resteArgentFinal.toLocaleString('fr-FR')}</td>
            <td>
                <button class="delete-btn" onclick="deleteResteUtiliser(${index})">Supprimer</button>
            </td>
        `;
    });
}

function renderFournisseurData() {
    fournisseursTableBody.innerHTML = '';
    fournisseurData.forEach((data, index) => {
        const row = fournisseursTableBody.insertRow();
        row.innerHTML = `
            <td>${data.numeroRapport}</td>
            <td>${data.nom}</td>
            <td>${data.phone}</td>
            <td>${data.adresse}</td>
            <td>
                <button class="delete-btn" onclick="deleteFournisseur(${index})">Supprimer</button>
            </td>
        `;
    });
}

// Fonctions de suppression
function deleteEntreprise(index) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette entreprise ?")) {
        entrepriseData.splice(index, 1);
        saveData('entrepriseData', entrepriseData);
        renderEntrepriseData();
        populateEntrepriseSelects();
    }
}

function deleteAchat(index) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet achat ?")) {
        achatData.splice(index, 1);
        saveData('achatData', achatData);
        renderAchatData();
        updateDashboardMetrics();
    }
}

function deleteResteUtiliser(index) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette dépense ?")) {
        resteUtiliserData.splice(index, 1);
        saveData('resteUtiliserData', resteUtiliserData);
        renderResteUtiliserData();
        updateDashboardMetrics();
    }
}

function deleteFournisseur(index) {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce fournisseur ?")) {
        fournisseurData.splice(index, 1);
        saveData('fournisseurData', fournisseurData);
        renderFournisseurData();
    }
}

// Mettre à jour les métriques du tableau de bord
function updateDashboardMetrics() {
    const totalBudget = entrepriseData.reduce((sum, e) => sum + e.budget, 0);
    const totalExpenses = achatData.reduce((sum, a) => sum + a.montantAchat, 0);
    const totalResteUsed = resteUtiliserData.reduce((sum, r) => sum + r.montantUtilise, 0);
    const totalRemaining = totalBudget - (totalExpenses + totalResteUsed);
    const totalTransport = achatData.reduce((sum, a) => sum + (a.coutTransport || 0), 0);
    const totalOtherExpenses = achatData.reduce((sum, a) => sum + (a.autresDepenses || 0), 0);

    document.getElementById('dashboardMonthlyBudgetTotal').textContent = totalBudget.toLocaleString('fr-FR') + ' FCFA';
    document.getElementById('dashboardMonthlyExpensesTotal').textContent = totalExpenses.toLocaleString('fr-FR') + ' FCFA';
    document.getElementById('dashboardMonthlyRemainingFunds').textContent = totalRemaining.toLocaleString('fr-FR') + ' FCFA';
    document.getElementById('dashboardMonthlyTransportCost').textContent = totalTransport.toLocaleString('fr-FR') + ' FCFA';
    document.getElementById('dashboardMonthlyOtherExpenses').textContent = totalOtherExpenses.toLocaleString('fr-FR') + ' FCFA';
}

// Code pour les bilans (modifié)
document.getElementById('generateBilanBtn').addEventListener('click', () => {
    const mois = document.getElementById('bilanPeriodFilter').value;
    const annee = document.getElementById('bilanAnnee').value;
    const entreprise = document.getElementById('bilanTypeEntreprise').value;
    
    const filteredAchats = achatData.filter(a => {
        const achatDate = new Date(a.date);
        return (new Date(achatDate).getFullYear() == annee) && (achatDate.toLocaleString('fr-FR', { month: 'long' }).toLowerCase() == mois.toLowerCase()) && (a.entreprise === entreprise || !entreprise);
    });

    const filteredRestes = resteUtiliserData.filter(r => {
        const resteDate = new Date(r.date);
        return (new Date(resteDate).getFullYear() == annee) && (r.mois.toLowerCase() == mois.toLowerCase()) && (r.entreprise === entreprise || !entreprise);
    });

    const totalAchat = filteredAchats.reduce((sum, a) => sum + a.montantAchat, 0);
    const totalResteUtilise = filteredRestes.reduce((sum, r) => sum + r.montantUtilise, 0);
    const totalGeneral = totalAchat + totalResteUtilise;
    const totalResteTotal = filteredAchats.reduce((sum, a) => sum + a.resteArgent, 0);
    const totalResteArgentFinal = totalResteTotal - totalResteUtilise;

    let bilanHTML = `
        <h3>Bilan Financier de ${entreprise || 'Toutes les entreprises'} - ${mois.charAt(0).toUpperCase() + mois.slice(1)} ${annee}</h3>
        <table class="bilan-table">
            <tr>
                <td>Total des Achats:</td>
                <td>${totalAchat.toLocaleString('fr-FR')} FCFA</td>
            </tr>
            <tr>
                <td>Total des Dépenses sur Reste:</td>
                <td>${totalResteUtilise.toLocaleString('fr-FR')} FCFA</td>
            </tr>
            <tr>
                <td>Montant du Reste Total:</td>
                <td>${totalResteTotal.toLocaleString('fr-FR')} FCFA</td>
            </tr>
            <tr>
                <td>Reste d'Argent Final:</td>
                <td>${totalResteArgentFinal.toLocaleString('fr-FR')} FCFA</td>
            </tr>
            <tr>
                <th>Total des Dépenses Générales:</th>
                <th>${totalGeneral.toLocaleString('fr-FR')} FCFA</th>
            </tr>
        </table>
    `;
    document.getElementById('bilanOutput').innerHTML = bilanHTML;
});

// Code pour les diagrammes (modifié)
document.getElementById('generateDiagrammeBtn').addEventListener('click', () => {
    const mois = document.getElementById('diagrammeMois').value;
    const annee = document.getElementById('diagrammeAnnee').value;
    const entreprise = document.getElementById('diagrammeTypeEntreprise').value;

    const filteredAchats = achatData.filter(a => {
        const achatDate = new Date(a.date);
        return (new Date(achatDate).getFullYear() == annee) && (achatDate.toLocaleString('fr-FR', { month: 'long' }).toLowerCase() == mois.toLowerCase()) && (a.entreprise === entreprise || !entreprise);
    });

    const filteredRestes = resteUtiliserData.filter(r => {
        const resteDate = new Date(r.date);
        return (new Date(resteDate).getFullYear() == annee) && (r.mois.toLowerCase() == mois.toLowerCase()) && (r.entreprise === entreprise || !entreprise);
    });

    const coutMatierePremiere = filteredAchats.reduce((sum, a) => sum + a.coutMatierePremiere, 0);
    const coutTransport = filteredAchats.reduce((sum, a) => sum + (a.coutTransport || 0), 0);
    const autresDepensesAchat = filteredAchats.reduce((sum, a) => sum + (a.autresDepenses || 0), 0);
    const resteUtilise = filteredRestes.reduce((sum, r) => sum + r.montantUtilise, 0);

    // Données pour le diagramme circulaire (tarte)
    const dataPie = {
        labels: ['Matière Première', 'Transport', 'Autres Dépenses', 'Fonds Restants Utilisés'],
        datasets: [{
            data: [coutMatierePremiere, coutTransport, autresDepensesAchat, resteUtilise],
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
        }]
    };

    const ctxPie = document.getElementById('expensesPieChart').getContext('2d');
    if (window.pieChart) window.pieChart.destroy();
    window.pieChart = new Chart(ctxPie, {
        type: 'pie',
        data: dataPie,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Répartition des Dépenses'
                }
            }
        }
    });

    // Données pour le diagramme en bâtons
    const monthlyExpenses = {};
    const allMonths = ['janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin', 'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'décembre'];
    
    allMonths.forEach(m => {
        monthlyExpenses[m] = { achats: 0, restes: 0 };
    });

    achatData.forEach(achat => {
        const month = new Date(achat.date).toLocaleString('fr-FR', { month: 'long' }).toLowerCase();
        if (monthlyExpenses[month]) {
            monthlyExpenses[month].achats += achat.montantAchat;
        }
    });

    resteUtiliserData.forEach(reste => {
        if (monthlyExpenses[reste.mois.toLowerCase()]) {
            monthlyExpenses[reste.mois.toLowerCase()].restes += reste.montantUtilise;
        }
    });

    const labelsBar = allMonths.map(m => m.charAt(0).toUpperCase() + m.slice(1));
    const achatsValues = allMonths.map(m => monthlyExpenses[m].achats);
    const restesValues = allMonths.map(m => monthlyExpenses[m].restes);

    const dataBar = {
        labels: labelsBar,
        datasets: [
            {
                label: 'Achats',
                backgroundColor: '#3498db',
                data: achatsValues,
            },
            {
                label: 'Dépenses sur Reste',
                backgroundColor: '#2ecc71',
                data: restesValues,
            },
        ],
    };

    const ctxBar = document.getElementById('monthlyExpensesBarChart').getContext('2d');
    if (window.barChart) window.barChart.destroy();
    window.barChart = new Chart(ctxBar, {
        type: 'bar',
        data: dataBar,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    stacked: true,
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                },
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Évolution des Dépenses Mensuelles'
                }
            }
        }
    });
});

// Fonctions d'impression de rapports
function printContent(content) {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <title>Rapport d'Impression</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; }
                .report-header { text-align: center; margin-bottom: 20px; }
                .report-header h1 { font-size: 2rem; color: #34495e; }
                .report-header p { margin: 5px 0; }
                .report-container { width: 80%; margin: 0 auto; }
                .bilan-table, .report-section table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                .bilan-table td, .bilan-table th, .report-section th, .report-section td { padding: 10px; border: 1px solid #ccc; text-align: left; }
                .bilan-table th, .report-section th { background-color: #f2f2f2; font-weight: bold; }
                .report-section { margin-bottom: 30px; }
            </style>
        </head>
        <body>
            <div class="report-container">
                ${content}
            </div>
            <script>
                window.onload = () => {
                    window.print();
                    window.onafterprint = () => window.close();
                }
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

function printBilanReport() {
    const now = new Date();
    const responsibleName = responsableNameInput.value || 'Non Spécifié';
    const month = document.getElementById('bilanPeriodFilter').value;
    const year = document.getElementById('bilanAnnee').value;
    const entreprise = document.getElementById('bilanTypeEntreprise').value;
    const bilanContent = document.getElementById('bilanOutput').innerHTML;

    const reportContent = `
        <div class="report-header">
            <h1>Bilan Financier</h1>
            <p><strong>Date & Heure:</strong> ${now.toLocaleDateString('fr-FR')} ${now.toLocaleTimeString('fr-FR')}</p>
            <p><strong>Responsable:</strong> ${responsibleName}</p>
            <p><strong>Mois:</strong> ${month.charAt(0).toUpperCase() + month.slice(1)} ${year}</p>
            <p><strong>Type d'Entreprise:</strong> ${entreprise || 'Toutes les entreprises'}</p>
            <p><strong>Bilan Financier:</strong></p>
        </div>
        ${bilanContent}
    `;
    printContent(reportContent);
}

function printDiagrammeReport() {
    const now = new Date();
    const responsibleName = responsableNameInput.value || 'Non Spécifié';
    const month = document.getElementById('diagrammeMois').value;
    const year = document.getElementById('diagrammeAnnee').value;
    const entreprise = document.getElementById('diagrammeTypeEntreprise').value;
    
    // Convertir les canevas en images base64
    const pieChartCanvas = document.getElementById('expensesPieChart');
    const barChartCanvas = document.getElementById('monthlyExpensesBarChart');
    const pieChartImage = pieChartCanvas.toDataURL('image/png');
    const barChartImage = barChartCanvas.toDataURL('image/png');

    const reportContent = `
        <div class="report-header">
            <h1>Rapport de Diagrammes</h1>
            <p><strong>Responsable:</strong> ${responsibleName}</p>
            <p><strong>Date & Heure:</strong> ${now.toLocaleDateString('fr-FR')} ${now.toLocaleTimeString('fr-FR')}</p>
            <p><strong>Mois:</strong> ${month.charAt(0).toUpperCase() + month.slice(1)} ${year}</p>
            <p><strong>Type d'Entreprise:</strong> ${entreprise || 'Toutes les entreprises'}</p>
        </div>
        <div class="report-section">
            <h3>Répartition des Dépenses</h3>
            <img src="${pieChartImage}" alt="Répartition des Dépenses" style="width: 100%; max-width: 600px;">
        </div>
        <div class="report-section">
            <h3>Évolution des Dépenses Mensuelles</h3>
            <img src="${barChartImage}" alt="Évolution des Dépenses Mensuelles" style="width: 100%; max-width: 600px;">
        </div>
    `;
    printContent(reportContent);
}
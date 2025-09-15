document.addEventListener('DOMContentLoaded', () => {
    // Éléments de l'en-tête
    const currentDateEl = document.getElementById('currentDate');
    const currentTimeEl = document.getElementById('currentTime');
    const responsibleNameInput = document.getElementById('responsibleName');

    // Éléments de navigation et de section
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const sections = document.querySelectorAll('.app-section');

    // Formulaires
    const budgetAchatForm = document.getElementById('budgetAchatForm');
    const fournisseurForm = document.getElementById('fournisseurForm');

    // Tables
    const budgetAchatTableBody = document.querySelector('#budgetAchatTable tbody');
    const fournisseursTableBody = document.querySelector('#fournisseursTable tbody');

    // Boutons
    const saveBudgetBtn = document.getElementById('saveBudgetBtn');
    const cancelBudgetEditBtn = document.getElementById('cancelBudgetEditBtn');

    // Champs de budget d'achat
    const numeroRapportBudgetInput = document.getElementById('numeroRapportBudget');
    const budgetDepartInput = document.getElementById('budgetDepart');
    const coutMatierePremiereInput = document.getElementById('coutMatierePremiere');
    const coutTransportInput = document.getElementById('coutTransport');
    const autresDepensesInput = document.getElementById('autresDepenses');
    const resteArgentInput = document.getElementById('resteArgent');
    const responsableBudgetInput = document.getElementById('responsableBudget');

    // Filtres et contrôles pour les bilans
    const bilanPeriodFilter = document.getElementById('bilanPeriodFilter');
    const bilanDailyContent = document.getElementById('bilanDailyContent');
    const bilanMonthlyContent = document.getElementById('bilanMonthlyContent');
    const bilanAnnualContent = document.getElementById('bilanAnnualContent');
    const printButton = document.getElementById('printButton');
    
    // Champs de recherche
    const searchBudgetInput = document.getElementById('searchBudget');
    const searchFournisseurInput = document.getElementById('searchFournisseur');

    // --- Fonctionnalités initiales ---
    function updateDateTime() {
        const now = new Date();
        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
        currentDateEl.textContent = now.toLocaleDateString('fr-FR', dateOptions);
        currentTimeEl.textContent = now.toLocaleTimeString('fr-FR', timeOptions);
    }

    setInterval(updateDateTime, 1000);
    updateDateTime();

    // Gestion du nom du responsable dans l'en-tête et le formulaire
    responsibleNameInput.addEventListener('input', () => {
        const responsibleName = responsibleNameInput.value;
        localStorage.setItem('responsibleName', responsibleName);
        responsableBudgetInput.value = responsibleName;
    });

    const savedResponsibleName = localStorage.getItem('responsibleName');
    if (savedResponsibleName) {
        responsibleNameInput.value = savedResponsibleName;
        responsableBudgetInput.value = savedResponsibleName;
    }

    // Gestion de la navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(nav => nav.classList.remove('active'));
            link.classList.add('active');

            const targetId = link.dataset.navTarget;
            sections.forEach(section => {
                if (section.id === targetId) {
                    section.classList.add('active');
                    section.classList.remove('hidden');
                } else {
                    section.classList.remove('active');
                    section.classList.add('hidden');
                }
            });
        });
    });

    // Gestion du budget d'achat
    let budgets = JSON.parse(localStorage.getItem('budgets')) || [];
    let isEditModeBudget = false;
    let currentEditIndexBudget = null;
    let currentNumeroRapport = 1;

    function renderBudgets() {
        budgetAchatTableBody.innerHTML = '';
        budgets.forEach((budget, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${budget.numeroRapport}</td>
                <td>${budget.budgetDepart} FCFA</td>
                <td>${budget.typeMatierePremiere}</td>
                <td>${budget.coutMatierePremiere} FCFA</td>
                <td>${budget.resteArgent} FCFA</td>
                <td>${budget.coutTransport} FCFA</td>
                <td>${budget.autresDepenses} FCFA</td>
                <td>${budget.responsableBudget}</td>
                <td>${budget.justificatifsBudget}</td>
                <td>
                    <button class="edit-btn" data-index="${index}"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" data-index="${index}"><i class="fas fa-trash"></i></button>
                </td>
            `;
            budgetAchatTableBody.appendChild(row);
        });
        updateDashboard();
        updateBilanTables();
        updateCharts();
    }

    function generateNumeroRapport() {
        const lastBudget = budgets.length > 0 ? budgets[budgets.length - 1] : null;
        if (lastBudget) {
            currentNumeroRapport = parseInt(lastBudget.numeroRapport) + 1;
        }
        numeroRapportBudgetInput.value = currentNumeroRapport;
    }
    
    function calculateResteArgent() {
        const budgetDepart = parseFloat(budgetDepartInput.value) || 0;
        const coutMP = parseFloat(coutMatierePremiereInput.value) || 0;
        const coutTransport = parseFloat(coutTransportInput.value) || 0;
        const autresDepenses = parseFloat(autresDepensesInput.value) || 0;
        const resteArgent = budgetDepart - coutMP - coutTransport - autresDepenses;
        resteArgentInput.value = resteArgent.toFixed(2);
    }
    
    [budgetDepartInput, coutMatierePremiereInput, coutTransportInput, autresDepensesInput].forEach(input => {
        input.addEventListener('input', calculateResteArgent);
    });

    budgetAchatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newBudget = {
            numeroRapport: isEditModeBudget ? budgets[currentEditIndexBudget].numeroRapport : numeroRapportBudgetInput.value,
            budgetDepart: parseFloat(budgetDepartInput.value),
            typeMatierePremiere: document.getElementById('typeMatierePremiere').value,
            coutMatierePremiere: parseFloat(coutMatierePremiereInput.value),
            coutTransport: parseFloat(coutTransportInput.value) || 0,
            autresDepenses: parseFloat(autresDepensesInput.value) || 0,
            resteArgent: parseFloat(resteArgentInput.value),
            responsableBudget: responsableBudgetInput.value,
            justificatifsBudget: document.getElementById('justificatifsBudget').value,
            date: new Date().toISOString().split('T')[0]
        };

        if (isEditModeBudget) {
            budgets[currentEditIndexBudget] = newBudget;
            isEditModeBudget = false;
            currentEditIndexBudget = null;
        } else {
            budgets.push(newBudget);
        }

        localStorage.setItem('budgets', JSON.stringify(budgets));
        budgetAchatForm.reset();
        calculateResteArgent();
        renderBudgets();
        generateNumeroRapport();
        saveBudgetBtn.textContent = 'Enregistrer le Budget';
        cancelBudgetEditBtn.style.display = 'none';
        
        // Synchroniser le champ responsable avec l'en-tête
        responsableBudgetInput.value = responsibleNameInput.value;
    });

    budgetAchatTableBody.addEventListener('click', (e) => {
        if (e.target.closest('.edit-btn')) {
            const index = e.target.closest('.edit-btn').dataset.index;
            const budgetToEdit = budgets[index];
            
            numeroRapportBudgetInput.value = budgetToEdit.numeroRapport;
            budgetDepartInput.value = budgetToEdit.budgetDepart;
            document.getElementById('typeMatierePremiere').value = budgetToEdit.typeMatierePremiere;
            coutMatierePremiereInput.value = budgetToEdit.coutMatierePremiere;
            coutTransportInput.value = budgetToEdit.coutTransport;
            autresDepensesInput.value = budgetToEdit.autresDepenses;
            resteArgentInput.value = budgetToEdit.resteArgent;
            responsableBudgetInput.value = budgetToEdit.responsableBudget;
            document.getElementById('justificatifsBudget').value = budgetToEdit.justificatifsBudget;

            isEditModeBudget = true;
            currentEditIndexBudget = index;
            saveBudgetBtn.textContent = 'Modifier le Budget';
            cancelBudgetEditBtn.style.display = 'inline-block';
        }

        if (e.target.closest('.delete-btn')) {
            const index = e.target.closest('.delete-btn').dataset.index;
            if (confirm('Êtes-vous sûr de vouloir supprimer ce budget ?')) {
                budgets.splice(index, 1);
                localStorage.setItem('budgets', JSON.stringify(budgets));
                renderBudgets();
            }
        }
    });

    cancelBudgetEditBtn.addEventListener('click', () => {
        isEditModeBudget = false;
        currentEditIndexBudget = null;
        budgetAchatForm.reset();
        calculateResteArgent();
        generateNumeroRapport();
        saveBudgetBtn.textContent = 'Enregistrer le Budget';
        cancelBudgetEditBtn.style.display = 'none';
        responsableBudgetInput.value = responsibleNameInput.value;
    });

    // Gestion des fournisseurs
    let fournisseurs = JSON.parse(localStorage.getItem('fournisseurs')) || [];
    let isEditModeFournisseur = false;
    let currentEditIndexFournisseur = null;
    let currentNumeroRapportFournisseur = 1;

    function renderFournisseurs() {
        fournisseursTableBody.innerHTML = '';
        fournisseurs.forEach((fournisseur, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${fournisseur.numeroRapport}</td>
                <td>${fournisseur.nomPrenom}</td>
                <td>${fournisseur.phone}</td>
                <td>${fournisseur.adresse}</td>
                <td>
                    <button class="edit-btn" data-index="${index}"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" data-index="${index}"><i class="fas fa-trash"></i></button>
                </td>
            `;
            fournisseursTableBody.appendChild(row);
        });
    }

    function generateNumeroRapportFournisseur() {
        const lastFournisseur = fournisseurs.length > 0 ? fournisseurs[fournisseurs.length - 1] : null;
        if (lastFournisseur) {
            currentNumeroRapportFournisseur = parseInt(lastFournisseur.numeroRapport) + 1;
        }
        document.getElementById('numeroRapportFournisseur').value = currentNumeroRapportFournisseur;
    }

    fournisseurForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newFournisseur = {
            numeroRapport: isEditModeFournisseur ? fournisseurs[currentEditIndexFournisseur].numeroRapport : document.getElementById('numeroRapportFournisseur').value,
            nomPrenom: document.getElementById('fournisseurNomPrenom').value,
            phone: document.getElementById('fournisseurPhone').value,
            adresse: document.getElementById('fournisseurAdresse').value,
            date: new Date().toISOString().split('T')[0]
        };

        if (isEditModeFournisseur) {
            fournisseurs[currentEditIndexFournisseur] = newFournisseur;
            isEditModeFournisseur = false;
            currentEditIndexFournisseur = null;
        } else {
            fournisseurs.push(newFournisseur);
        }

        localStorage.setItem('fournisseurs', JSON.stringify(fournisseurs));
        fournisseurForm.reset();
        renderFournisseurs();
        generateNumeroRapportFournisseur();
        document.getElementById('saveFournisseurBtn').textContent = 'Enregistrer le Fournisseur';
        document.getElementById('cancelFournisseurEditBtn').style.display = 'none';
    });

    fournisseursTableBody.addEventListener('click', (e) => {
        if (e.target.closest('.edit-btn')) {
            const index = e.target.closest('.edit-btn').dataset.index;
            const fournisseurToEdit = fournisseurs[index];
            
            document.getElementById('numeroRapportFournisseur').value = fournisseurToEdit.numeroRapport;
            document.getElementById('fournisseurNomPrenom').value = fournisseurToEdit.nomPrenom;
            document.getElementById('fournisseurPhone').value = fournisseurToEdit.phone;
            document.getElementById('fournisseurAdresse').value = fournisseurToEdit.adresse;

            isEditModeFournisseur = true;
            currentEditIndexFournisseur = index;
            document.getElementById('saveFournisseurBtn').textContent = 'Modifier le Fournisseur';
            document.getElementById('cancelFournisseurEditBtn').style.display = 'inline-block';
        }
        
        if (e.target.closest('.delete-btn')) {
            const index = e.target.closest('.delete-btn').dataset.index;
            if (confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
                fournisseurs.splice(index, 1);
                localStorage.setItem('fournisseurs', JSON.stringify(fournisseurs));
                renderFournisseurs();
            }
        }
    });

    document.getElementById('cancelFournisseurEditBtn').addEventListener('click', () => {
        isEditModeFournisseur = false;
        currentEditIndexFournisseur = null;
        fournisseurForm.reset();
        generateNumeroRapportFournisseur();
        document.getElementById('saveFournisseurBtn').textContent = 'Enregistrer le Fournisseur';
        document.getElementById('cancelFournisseurEditBtn').style.display = 'none';
    });


    // Mise à jour du tableau de bord
    function updateDashboard() {
        const budgets = JSON.parse(localStorage.getItem('budgets')) || [];
        const monthlyBudgetTotalEl = document.getElementById('dashboardMonthlyBudgetTotal');
        const monthlyExpensesTotalEl = document.getElementById('dashboardMonthlyExpensesTotal');
        const monthlyRemainingFundsEl = document.getElementById('dashboardMonthlyRemainingFunds');
        const monthlyTransportCostEl = document.getElementById('dashboardMonthlyTransportCost');
        const monthlyOtherExpensesEl = document.getElementById('dashboardMonthlyOtherExpenses');

        const currentMonth = new Date().toISOString().substring(0, 7);

        const monthlyBudgets = budgets.filter(b => b.date && b.date.startsWith(currentMonth));
        const totalBudget = monthlyBudgets.reduce((acc, b) => acc + b.budgetDepart, 0);
        const totalExpenses = monthlyBudgets.reduce((acc, b) => acc + b.coutMatierePremiere + b.coutTransport + b.autresDepenses, 0);
        const totalRemaining = monthlyBudgets.reduce((acc, b) => acc + b.resteArgent, 0);
        const totalTransport = monthlyBudgets.reduce((acc, b) => acc + b.coutTransport, 0);
        const totalOtherExpenses = monthlyBudgets.reduce((acc, b) => acc + b.autresDepenses, 0);

        monthlyBudgetTotalEl.textContent = `${totalBudget.toFixed(2)} FCFA`;
        monthlyExpensesTotalEl.textContent = `${totalExpenses.toFixed(2)} FCFA`;
        monthlyRemainingFundsEl.textContent = `${totalRemaining.toFixed(2)} FCFA`;
        monthlyTransportCostEl.textContent = `${totalTransport.toFixed(2)} FCFA`;
        monthlyOtherExpensesEl.textContent = `${totalOtherExpenses.toFixed(2)} FCFA`;
    }

    // Gestion des bilans
    function updateBilanTables() {
        const budgets = JSON.parse(localStorage.getItem('budgets')) || [];
        const dailyData = {};
        const monthlyData = {};
        const annualData = {};

        budgets.forEach(budget => {
            const date = budget.date;
            const month = date.substring(0, 7);
            const year = date.substring(0, 4);
            const totalExpense = (budget.coutMatierePremiere || 0) + (budget.coutTransport || 0) + (budget.autresDepenses || 0);

            // Bilan journalier
            if (!dailyData[date]) {
                dailyData[date] = { count: 0, total: 0 };
            }
            dailyData[date].count++;
            dailyData[date].total += totalExpense;

            // Bilan mensuel
            if (!monthlyData[month]) {
                monthlyData[month] = { count: 0, total: 0 };
            }
            monthlyData[month].count++;
            monthlyData[month].total += totalExpense;

            // Bilan annuel
            if (!annualData[year]) {
                annualData[year] = { count: 0, total: 0 };
            }
            annualData[year].count++;
            annualData[year].total += totalExpense;
        });

        // Affichage des données
        renderTable(document.querySelector('#tableBilanDaily tbody'), dailyData, 'daily');
        renderTable(document.querySelector('#tableBilanMonthly tbody'), monthlyData, 'monthly');
        renderTable(document.querySelector('#tableBilanAnnual tbody'), annualData, 'annual');
    }

    function renderTable(tableBody, data, period) {
        tableBody.innerHTML = '';
        const sortedKeys = Object.keys(data).sort().reverse();
        sortedKeys.forEach(key => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${key}</td>
                <td>${data[key].count}</td>
                <td>${data[key].total.toFixed(2)} FCFA</td>
            `;
            tableBody.appendChild(row);
        });
    }
    
    bilanPeriodFilter.addEventListener('change', () => {
        const selectedPeriod = bilanPeriodFilter.value;
        bilanDailyContent.classList.add('hidden');
        bilanMonthlyContent.classList.add('hidden');
        bilanAnnualContent.classList.add('hidden');

        if (selectedPeriod === 'daily') {
            bilanDailyContent.classList.remove('hidden');
        } else if (selectedPeriod === 'monthly') {
            bilanMonthlyContent.classList.remove('hidden');
        } else {
            bilanAnnualContent.classList.remove('hidden');
        }
    });

    // Gestion de l'impression (nouvelle logique)
    printButton.addEventListener('click', () => {
        const responsableName = responsibleNameInput.value || "Non spécifié";
        const budgetsToPrint = JSON.parse(localStorage.getItem('budgets')) || [];
        const now = new Date();
        const dateString = now.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
        const timeString = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

        let printContent = `
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <title>Rapport d'impression GaliBusiness</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 2rem; }
                    h1, h2 { text-align: center; }
                    .header-print { margin-bottom: 2rem; border-bottom: 1px solid #ccc; padding-bottom: 1rem; }
                    .header-print p { margin: 0.5rem 0; }
                    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
                    th, td { border: 1px solid #000; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                </style>
            </head>
            <body>
                <h1>Rapport GaliBusiness</h1>
                <div class="header-print">
                    <p><strong>Responsable :</strong> ${responsableName}</p>
                    <p><strong>Date :</strong> ${dateString}</p>
                    <p><strong>Heure :</strong> ${timeString}</p>
                </div>
                <h2>Bilan d'Achats</h2>
                <table>
                    <thead>
                        <tr>
                            <th>N° Rapport</th>
                            <th>Budget de Départ</th>
                            <th>Matière Première</th>
                            <th>Coût MP</th>
                            <th>Coût Transport</th>
                            <th>Autres Dépenses</th>
                            <th>Reste d'Argent</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        budgetsToPrint.forEach(budget => {
            printContent += `
                <tr>
                    <td>${budget.numeroRapport}</td>
                    <td>${budget.budgetDepart.toFixed(2)} FCFA</td>
                    <td>${budget.typeMatierePremiere}</td>
                    <td>${budget.coutMatierePremiere.toFixed(2)} FCFA</td>
                    <td>${budget.coutTransport.toFixed(2)} FCFA</td>
                    <td>${budget.autresDepenses.toFixed(2)} FCFA</td>
                    <td>${budget.resteArgent.toFixed(2)} FCFA</td>
                </tr>
            `;
        });

        printContent += `
                    </tbody>
                </table>
            </body>
            </html>
        `;

        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
    });

    // Ajout de la recherche
    searchBudgetInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const rows = budgetAchatTableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });

    searchFournisseurInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const rows = fournisseursTableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });

    // --- Gestion des diagrammes ---
    const expensesPieChartCtx = document.getElementById('expensesPieChart').getContext('2d');
    let expensesPieChart;
    const monthlyExpensesBarChartCtx = document.getElementById('monthlyExpensesBarChart').getContext('2d');
    let monthlyExpensesBarChart;

    function updateCharts() {
        const budgets = JSON.parse(localStorage.getItem('budgets')) || [];
        
        // Diagramme circulaire pour la répartition des dépenses
        let totalCoutMP = budgets.reduce((sum, b) => sum + (b.coutMatierePremiere || 0), 0);
        let totalCoutTransport = budgets.reduce((sum, b) => sum + (b.coutTransport || 0), 0);
        let totalAutresDepenses = budgets.reduce((sum, b) => sum + (b.autresDepenses || 0), 0);

        if (expensesPieChart) {
            expensesPieChart.destroy();
        }
        expensesPieChart = new Chart(expensesPieChartCtx, {
            type: 'pie',
            data: {
                labels: ['Coût Matière Première', 'Coût Transport', 'Autres Dépenses'],
                datasets: [{
                    data: [totalCoutMP, totalCoutTransport, totalAutresDepenses],
                    backgroundColor: ['#3498db', '#f1c40f', '#e74c3c'],
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                let label = tooltipItem.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(tooltipItem.raw);
                                return label;
                            }
                        }
                    }
                }
            }
        });

        // Diagramme en barres pour l'évolution mensuelle
        const monthlyData = {};
        budgets.forEach(budget => {
            const month = budget.date.substring(0, 7);
            const totalExpense = (budget.coutMatierePremiere || 0) + (budget.coutTransport || 0) + (budget.autresDepenses || 0);
            if (!monthlyData[month]) {
                monthlyData[month] = 0;
            }
            monthlyData[month] += totalExpense;
        });

        const sortedMonths = Object.keys(monthlyData).sort();
        const monthlyLabels = sortedMonths.map(month => {
            const [year, mon] = month.split('-');
            const date = new Date(year, mon - 1);
            return date.toLocaleString('fr-FR', { month: 'short', year: 'numeric' });
        });
        const monthlyTotals = sortedMonths.map(month => monthlyData[month]);

        if (monthlyExpensesBarChart) {
            monthlyExpensesBarChart.destroy();
        }
        monthlyExpensesBarChart = new Chart(monthlyExpensesBarChartCtx, {
            type: 'bar',
            data: {
                labels: monthlyLabels,
                datasets: [{
                    label: 'Dépenses Mensuelles',
                    data: monthlyTotals,
                    backgroundColor: '#2ecc71',
                    borderColor: '#27ae60',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Montant (FCFA)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // Initialisation
    renderBudgets();
    renderFournisseurs();
    generateNumeroRapport();
    generateNumeroRapportFournisseur();
});




//CODE DE PROTECTION



// Définis le mot de passe requis
const motDePasseRequis = '00D1';

// Demande à l'utilisateur d'entrer le mot de passe
let motDePasseSaisi = prompt('Veuillez entrer le mot de passe pour accéder à l\'application.');

// Vérifie si le mot de passe saisi est correct
if (motDePasseSaisi === motDePasseRequis) {
  // Le mot de passe est correct, tu peux continuer
  alert('Accès accordé !');
  // Ici, tu peux mettre tout le code de ton application
  // Par exemple, afficher le contenu de la page
} else {
  // Le mot de passe est incorrect
  alert('Mot de passe incorrect. Accès refusé !');
  // Tu peux rediriger l'utilisateur ou cacher le contenu
  window.location.href = ''; // Exemple de redirection
}

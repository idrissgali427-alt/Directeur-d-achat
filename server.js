// server.js
const express = require('express');
const cors = require('cors'); 
const mongoose = require('mongoose');
const connectDB = require('./dbconnect'); // Importe la fonction de connexion

// --- 1. INITIALISATION DE L'APPLICATION ---
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;
const API_PREFIX = '/api'; // Préfixe de l'URL pour les routes API

// --- 2. MIDDLEWARES ---
app.use(cors()); 
app.use(express.json()); 

// CORRECTION: SERVIR LES FICHIERS STATIQUES (HTML, CSS, JS)
// Le dossier 'public' est désormais accessible via l'URL de base (http://localhost:PORT/)
app.use(express.static('public')); 


// --- 3. DÉFINITION DES SCHÉMAS MONGOOSE (MODÈLES) ---

// Schéma Entreprise
const entrepriseSchema = new mongoose.Schema({
    nom: { type: String, required: [true, 'Le nom de l\'entreprise est requis.'], unique: true },
    directeur: { type: String, required: [true, 'Le directeur est requis.'] },
    budget: { type: Number, required: [true, 'Le budget est requis.'], min: [0, 'Le budget ne peut pas être négatif.'] },
    date: { type: Date, required: [true, 'La date de création est requise.'] },
}, { timestamps: true });
const Entreprise = mongoose.model('Entreprise', entrepriseSchema);

// Schéma Achat
const achatSchema = new mongoose.Schema({
    numeroRapport: { type: String, required: [true, 'Le numéro de rapport est requis.'], unique: true },
    montantAchat: { type: Number, required: true, min: 0 },
    entreprise: { type: String, required: true },
    coutMatierePremiere: { type: Number, default: 0, min: 0 },
    coutTransport: { type: Number, default: 0, min: 0 },
    autresDepenses: { type: Number, default: 0, min: 0 },
    resteArgent: { type: Number, required: true },
    responsable: { type: String, required: true },
    justificatifs: { type: String },
    date: { type: Date, required: true },
}, { timestamps: true });
const Achat = mongoose.model('Achat', achatSchema);

// Schéma Reste Utiliser
const resteUtiliserSchema = new mongoose.Schema({
    numeroRapport: { type: String, required: [true, 'Le numéro de rapport est requis.'], unique: true },
    entreprise: { type: String, required: true },
    mois: { type: String, required: true },
    montantUtilise: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true },
    justificatifs: { type: String },
    montantResteTotal: { type: Number },
    resteArgentFinal: { type: Number }
}, { timestamps: true });
const ResteUtiliser = mongoose.model('ResteUtiliser', resteUtiliserSchema);

// Schéma Fournisseur
const fournisseurSchema = new mongoose.Schema({
    numeroRapport: { type: String, required: [true, 'Le numéro de rapport est requis.'], unique: true },
    nom: { type: String, required: true },
    phone: { type: String },
    adresse: { type: String },
}, { timestamps: true });
const Fournisseur = mongoose.model('Fournisseur', fournisseurSchema);


// --- 4. FONCTIONS UTILITAIRES POUR LES ROUTES ---

// Gère les erreurs de l'API (doublons, validation, serveur)
const handleError = (res, error, defaultMessage, status = 500) => {
    console.error(defaultMessage, error);
    if (error.code === 11000) { 
        status = 400;
        defaultMessage = "Erreur de doublon: L'identifiant (Nom/Numéro de Rapport) existe déjà.";
    } else if (error instanceof mongoose.Error.ValidationError) {
        status = 400;
        defaultMessage = `Erreur de validation: ${Object.values(error.errors).map(e => e.message).join(' | ')}`;
    }
    res.status(status).json({ message: defaultMessage, error: error.message || error });
};

// =================================================================
// ROUTES API
// =================================================================

// --- ENTREPRISES (Endpoint: /api/entreprises) ---
app.get(`${API_PREFIX}/entreprises`, async (req, res) => {
    try {
        const entreprises = await Entreprise.find().sort({ nom: 1 });
        res.status(200).json(entreprises);
    } catch (error) {
        handleError(res, error, 'Erreur lors de la récupération des entreprises.');
    }
});

app.post(`${API_PREFIX}/entreprises`, async (req, res) => {
    try {
        const newEntreprise = new Entreprise(req.body);
        const savedEntreprise = await newEntreprise.save();
        res.status(201).json(savedEntreprise);
    } catch (error) {
        handleError(res, error, 'Erreur lors de la création de l\'entreprise.', 400);
    }
});

app.delete(`${API_PREFIX}/entreprises/:nom`, async (req, res) => {
    try {
        const result = await Entreprise.findOneAndDelete({ nom: req.params.nom });
        if (!result) return res.status(404).json({ message: 'Entreprise non trouvée.' });
        res.status(204).send(); 
    } catch (error) {
        handleError(res, error, 'Erreur lors de la suppression de l\'entreprise.');
    }
});

// --- ACHATS (Endpoint: /api/achats) ---
app.get(`${API_PREFIX}/achats`, async (req, res) => {
    try {
        const achats = await Achat.find().sort({ date: -1 });
        res.status(200).json(achats);
    } catch (error) {
        handleError(res, error, 'Erreur lors de la récupération des achats.');
    }
});

app.post(`${API_PREFIX}/achats`, async (req, res) => {
    try {
        const newAchat = new Achat(req.body);
        const savedAchat = await newAchat.save();
        res.status(201).json(savedAchat);
    } catch (error) {
        handleError(res, error, 'Erreur lors de la création de l\'achat.', 400);
    }
});

app.delete(`${API_PREFIX}/achats/:numeroRapport`, async (req, res) => {
    try {
        const result = await Achat.findOneAndDelete({ numeroRapport: req.params.numeroRapport });
        if (!result) return res.status(404).json({ message: 'Achat non trouvé.' });
        res.status(204).send();
    } catch (error) {
        handleError(res, error, 'Erreur lors de la suppression de l\'achat.');
    }
});

// --- RESTES UTILISER (Endpoint: /api/restes) ---
app.get(`${API_PREFIX}/restes`, async (req, res) => {
    try {
        const restes = await ResteUtiliser.find().sort({ date: -1 });
        res.status(200).json(restes);
    } catch (error) {
        handleError(res, error, 'Erreur lors de la récupération des restes.');
    }
});

app.post(`${API_PREFIX}/restes`, async (req, res) => {
    try {
        const newReste = new ResteUtiliser(req.body);
        const savedReste = await newReste.save();
        res.status(201).json(savedReste);
    } catch (error) {
        handleError(res, error, 'Erreur lors de la création du reste utilisé.', 400);
    }
});

app.delete(`${API_PREFIX}/restes/:numeroRapport`, async (req, res) => {
    try {
        const result = await ResteUtiliser.findOneAndDelete({ numeroRapport: req.params.numeroRapport });
        if (!result) return res.status(404).json({ message: 'Dépense sur reste non trouvée.' });
        res.status(204).send();
    } catch (error) {
        handleError(res, error, 'Erreur lors de la suppression du reste utilisé.');
    }
});

// --- FOURNISSEURS (Endpoint: /api/fournisseurs) ---
app.get(`${API_PREFIX}/fournisseurs`, async (req, res) => {
    try {
        const fournisseurs = await Fournisseur.find().sort({ nom: 1 });
        res.status(200).json(fournisseurs);
    } catch (error) {
        handleError(res, error, 'Erreur lors de la récupération des fournisseurs.');
    }
});

app.post(`${API_PREFIX}/fournisseurs`, async (req, res) => {
    try {
        const newFournisseur = new Fournisseur(req.body);
        const savedFournisseur = await newFournisseur.save();
        res.status(201).json(savedFournisseur);
    } catch (error) {
        handleError(res, error, 'Erreur lors de la création du fournisseur.', 400);
    }
});

app.delete(`${API_PREFIX}/fournisseurs/:numeroRapport`, async (req, res) => {
    try {
        const result = await Fournisseur.findOneAndDelete({ numeroRapport: req.params.numeroRapport });
        if (!result) return res.status(404).json({ message: 'Fournisseur non trouvé.' });
        res.status(204).send();
    } catch (error) {
        handleError(res, error, 'Erreur lors de la suppression du fournisseur.');
    }
});

// --- 5. DÉMARRAGE DU SERVEUR (Assure la connexion DB avant le démarrage du serveur Express) ---

const startServer = async () => {
    // 1. Tente de connecter la DB. 
    await connectDB(); 
    
    // 2. Si la connexion est réussie, le serveur Express est démarré
    app.listen(PORT, () => {
        console.log(`\n==============================================`);
        console.log(`  ✅ Le serveur Express écoute sur le PORT ${PORT}`);
        console.log(`  🔗 API de base : http://localhost:${PORT}${API_PREFIX}`);
        console.log(`  🔗 Fichiers statiques: http://localhost:${PORT}/index.html`);
        console.log(`==============================================`);
    });
};

// Lance le processus de démarrage
startServer();
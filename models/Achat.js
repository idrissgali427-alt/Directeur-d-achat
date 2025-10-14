// models/Achat.js

const mongoose = require('mongoose');

const achatSchema = new mongoose.Schema({
    numeroRapport: {
        type: String,
        required: [true, 'Le numéro de rapport est requis.'],
        unique: true, // Utilisé comme identifiant unique
        trim: true
    },
    montantAchat: {
        type: Number,
        required: [true, 'Le montant de l\'achat est requis.'],
        min: 0
    },
    entreprise: {
        type: String,
        required: [true, 'L\'entreprise est requise.'],
    },
    coutMatierePremiere: {
        type: Number,
        required: [true, 'Le coût de la matière première est requis.'], // Maintenu à 'required' si c'est la dépense principale
        min: 0
    },
    coutTransport: {
        type: Number,
        default: 0,
        // PAS required, car il a une valeur par défaut de 0
    },
    autresDepenses: {
        type: Number,
        default: 0,
        // PAS required, car il a une valeur par défaut de 0
    },
    resteArgent: { // Calculé dans le frontend
        type: Number,
        required: [true, 'Le reste d\'argent est requis.'],
        default: 0, // Ajout de default: 0 pour la robustesse
    },
    responsable: {
        type: String,
        required: [true, 'Le responsable est requis.']
    },
    justificatifs: {
        type: String,
        default: 'Non spécifié' // Définit une valeur par défaut
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Achat', achatSchema);
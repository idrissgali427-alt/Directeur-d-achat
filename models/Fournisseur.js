// models/Fournisseur.js

const mongoose = require('mongoose');

const fournisseurSchema = new mongoose.Schema({
    numeroRapport: {
        type: String,
        required: [true, 'Le numéro de rapport du fournisseur est obligatoire.'],
        unique: true, // Clé unique essentielle
        trim: true
    },
    nom: {
        type: String,
        required: [true, 'Le nom et prénom du fournisseur sont obligatoires.'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Le numéro de téléphone est obligatoire.'], // Ajouté 'required' et message
        trim: true
    },
    adresse: {
        type: String,
        required: [true, 'L\'adresse du fournisseur est obligatoire.'] // Ajouté 'required' et message
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Fournisseur', fournisseurSchema);
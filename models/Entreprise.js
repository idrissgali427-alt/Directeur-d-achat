// models/Entreprise.js

const mongoose = require('mongoose');

const entrepriseSchema = new mongoose.Schema({
    nom: {
        type: String,
        // 🚨 Message d'erreur personnalisé en cas d'absence
        required: [true, 'Le nom de l\'entreprise est obligatoire.'], 
        unique: true, // Garanti l'unicité, clé pour la suppression/référence
        trim: true
    },
    directeur: {
        type: String,
        required: [true, 'Le nom du directeur commercial est obligatoire.']
    },
    budget: {
        type: Number,
        required: [true, 'Le budget mensuel est obligatoire.'],
        min: [0, 'Le budget ne peut pas être négatif.'] // 🚨 Message d'erreur personnalisé pour la contrainte min
    },
    date: {
        type: Date,
        default: Date.now // Date de création de l'enregistrement
    }
}, {
    // 💡 Bonne pratique : ajoute 'createdAt' et 'updatedAt' automatiquement
    timestamps: true 
});

module.exports = mongoose.model('Entreprise', entrepriseSchema);
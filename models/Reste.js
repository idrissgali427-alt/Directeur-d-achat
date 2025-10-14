// models/Reste.js (or ResteUtiliser.js)

const mongoose = require('mongoose');

const resteUtiliserSchema = new mongoose.Schema({
    numeroRapport: {
        type: String,
        required: [true, 'Le numéro de rapport Reste est obligatoire.'],
        unique: true, // Key for unique identification and deletion
        trim: true
    },
    entreprise: {
        type: String,
        required: [true, 'Le nom de l\'entreprise est obligatoire.'],
    },
    mois: {
        type: String,
        required: [true, 'Le mois d\'utilisation est obligatoire.'], // Added required validation
        trim: true
    },
    montantUtilise: {
        type: Number,
        required: [true, 'Le montant utilisé est obligatoire.'],
        min: [0, 'Le montant utilisé ne peut pas être négatif.']
    },
    date: {
        type: Date,
        required: [true, 'La date de la dépense est obligatoire.'],
        default: Date.now // It's often safer to let the server set the date, but we keep the client's 'required'
    },
    justificatifs: {
        type: String,
        default: 'Non spécifié' // Added default for robustness
    },
    // Champs calculés mais stockés pour figer l'état au moment de l'enregistrement
    montantResteTotal: { 
        type: Number,
        required: [true, 'Le montant total restant doit être envoyé par le client.'],
        min: 0
    },
    resteArgentFinal: { 
        type: Number,
        required: [true, 'Le reste d\'argent final doit être envoyé par le client.']
        // Note: You might want to add validation in your Express route 
        // to ensure resteArgentFinal is not negative, but Mongoose validation isn't strictly necessary here.
    }
}, {
    // 💡 It's helpful to know when this record was created
    timestamps: true 
});

// IMPORTANT: Use the model name "Reste" consistently if you use Reste in your server.js
module.exports = mongoose.model('Reste', resteUtiliserSchema);
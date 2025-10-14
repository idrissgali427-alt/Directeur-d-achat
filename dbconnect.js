// dbconnect.js
const mongoose = require('mongoose');
require('dotenv').config(); // Charge les variables du fichier .env

// Utilise la variable MONGO_URI_ATLAS définie dans le .env
const MONGO_URI = process.env.MONGO_URI_ATLAS;

const connectDB = async () => {
    if (!MONGO_URI) {
        console.error("❌ ERREUR: La variable MONGO_URI_ATLAS n'est pas définie dans le fichier .env.");
        // Pour des raisons de sécurité, nous n'affichons pas la clé ici
        process.exit(1);
    }
    
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB Atlas est connecté avec succès !');
    } catch (err) {
        console.error(`❌ Erreur de connexion à MongoDB Atlas : ${err.message}`);
        process.exit(1);
    }
};


module.exports = connectDB;

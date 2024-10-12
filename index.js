const express = require("express");
const cors = require("cors");
const axios = require("axios");
const mongoose = require("mongoose");

require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const userRoutes = require("./routes/user");
app.use(userRoutes);

const favoriteRoutes = require("./routes/favorite");
app.use(favoriteRoutes);

// Configuration de Mongoose pour les requêtes strictes
mongoose.set("strictQuery", true);

// Connexion à la base de données MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Route pour obtenir la liste des personnages
app.get("/characters", async (req, res) => {
  try {
    // Récupération des paramètres de requête
    // Requête à l'API Marvel pour obtenir les personnages
    // const skip = req.query.skip || "0";
    // const limit = req.query.limit || "100";
    // const name = req.query.name || "";
    const response = await axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/characters?apiKey=${process.env.API_KEY}`
    );
    // Envoi de la réponse au client
    res.json(response.data);
  } catch (error) {
    // Gestion des erreurs et envoi d'une réponse d'erreur au client
    res.status(400).json({ message: error.message });
  }
});

// Route pour obtenir les détails d'un personnage spécifique par ID
app.get("/character/:characterId", async (req, res) => {
  try {
    // Requête à l'API Marvel pour obtenir les détails du personnage
    const response = await axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/character/${req.params.characterId}?apiKey=${process.env.API_KEY}`
    );
    res.json(response.data);
  } catch (error) {
    // Gestion des erreurs et envoi d'une réponse d'erreur au client
    console.log({ message: error.message });
  }
});

// Route pour obtenir la liste des comics
app.get("/comics", async (req, res) => {
  try {
    // Récupération des paramètres de requête
    const title = req.query.title || "";
    const skip = req.query.skip || "0";
    // const limit = req.query.limit || "100";
    // Requête à l'API Marvel pour obtenir les comics
    const response = await axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/comics?apiKey=${process.env.API_KEY}&title=${title}&skip=${skip}`
    );
    res.json(response.data);
  } catch (error) {
    // Gestion des erreurs et envoi d'une réponse d'erreur au client
    res.status(400).json({ error: error.message });
  }
});

// Route pour obtenir les comics d'un personnage spécifique par ID
// app.get("/comics/:characterId", async (req, res) => {
//   try {
//     // console.log(req.params);
//     // Requête à l'API Marvel pour obtenir les comics du personnage
//     const response = await axios.get(
//       `https://lereacteur-marvel-api.herokuapp.com/comics/${req.params.characterId}?apiKey=${process.env.API_KEY}`
//     );
//     console.log(response.data);
//     res.json(response.data);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// Route pour obtenir les détails d'un comic spécifique par ID
app.get("/comic/:comicId", async (req, res) => {
  try {
    // Requête à l'API Marvel pour obtenir les détails du comic
    const response = await axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/comic/${req.params.comicId}?apiKey=${process.env.API_KEY}`
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error occurred:", error.message); // Log de l'erreur

    // Gestion des erreurs et envoi d'une réponse d'erreur au client
    res.status(400).json({ message: error.message });
  }
});

// Route par défaut pour tester le serveur
app.get("/", (req, res) => {
  console.log("test serveur");
});

// Route pour gérer les routes inexistantes
app.all("*", (req, res) => {
  res.status(404).json({ message: "This route doesn't exist" });
});

app.listen(process.env.PORT, () => {
  console.log("Server started");
});
// mongoose.connect("mongodb://localhost:27017/marvel");

const express = require("express");
const router = express.Router();

const isAuthenticated = require("../middlewares/isAuthenticated");
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
require("dotenv").config();
const User = require("../models/User");

// Route pour l'inscription des utilisateurs

router.post("/signup", async (req, res) => {
  try {
    const { email, password, confirmPassword, username } = req.body;
    console.log(req.body);
    if (!email || !username || !password || !confirmPassword) {
      return res.status(400).json({ message: "missing parameters." });
    }
    // Vérification que tous les paramètres requis sont présents
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "The passwords do not match." });
    }
    // Vérification que l'email n'est pas déjà utilisé
    const emailAllReadyUsed = await User.findOne({ email: email });
    if (emailAllReadyUsed) {
      return res.status(409).json({ message: "email already used" });
    }
    // Génération d'un token unique pour l'utilisateur
    const token = uid2(64);
    // Génération d'un salt unique pour le hachage du mot de passe
    const salt = uid2(16);
    const hash = SHA256(password + salt).toString(encBase64);
    // Création d'un nouvel utilisateur avec les informations fournies
    const newUser = new User({
      email,
      account: { username },
      token,
      hash,
      salt,
    });
    // Sauvegarde du nouvel utilisateur dans la base de données
    await newUser.save();
    // Préparation de la réponse à envoyer au client
    const response = {
      _id: newUser._id,
      account: newUser.account,
      token: newUser.token,
    };
    if (response) {
      res.status(200).json({ message: "succès!" });
    }
  } catch (error) {
    // Gestion des erreurs et envoi d'une réponse d'erreur au client
    res.status(400).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    if (!email || !password) {
      return res.status(400).json({ message: "missing parameters" });
    }
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const newHash = SHA256(password + user.salt).toString(encBase64);

    if (newHash !== user.hash) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.json({
      _id: user._id,
      account: user.account,
      token: user.token,
      message: "succès!",
    });
    // res.status(200).json({  });
  } catch (error) {
    console.log(error.response.data);
    res.status(400).json({ message: error.message });
  }
});
router.get("/user/:id", async (req, res) => {
  // console.log("Request received for user ID:", req.params.id);

  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      console.log("User not found");

      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const userInfo = {
      _id: user._id,
      username: user.account.username,
      email: user.email,
      token: user.token,
      hash: user.hash,
      salt: user.salt,
    };

    res.json(userInfo);

    // console.log(userInfo);
  } catch (error) {
    console.log("Error occurred:", error.message);

    res.status(500).json({ message: error.message });
  }
});
router.delete("/user/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await User.findByIdAndDelete(userId);
    if (result) {
      res.status(200).json({ message: "Votre compte a été supprimer!" });
    } else {
      res.status(400).json({ message: "Utilisateur non trouvé" });
    }
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
// Hachage du mot de passe avec le salt Rôle : Un salt est une chaîne aléatoire ajoutée au mot de passe avant le hachage pour éviter
// les attaques par tables arc-en-ciel et renforcer la sécurité des mots de passe hachés.
// Pourquoi l'inclure : Pour stocker le salt utilisé lors du hachage du mot de passe afin de vérifier les mots de passe lors de l'authentification.

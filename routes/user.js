const express = require("express");
const router = express.Router();

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
    // Vérification que tous les paramètres requis sont présents

    if (!email || !username || !password || !confirmPassword) {
      return res.status(400).json({ message: "missing parameters" });
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
    // Hachage du mot de passe avec le salt Rôle : Un salt est une chaîne aléatoire ajoutée au mot de passe avant le hachage pour éviter les attaques par tables arc-en-ciel et renforcer la sécurité des mots de passe hachés.
    // Pourquoi l'inclure : Pour stocker le salt utilisé lors du hachage du mot de passe afin que vous puissiez vérifier les mots de passe lors de l'authentification. Il est essentiel pour la vérification des mots de passe hachés.

    const hash = SHA256(password + salt).toString(encBase64);
    // Création d'un nouvel utilisateur avec les informations fournies

    const newUser = new User({
      email,
      account: { username },
      createdAt: new Date(),
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
    // Envoi de la réponse au client

    res.json(response);
  } catch (error) {
    // Gestion des erreurs et envoi d'une réponse d'erreur au client

    res.status(400).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });

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
    });
  } catch (error) {
    console.log(error.response.data);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;

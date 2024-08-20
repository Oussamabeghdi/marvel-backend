// --------------------reinitialisation m-d-p--------------
// Configuration de Nodemailer
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
// Route pour demander une réinitialisation de mot de passe
router.post("/request-reset-password", async (req, res) => {
  console.log("je passe dans ma route");
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    // Génération d'un jeton de réinitialisation
    const resetToken = uid2(64);

    // Sauvegarde du jeton dans la base de données (ici on suppose que votre modèle User a un champ resetToken)
    user.resetToken = resetToken;
    user.resetTokenExpires = Date.now() + 3600000; // 1 heure
    await user.save();

    // Envoi d'un email avec le lien de réinitialisation
    const resetURL = `http://localhost:4000/reset-password/${resetToken}`;

    // const resetURL = `https://site--marvel-backend--9gtnl5qyn2yw.code.run/reset-password/${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset",
      text: `Vous avez demandé une réinitialisation de mot de passe. Cliquez sur le lien pour réinitialiser votre mot de passe : ${resetURL}`,
    };
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        return res.status(500).json({ message: "Error sending email" });
      }
      res.status(200).json({ message: "Email sent successfully" });
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.post("/verify-reset-token", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const user = await User.findOne({ resetToken: token, resetTokenExpires: { $gt: Date.now() } });
    if (!user) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    res.status(200).json({ message: "Valid token" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    const user = await User.findOne({ resetToken: token, resetTokenExpires: { $gt: Date.now() } });
    if (!user) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Mise à jour du mot de passe
    const salt = uid2(16);
    const hash = SHA256(newPassword + salt).toString(encBase64);

    user.hash = hash;
    user.salt = salt;
    user.resetToken = undefined; // Suppression du token de réinitialisation
    user.resetTokenExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

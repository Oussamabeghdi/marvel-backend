const mongoose = require("mongoose");

const User = mongoose.model("User", {
  account: {
    username: { type: String, required: true, trim: true },
  },
  // email: String,
  email: {
    type: String,
    validate: {
      validator: function (email) {
        return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
      },
      message: "Adresse email invalide",
    },
  },

  favoritesCharacters: [String],
  favoritesComics: [String],
  token: String,
  hash: String,
});
module.exports = User;

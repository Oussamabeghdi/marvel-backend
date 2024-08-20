const mongoose = require("mongoose");

const User = mongoose.model("User", {
  email: String,
  favoritesCharacters: [String],
  favoritesComics: [String],
  account: {
    username: String,
  },
  token: String,
  hash: String,
  salt: String,
});
module.exports = User;

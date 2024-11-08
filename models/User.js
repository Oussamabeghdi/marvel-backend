const mongoose = require("mongoose");

const User = mongoose.model("User", {
  account: {
    username: String,
  },
  email: String,
  favoritesCharacters: [String],
  favoritesComics: [String],
  token: String,
  hash: String,
});
module.exports = User;

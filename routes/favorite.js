const express = require("express");
const User = require("../models/User");
const router = express.Router();

router.use(express.json());

const COMICS = "comics";
const CHARACTERS = "characters";
const FAVORITES_TYPES = [COMICS, CHARACTERS];

const getFavorites = {
  [COMICS]: (user) => user.favoritesComics,
  [CHARACTERS]: (user) => user.favoritesCharacters,
};

//La route : Dans les users je choisis userId, puis dans les favoris je choisis les comics

router.get("/users/:userId/favorites/:favoriteType", async (req, res) => {
  try {
    const userId = req.params.userId;
    const favoriteType = req.params.favoriteType;

    if (!FAVORITES_TYPES.includes(favoriteType)) {
      return res.status(404).json({ message: `Le type de favoris ${favoriteType} n'existe pas` });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: `L'utilisateur ${userId} n'existe pas` });
    }

    const favorites = getFavorites[favoriteType](user);

    res.status(200).json(favorites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/users/:userId/favorites/comics/:comicId", async (req, res) => {
  try {
    const comicId = req.params.comicId;
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: `L'utilisateur ${userId} n'existe pas` });
    }

    const userComicFavorites = user.favoritesComics || [];

    if (userComicFavorites.includes(comicId)) {
      return res.status(409).json({ message: `Le comic ${comicId} est déjà dans les favoris` });
    }

    userComicFavorites.push(comicId);

    await user.save();
    res.status(200).json(userComicFavorites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/users/:userId/favorites/characters/:characterId", async (req, res) => {
  try {
    const characterId = req.params.characterId;
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: `L'utilisateur ${userId} n'existe pas` });
    }

    const userCharacterFavorites = user.favoritesCharacters || [];

    if (userCharacterFavorites.includes(characterId)) {
      return res.status(409).json({
        message: `Le personnage ${characterId} est déjà dans les favoris`,
      });
    }

    userCharacterFavorites.push(characterId);

    await user.save();
    res.status(200).json(userCharacterFavorites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/users/:userId/favorites/comics/:comicId", async (req, res) => {
  try {
    const comicId = req.params.comicId;
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: `L'utilisateur ${userId} n'existe pas` });
    }

    const userComicFavorites = user.favoritesComics || [];

    if (!userComicFavorites.includes(comicId)) {
      return res.status(409).json({ message: `Le comic ${comicId} n'est pas dans les favoris` });
    }

    const index = userComicFavorites.indexOf(comicId);
    userComicFavorites.splice(index, 1); // ['1', '2', '3']

    await user.save();
    return res.status(200).json(userComicFavorites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/users/:userId/favorites/characters/:characterId", async (req, res) => {
  try {
    const characterId = req.params.characterId;
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: `L'utilisateur ${userId} n'existe pas` });
    }

    const userCharacterFavorites = user.favoritesCharacters || [];

    if (!userCharacterFavorites.includes(characterId)) {
      return res.status(409).json({
        message: `Le personnage ${characterId} n'est pas dans les favoris`,
      });
    }

    const index = userCharacterFavorites.indexOf(characterId);
    userCharacterFavorites.splice(index, 1); // ['1', '2', '3']

    await user.save();
    return res.status(200).json(userCharacterFavorites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

// router.get("/users/:userId/favorites/characters", async (req, res) => {
//     try {
//         const userId = req.params.userId;
//         const user = await User.findById(userId);
//
//         if (!user) {
//             return res.status(404).json({message: `L'utilisateur ${userId} n'existe pas`});
//         }
//
//         res.status(200).json(user.favoritesCharacters);
//     } catch (err) {
//         res.status(500).json({message: err.message});
//     }
// })

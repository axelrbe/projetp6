const Sauce = require("../models/Sauce");
// fs permet d'acceder et de manipuler les dossiers de l'ordinateur
const fs = require("fs");

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDislike: [],
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });

  sauce
    .save()
    .then(() => {
      res.status(201).json({ message: "Sauce enregistré !" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      res.status(200).json(sauce);
    })
    .catch((error) => {
      res.status(404).json({ error: error });
    });
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  delete sauceObject._userId;
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else if (req.file && sauce.imageUrl) {
        const imgUrl = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${imgUrl}`, () => {
          Sauce.updateOne(
            { _id: req.params.id },
            { ...sauceObject, _id: req.params.id }
          )
            .then(() => res.status(200).json({ message: "Sauce modifié!" }))
            .catch((error) => res.status(401).json({ error }));
        });
      } else {
        Sauce.updateOne(
          { _id: req.params.id },
          { ...sauceObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Sauce modifié!" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Sauce supprimé !" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => {
      res.status(200).json(sauces);
    })
    .catch((error) => {
      res.status(400).json({ error: error });
    });
};

exports.likeSauce = async (req, res, next) => {
  const sauceId = req.params.id;
  const userId = req.body.userId;
  const like = req.body.like;
  try {
    const sauce = await Sauce.findOne({ _id: sauceId });
    // Empecher l'utilisateur de liker ou disliker plusieurs fois
    if (like === 1 || like === -1) {
      if (
        sauce.usersLiked.includes(userId) ||
        sauce.usersDisliked.includes(userId)
      ) {
        return res
          .status(401)
          .json({
            message:
              "Chaque sauce ne peut être likée ou dislikée qu'une fois ni ne peut être à la fois likée et dislikée",
          });
      }
      if (like === 1) {
        await Sauce.updateOne(
          { _id: sauceId },
          {
            $inc: { likes: like },
            $push: { usersLiked: userId },
          }
        );
        return res.status(200).json({ message: "Sauce appréciée" });
      } else {
        await Sauce.updateOne(
          { _id: sauceId },
          {
            $inc: { dislikes: 1 },
            $push: { usersDisliked: userId },
          }
        );
        return res.status(200).json({ message: "Sauce depréciée" });
      }
    } else {
      // On s'assure que l'utilisateur a bien déjà liké ou disliké la sauce
      if (sauce.usersLiked.includes(userId)) {
        await Sauce.updateOne(
          { _id: sauceId },
          { $pull: { usersLiked: userId }, $inc: { likes: -1 } }
        );
        return res.status(200).json({ message: "like supprimé" });

        // enlever un dislike
      } else if (sauce.usersDisliked.includes(userId)) {
        await Sauce.updateOne(
          { _id: sauceId },
          {
            $pull: { usersDisliked: userId },
            $inc: { dislikes: -1 },
          }
        );
        return res.status(200).json({ message: "dislike supprimé" });
      }
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err });
  }
};

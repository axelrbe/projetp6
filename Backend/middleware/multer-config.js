const multer = require("multer");

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

const storage = multer.diskStorage({
  // On indique à multer où il doit enregistrer les fichiers
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  // On lui indique qu'il faut utiliser le nom d'origin en remplaçant les espaces par des underscore
  filename: (req, file, callback) => {
    const name = file.originalname.split(" ").join("_");
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + "." + extension);
  },
});

// On préçise que nous manipulons uniquement des images
module.exports = multer({ storage: storage }).single("image");

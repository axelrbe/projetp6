const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const MongooseErrors = require("mongoose-errors");

// Création d'un nouveau schema grâçe à mongoose
const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Ajoute les plugins
userSchema.plugin(uniqueValidator);
userSchema.plugin(MongooseErrors);

module.exports = mongoose.model("User", userSchema);

require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const saucesRoutes = require("./routes/sauce");
const userRoutes = require("./routes/user");
const path = require("path");

// connexion à la base de donnée mongoDB grâce à dotenv
mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_DB_ID}:${process.env.MONGO_DB_PASSWORD}@cluster0.g7tqhfl.mongodb.net/?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

const app = express();

//Utilise les headers pour permettre les requetes cross-origin
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

// Bodyparser nous sert a parser le body lors dès requetes de type post
app.use(bodyParser.json());

// Utilise les routes grâce à express
app.use("/api/sauces", saucesRoutes);
app.use("/api/auth", userRoutes);
app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;

const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();

const ejs = require("ejs");
app.set('view engine', 'ejs');

app.get("/", (req, res) => {
    res.render("home");
});

app.get('*', (req, res) => {
    res.status(404);
    res.render("404");
  });

app.listen(3000, () => {
    console.log('server is running on port 3000');
  });
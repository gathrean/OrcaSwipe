const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const { MongoClient, ObjectId } = require("mongodb");
const url = require("url");
require("dotenv").config();
const ejs = require("ejs");

const nodemailer = require('nodemailer');
const appEmail = process.env.EMAIL;
const appEmailPW = process.env.EMAIL_APP_PASSWORD;
const hostURL = process.env.HOST_URL
const resetExpiryTime = 10 * 60 * 1000;
const mailer = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: appEmail,
    pass: appEmailPW
  }
});

const app = express();
let usersCollection;

const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_cluster = process.env.MONGODB_CLUSTER;
const mongodb_database = process.env.MONGODB_DATABASE;
const node_session_secret = process.env.NODE_SESSION_SECRET;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
const hashedPassword = process.env.HASHED_PASSWORD;

app.set("view engine", "ejs");

const uri = `mongodb+srv://${mongodb_user}:${encodeURIComponent(mongodb_password)}@${mongodb_cluster}/${mongodb_database}`;

MongoClient.connect(uri, { useUnifiedTopology: true })
  .then((client) => {
    console.log("Connected to MongoDB");
    const db = client.db("OrcaDB");
    usersCollection = db.collection("users");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB", error);
  });

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

var mongoStore = MongoStore.create({
  mongoUrl: `mongodb+srv://${mongodb_user}:${encodeURIComponent(mongodb_password)}@${mongodb_cluster}/${mongodb_database}`,
  crypto: {
    secret: mongodb_session_secret,
  },
});

app.use(
  session({
    secret: node_session_secret,
    store: mongoStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60 * 60 * 1000,
    },
  })
);

app.get("/", (req, res) => {
  res.render("home", { loggedIn: req.session.loggedIn, username: req.session.username });
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get('/resetPassword', (req, res) => {
  res.render('resetPassword');
});

app.post('updatePassword', async (req, res) => {
  var email = req.params.email;
  var code = req.params.code;
})

app.post('/sendResetEmail', async (req, res) => {
  const email = req.body.resetEmail;
  const schema = Joi.object({
    resetEmail: Joi.string().email().required().max(50)
  });
  const validationResult = schema.validate(req.body);

  if (validationResult.error) {
    res.render('error.ejs', {link: 'resetPassword', error: validationResult.error});
  } else {
    const user = await usersCollection.findOne({ email: email });
    if (user.length != 1) {
      res.render('error', { link: 'resetPassword', error: 'Email is not registered.' })
    } else {
      const resetCode = Math.random().toString(36).substring(2, 8);;
      const target = `${hostURL}updatePassword?email=${email}&code=${resetCode}`;
      var mailOptions = {
        from: appEmail,
        to: email,
        subject: 'OrcaSwipe - Reset Your Password',
        html: `<a href="${target}">Reset Your Password</a>`
      };
      await user.updateOne({ resetCode: resetCode, resetExpiry: Date.now() + resetExpiryTime });
      await mailer.sendMail(mailOptions, function (error, info) {
        var result = error ? error : 'Email sent! Check your inbox.'
        res.render('resetEmailSent');
      });
    }
  }
});

app.get('/updatePassword', async (req, res) => {
  res.render('updatePassword');
})




app.post("/signup", async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(50).required(),
  });
  const validationResult = schema.validate(req.body);

  if (validationResult.error) {
    res.status(400).send(validationResult.error.details[0].message + "<br><a href='/signup'>Go back to sign up</a>");
  } else {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const newUser = {
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        admin: false
      };
      const result = await usersCollection.insertOne(newUser);
      req.session.loggedIn = true;
      req.session.username = newUser.name;
      req.session.email = newUser.email;
      res.redirect("/");
    } catch (error) {
      res.status(500).send("Error signing up.");
    }
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(50).required(),
  });

  const validationResult = schema.validate(req.body);

  if (validationResult.error) {
    res.status(400).send(validationResult.error.details[0].message + "<br><a href='/login'>Go back to log in</a>");
  } else {
    try {
      const user = await usersCollection.findOne({ email: req.body.email });
      if (user && (await bcrypt.compare(req.body.password, user.password))) {
        req.session.loggedIn = true;
        req.session.username = user.name;
        req.session.email = user.email;
        res.redirect("/");
      } else {
        res.status(401).send("Incorrect email or password.<br><a href='/login'>Go back to log in</a>");
      }
    } catch (error) {
      res.status(500).send("Error logging in.<br><a href='/login'>Go back to log in</a>");
    }
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session", err);
      res.status(500).send("Error logging out.");
    } else {
      res.redirect("/");
    }
  });
});

app.get("/admin", async (req, res) => {
  if (req.session.loggedIn) {
    const currentUser = await usersCollection.findOne({ email: req.session.email });
    if (currentUser && currentUser.admin) {
      const users = await usersCollection.find({}).toArray();
      res.render("admin", { users: users });
    } else {
      res.status(403).send("You must be an admin to access this page.<br><a href='/'>Go back to home page</a>");
    }
  } else {
    res.status(403).send("You must be logged in to access this page.<br><a href='/'>Go back to home page</a>");
  }
});

app.get("/promote/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    await usersCollection.updateOne({ _id: new ObjectId(userId) }, { $set: { admin: true } });
    res.redirect("/admin");
  } catch (error) {
    res.status(500).send("Error promoting user.");
  }
});

app.get("/demote/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    await usersCollection.updateOne({ _id: new ObjectId(userId) }, { $set: { admin: false } });
    res.redirect("/admin");
  } catch (error) {
    res.status(500).send("Error demoting user.");
  }
});


app.post('/settings', (req, res) => {
  // update the user's name and pod proximity in our database
  // not sure how to implement just yet
});

app.get("/members", (req, res) => {
  if (req.session.loggedIn) {
    res.render("members", { username: req.session.username });
  } else {
    res.status(403).send("You must be logged in to access the members area.<br><a href='/'>Go back to home page</a>");
  }
});

app.get('*', (req, res) => {
  res.status(404);
  res.render("404");
});

app.listen(3000, () => {
  console.log('server is running on port 3000');
});
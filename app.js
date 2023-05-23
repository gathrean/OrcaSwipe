// Import required modules
require("dotenv").config();

const express = require("express");                      // Import express
const session = require("express-session");              // Import express-session
const MongoStore = require("connect-mongo");             // Import connect-mongo
const Joi = require("joi");                              // Import Joi
const bcrypt = require("bcrypt");                        // Import bcrypt
const { MongoClient, ObjectId } = require("mongodb");    // Import Object from MongoDB
const url = require("url");                              // Import url
const ejs = require("ejs");                              // Import ejs

// For sending emails
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

// MongoDB collections
let usersCollection;
let podsCollection;
let testUsersCollection;
let testPodsCollection;

///// Firebase SDK /////
const admin = require("firebase-admin");

const serviceAccount = JSON.parse(process.env.IMAGE_FIREBASE_JSON);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "orcaswipe-8ae9b.appspot.com"
});

const bucket = admin.storage().bucket();


///// Multer Middleware needed for file upload /////
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Environment variables
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_cluster = process.env.MONGODB_CLUSTER;
const mongodb_database = process.env.MONGODB_DATABASE;
const node_session_secret = process.env.NODE_SESSION_SECRET;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
const hashedPassword = process.env.HASHED_PASSWORD;
// End of environment variables

// Set up the port
const PORT = process.env.PORT || 3000;

// Set the view engine for the app to EJS
app.set("view engine", "ejs");

// Construct the MongoDB connection URI using the provided variables
const uri = `mongodb+srv://${mongodb_user}:${encodeURIComponent(mongodb_password)}@${mongodb_cluster}/${mongodb_database}`;

// Connect to MongoDB using the provided URI and enable unified topology
MongoClient.connect(uri, { useUnifiedTopology: true })
  .then((client) => {
    console.log("Connected to MongoDB");
    const db = client.db("OrcaDB");
    usersCollection = db.collection("users");
    podsCollection = db.collection("pods");
    testUsersCollection = db.collection("testusers");
    testPodsCollection = db.collection("testpods");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB", error);
  });

// Enable JSON parsing middleware for the app
app.use(express.json());

// Enable URL-encoded parsing middleware for the app
app.use(express.urlencoded({ extended: false }));

// Serve static files from the "public" directory
app.use(express.static("public"));

// Serve static files from the "/views/splash" directory
app.use('/splash', express.static('views/splash'));

// Serve static files from the "/views/chat" directory
app.use('/chat/uploads', express.static('uploads'));

// Serve static files from /uplaods directory for photo rendering
app.use('/uploads', express.static('uploads'));


// Create a MongoStore instance for session management, using the MongoDB 
var mongoStore = MongoStore.create({
  mongoUrl: `mongodb+srv://${mongodb_user}:${encodeURIComponent(mongodb_password)}@${mongodb_cluster}/${mongodb_database}`,
  crypto: {
    secret: mongodb_session_secret,
  },
});

// Enable session middleware for the app, with the following configurations:
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

// GET request for the root URL
app.get("/", (req, res) => {
  res.render("splash/splash", { loggedIn: req.session.loggedIn, name: req.session.name, currentPage: 'splash' });
});

// GET request for the "/home" URL
app.get("/home", async (req, res) => {
  const user = await fetchUserData(req);
  res.render("home", { loggedIn: req.session.loggedIn, name: req.session.name, currentPage: 'home', user });
});

// Fetch the user data
async function fetchUserData(req) {
  if (req.session.loggedIn) {
    return await usersCollection.findOne({ email: req.session.email });
  }
  return null;
}


// GET request for the "/splash" URL
app.get("/splash", (req, res) => {
  res.render("splash/splash", { loggedIn: req.session.loggedIn, username: req.session.username, currentPage: 'splash' });
});

// POST request for the "/splash" URL
app.post("/splash", (req, res) => {
  const { action } = req.body;

  if (action === "signup") {
    // Handle signup logic
    res.redirect("/signup"); // Redirect to the signup page
  } else if (action === "login") {
    // Handle login logic
    res.redirect("/login"); // Redirect to the login page
  } else {
    res.status(400).send("Invalid action");
  }
});

// GET request for the "/signup" URL
app.get("/signup", (req, res) => {
  res.render("splash/signup", { currentPage: 'signup' });
});

// GET request for the "/resetPassword" URL
app.get('/resetPassword', async (req, res) => {
  let user = null;
  if (req.session.loggedIn) {
    user = await usersCollection.findOne({ email: req.session.email });
  }
  res.render('resetting-passwords/resetPassword', { user: user });
});


// GET request for the "/createNewPassword" URL
app.get('/createNewPassword', async (req, res) => {
  var email = req.params.email;
  var code = req.params.code;
  let user = null;
  if (req.session.loggedIn) {
    user = await usersCollection.findOne({ email: req.session.email });
  }
  res.render('createNewPassword', { code: code, email: email, user: user });
})

// POST request for the "/submitPassword" URL
app.post('/submitPassword', async (req, res) => {
  const email = req.body.email;
  console.log(email)
  const code = req.body.code;
  const password = req.body.password;
  const schema = Joi.object({
    email: Joi.string().email().required().max(50),
    code: Joi.string().required().max(50),
    password: Joi.string().required().max(50)
  });
  const validationResult = schema.validate(req.body);
  if (validationResult.error) {
    res.render('errors/error', { link: 'createNewPassword', error: validationResult.error });
  } else {

    const user = await usersCollection.findOne({
      $and: [
        { email: email },
        { resetCode: code }
      ]
    });
    if (user == null) {
      res.render('errors/error', { link: "resetting-passwords/resetPassword", error: 'Reset code is invalid, please try again.' });;
    }
    if (Date.now() < user.resetExpiry) {
      var newPassword = await bcrypt.hash(req.body.password, 10);
      await usersCollection.updateOne({ email: email }, { $set: { password: newPassword } });
      res.redirect('/login');
    } else {
      res.render('errors/error', { link: "resetting-passwords/resetPassword", error: 'Reset has expired, please try again.' })
    }
  }

})

// POST request for the "/sendResetEmail" URL
app.post('/sendResetEmail', async (req, res) => {
  const email = req.body.resetEmail;
  const schema = Joi.object({
    resetEmail: Joi.string().email().required().max(50)
  });
  const validationResult = schema.validate(req.body);

  if (validationResult.error) {
    res.render('errors/error.ejs', { link: 'resetting-passwords/resetPassword', error: validationResult.error });
  } else {
    const user = await usersCollection.find({ email: email });
    if (user == null) {
      res.render('errors/error', { link: 'resetting-passwords/resetPassword', error: 'Email is not registered.' })
    } else {
      const resetCode = Math.random().toString(36).substring(2, 8);;
      const target = `${hostURL}updatePassword?email=${email}&code=${resetCode}`;
      var mailOptions = {
        from: appEmail,
        to: email,
        subject: 'OrcaSwipe - Reset Your Password',
        html: `<a href="${target}">Reset Your Password</a>`

      };
      await usersCollection.updateOne(
        { email: email },
        { $set: { resetCode: resetCode, resetExpiry: Date.now() + resetExpiryTime } });
      await mailer.sendMail(mailOptions, function (error, info) {
        var result = error ? error : 'Email sent! Check your inbox.'
        res.render('resetting-passwords/resetEmailSent', { result: result });
      });
    }
  }
});

// POST request for the "/updatePassword" URL
app.get('/updatePassword', async (req, res) => {
  const code = req.query.code;
  const email = req.query.email;
  let user = null;
  if (req.session.loggedIn) {
    user = await usersCollection.findOne({ email: req.session.email });
  }
  res.render('resetting-passwords/updatePassword', { code: code, email: email, user: user });
})


// POST request for the "/updateSettings" URL
app.post("/updateSettings", async (req, res) => {
  if (req.session.loggedIn) {
    const schema = Joi.object({
      podProximity: Joi.number().min(0).max(100).required(),
    });

    const validationResult = schema.validate(req.body);

    if (validationResult.error) {
      res.status(400).send(validationResult.error.details[0].message + "<br><a href='/settings'>Go back to settings</a>");
    } else {
      try {
        const updatedUser = {
          podProximity: req.body.podProximity * 1000,
        };
        await usersCollection.updateOne({ email: req.session.email }, { $set: updatedUser });
        req.session.name = updatedUser.name;
        res.redirect("/settings");
      } catch (error) {
        res.status(500).send("Error updating user settings.<br><a href='/settings'>Go back to settings</a>");
      }
    }
  } else {
    res.status(403).send("You must be logged in to update your settings.<br><a href='/'>Go back to home page</a>");
  }
});

// POST request for the "/signup" URL
app.post("/signup", async (req, res) => {
  const schema = Joi.object({
    username: Joi.string().max(50).required(),
    name: Joi.string().max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(50).required(),
  });
  const validationResult = schema.validate(req.body);
  usersCollection.createIndex({ "email" : 1 }, { unique : true });

  if (validationResult.error) {
    res.status(400).send(validationResult.error.details[0].message + "<br><a href='/signup'>Go back to sign up</a>");
  } else {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const newUser = {
        username: req.body.username,
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        admin: false,
        eventsAttended: [],
        interests: [],
        podProximity: 10000
      };
      const result = await usersCollection.insertOne(newUser);
      req.session.loggedIn = true;
      req.session.name = newUser.name;
      req.session.email = newUser.email;
      res.redirect("/editProfile");
    } catch (error) {
      if (error.code == 11000){
        res.send(`<div>This email is already in use.</div><a id="retry" href="/signup"Try Again</a>`);
      } else {
      res.status(500).send("Error signing up.");
      }
    }
  }
});

// POST request for the "/savePod" URL
app.post('/savePod', async (req, res) => {
  var pod = req.body.pod;  // assuming your body contains a 'pod' field
  var email = req.session.email;

  const user = await usersCollection.findOne({ email: email });
  if (!user) {
    console.error('User not found');
    return res.sendStatus(500);
  }

  usersCollection.updateOne({ email: email }, { $push: { eventsAttended: pod } })
    .then(() => {
      const attendee = [];
      // update the attenders field in the pod (CHANGE THIS LATER TO HAVE FULL USER INFO)
      podsCollection.updateOne({ _id: new ObjectId(pod._id) }, { $push: { attenders: user._id } })
        .then(() => {
          res.sendStatus(200);
        })
        .catch((err) => {
          console.error(err);
          res.sendStatus(500);
        });
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
});

// GET request for the "/login" URL
app.get("/login", (req, res) => {
  res.render("splash/login", { currentPage: 'login' });
});

// POST request for the "/login" URL
app.post("/login", async (req, res) => {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().min(6).max(50).required(),
  });

  const validationResult = schema.validate(req.body);

  if (validationResult.error) {
    res.status(400).send(validationResult.error.details[0].message + "<br><a href='/login'>Go back to log in</a>");
  } else {
    try {
      const user = await usersCollection.findOne({ username: req.body.username });
      if (user && (await bcrypt.compare(req.body.password, user.password))) {
        req.session.loggedIn = true;
        req.session.name = user.name;
        req.session.email = user.email;
        res.redirect("/findPods");
      } else {
        res.status(401).send("Incorrect username and password.<br><a href='/login'>Go back to log in</a>");
      }
    } catch (error) {
      res.status(500).send("Error logging in.<br><a href='/login'>Go back to log in</a>");
    }
  }
});

// GET request for the "/logout" URL
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

// GET request for the "/admin" URL
app.get("/admin", async (req, res) => {
  if (req.session.loggedIn) {
    const currentUser = await usersCollection.findOne({ email: req.session.email });
    if (currentUser && currentUser.admin) {
      const users = await usersCollection.find({}).toArray();
      res.render("admin/admin", { users: users, currentPage: 'admin' });
    } else {
      res.status(403).send("You must be an admin to access this page.<br><a href='/'>Go back to home page</a>");
    }
  } else {
    res.status(403).send("You must be logged in to access this page.<br><a href='/'>Go back to home page</a>");
  }
});

// Button to promote User to Admin
app.get("/promote/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    await usersCollection.updateOne({ _id: new ObjectId(userId) }, { $set: { admin: true } });
    res.redirect("/admin");
  } catch (error) {
    res.status(500).send("Error promoting user.");
  }
});

// Button to demote Admin to User
app.get("/demote/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    await usersCollection.updateOne({ _id: new ObjectId(userId) }, { $set: { admin: false } });
    res.redirect("/admin");
  } catch (error) {
    res.status(500).send("Error demoting user.");
  }
});

// GET request for the "/settings" URL
app.get("/settings", async (req, res) => {
  if (req.session.loggedIn) {
    try {
      const user = await usersCollection.findOne({ email: req.session.email });
      res.render("settings", { user: user, currentPage: 'settings' });
    } catch (error) {
      res.status(500).send("Error retrieving user data.");
    }
  } else {
    res.status(403).send("You must be logged in to access this page.<br><a href='/'>Go back to home page</a>");
  }
});

app.get("/members", async (req, res) => {
  if (req.session.loggedIn) {
    let user = await usersCollection.findOne({ email: req.session.email });
    res.render("members", { name: req.session.name, currentPage: 'members', user: user });
  } else {
    res.status(403).send("You must be logged in to access the members area.<br><a href='/'>Go back to home page</a>");
  }
});

// GET request for the "/pods" URL
app.get("/attendedpods", async (req, res) => {
  if (req.session.loggedIn) {
    const user = await usersCollection.findOne({ email: req.session.email });
    const attendedPods = await podsCollection.find({ attenders: user._id }).toArray();
    if (!user) {
      console.log(`User email from session: ${req.session.email}`);
      console.log('User from DB: ', user);
      return res.status(500).send('User not found');
    }
    res.render("attendedpods", {
      activeTab: 'attendedpods',
      currentPage: 'attendedPods',
      attendedPods: attendedPods,
      user: user,
    });
  } else {
    res.status(403).send("You must be logged in to access the pods page.<br><a href='/'>Go back to home page</a>")
  }
});

app.post("/pod/:podId/upvote", async (req, res) => {
  if (!req.session.loggedIn) {
    return res.status(403).send("You must be logged in to vote.<br><a href='/'>Go back to home page</a>")
  }
  
  const user = await usersCollection.findOne({ email: req.session.email });
  const podId = req.params.podId;
  
  if (!user) {
    return res.status(404).send('User not found');
  }
  
  try {
    await podsCollection.updateOne({ _id: new ObjectId(podId) }, { 
      $addToSet: { upvotes: user._id }, 
      $pull: { downvotes: user._id } 
    });
    res.status(200).send();
  } catch (error) {
    res.status(500).send('Error voting on pod');
  }
});

app.post("/pod/:podId/downvote", async (req, res) => {
  if (!req.session.loggedIn) {
    return res.status(403).send("You must be logged in to vote.<br><a href='/'>Go back to home page</a>")
  }
  
  const user = await usersCollection.findOne({ email: req.session.email });
  const podId = req.params.podId;
  
  if (!user) {
    return res.status(404).send('User not found');
  }
  
  try {
    await podsCollection.updateOne({ _id: new ObjectId(podId) }, { 
      $addToSet: { downvotes: user._id }, 
      $pull: { upvotes: user._id } 
    });
    res.status(200).send();
  } catch (error) {
    res.status(500).send('Error voting on pod');
  }
});

// GET request for the "/createdpods" URL
app.get("/createdpods", async (req, res) => {
  if (req.session.loggedIn) {
    const user = await fetchUserData(req);
    try {
      const createdPods = await podsCollection.find({ creator: req.session.email }).toArray();
      res.render("createdpods", { activeTab: 'createdpods', currentPage: 'createdPods', createdPods: createdPods, user });
    } catch (error) {
      res.status(500).send("Error retrieving created pods.<br><a href='/'>Go back to home page</a>")
    }
  } else {
    res.status(403).send("You must be logged in to access the create pods page.<br><a href='/'>Go back to home page</a>")
  }
});

app.post('/deletePod', async (req, res) => {

  const schema = Joi.object({
    id: Joi.string().hex().length(24)
  })
  var validationResult = schema.validate({ id: req.body.podID });

  if (!(validationResult.error)) {
    console.log(req.body.podID)
    var targetID = new ObjectId(req.body.podID)
    var query = { $and: [{ _id: targetID }, { creator: req.session.email }] }
    var targetPod = await podsCollection.deleteOne(query);

    console.log(targetID)
    //console.log(await testUsersCollection.find(filter).project().toArray())
    var userArr = await usersCollection.find().project().toArray();
    userArr.forEach(async (u) => {
      var events = u.eventsAttended;
      for (var i = 0; i < events.length; i++) {
        if (events[i]._id == targetID) {
          events.splice(i, 1);
          i--;
        }
      }
      await usersCollection.updateOne({ _id: u._id }, {
        $set: { eventsAttended: events }
      })
    })
  }
  const createdPods = await podsCollection.find({ creator: req.session.email }).toArray();
  res.redirect("/createdpods");
});
// Fetch the user data
async function fetchUserData(req) {
  if (req.session.loggedIn) {
    return await usersCollection.findOne({ email: req.session.email });
  }
  return null;
}

// GET request for the "/createpod" URL
app.get("/createpod", async (req, res) => {
  if (req.session.loggedIn) {
    const user = await fetchUserData(req);
    res.render("createpod", { currentPage: 'pods', user: user });
  }
});

app.post("/createpod", upload.single('image'), async (req, res) => {
  console.log(req.body);

  if (req.session.loggedIn) {
    let { name, eventDescription } = req.body;
    var location = { lat: req.body.lat, lng: req.body.lng };

    console.log(req.file);

    let image = ''; // Define image here

    if (req.file) {
      // Uploads a local file to the bucket
      const file = await bucket.upload(req.file.path, {
        // Support for HTTP requests made with `Accept-Encoding: gzip`
        gzip: true,
        metadata: {
          // Enable long-lived HTTP caching headers
          // Use only if the contents of the file will never change
          cacheControl: 'public, max-age=31536000',
        },
      });

      // Assign a value to image 
      image = `https://firebasestorage.googleapis.com/v0/b/orcaswipe-8ae9b.appspot.com/o/${encodeURI(req.file.filename)}?alt=media`;

      console.log(`${req.file.filename} uploaded to Firebase.`);
    } // No need for an else block because image is already defined as an empty string

   // Create an array of checked interests.
   let tags = []
   if (req.body.interests) {
       tags = Array.isArray(req.body.interests) ? req.body.interests : [req.body.interests];
   }
   

    const creator = req.session.email;
    let attenders = [];
    let upvotes = []; // Empty array for upvotes
    let downvotes = []; // Empty array for downvotes
    const newPod = { name, tags, eventDescription, attenders, creator, location, image, upvotes, downvotes }; 

   // Adjust the Joi validation schema.
   const schema = Joi.object({
     name: Joi.string().required(),
     tags: Joi.array().items(Joi.string()), 
     eventDescription: Joi.string().required(),
     attenders: Joi.array(),
     creator: Joi.string(),
     location: Joi.object({
       lat: Joi.number().required(),
       lng: Joi.number().required()
     }),
     image: Joi.string().uri(),  // validates image as a URL
     upvotes: Joi.array(), // Validates upvotes as an array
     downvotes: Joi.array() // Validates downvotes as an array
   });


    const validationResult = schema.validate(newPod);

    if (validationResult.error) {
      res.status(400).send(validationResult.error.details[0].message + "<br><a href='/createpod'>Go back</a>");
    } else {
      try {
        const result = await podsCollection.insertOne(newPod);
        res.redirect("/attendedPods");
      } catch (error) {
        res.status(500).send("Error creating pod.<br><a href='/createpod'>Go back</a>");
      }
    }
  } else {
    res.status(403).send("You must be logged in to create a pod.<br><a href='/'>Go back to home page</a>");
  }
});


// GET request for the "/profile" URL
app.get("/profile", async (req, res) => {
  if (req.session.loggedIn) {
    try {
      const user = await usersCollection.findOne({ email: req.session.email });
      res.render("profile", { user: user, currentPage: 'profile' });
    } catch (error) {
      res.status(500).send("Error retrieving user data.");
    }
  } else {
    res.status(403).send("You must be logged in to access this page.<br><a href='/'>Go back to home page</a>");
  }
});

// GET request for the "/editProfile" URL
app.get("/editProfile", async (req, res) => {
  if (req.session.loggedIn) {
    try {
      const user = await usersCollection.findOne({ email: req.session.email });
      res.render("editProfile", { user: user, currentPage: 'editProfile' });
    } catch (error) {
      res.status(500).send("Error retrieving user data.");
    }
  } else {
    res.status(403).send("You must be logged in to access this page.<br><a href='/'>Go back to home page</a>");
  }
});

// POST request for the "/findPods" URL
app.get("/findPods", async (req, res) => {
  var email = req.session.email;
  var user = await usersCollection.findOne({ email: email });
  console.log(user)
  res.render('findPods', { currentPage: 'findPods', maxDist: user.podProximity != null ? user.podProximity : 10000, user: user });
})


app.get("/getUserInterests", async (req, res) => {
  var email = req.session.email;
  var user = await usersCollection.findOne({ email: email });
  res.json(user.interests);
});


// GET request for the "/getPods" URL
// (NOT to be confused with /findPods)
app.get('/getPods', async (req, res) => {
  var email = req.session.email;
  var user = await usersCollection.findOne({ email: email });
  var attendedPods = user.eventsAttended || [];
  var userInterests = user.interests;  // Get the user's interests

  let pods;

  // Prepare a query where at least one tag from the list overlaps with user's interests
    pods = await podsCollection.find({
      name: { $nin: attendedPods.map(pod => pod.name) },
      tags: { $in: userInterests }
    }).toArray();
  
  // console.log(pods.length);
  for (var i = 0; i < pods.length; i++) {
    pods[i] = JSON.stringify(pods[i]);
  }
  res.json(pods);
});

//Populates the show attenders card
app.get("/pod/:id/attenders", async (req, res) => {
  const podId = new ObjectId(req.params.id);
  const pod = await podsCollection.findOne({ _id: podId });

  if (!pod) {
    return res.status(404).send("Pod not found");
  }

  const attenders = await usersCollection.find({ _id: { $in: pod.attenders } }).toArray();
        const attendersInfo = attenders.map(attender => ({
            email: attender.email,
            username: attender.username,
            profileImage: attender.image,
        }));
        res.json(attendersInfo);
});

//leaving the pod
app.post("/pod/:podId/leave", async (req, res) => {
  if (req.session.loggedIn) {
    try {
      const podId = req.params.podId;
      const user = await usersCollection.findOne({ email: req.session.email });

      if (user) {
        await podsCollection.updateOne(
          { _id: new ObjectId(podId) },
          { $pull: { attenders: user._id,upvotes: user._id,
            downvotes: user._id } }
        );
        await usersCollection.updateOne(
          { _id: new ObjectId(user._id) },
          { $pull: { eventsAttended: { _id: podId } } }
        );
        res.redirect("/attendedPods");  // Add this line
        res.status(200).send();
      } else {
        res.status(404).send('User not found');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Error leaving pod');
    }
  } else {
    res.status(403).send('You must be logged in to leave a pod');
  }
});

// GET request for the "/viewProfile" URL  res.json(attenders);
app.get("/viewProfile", async (req, res) => {
  if (req.session.loggedIn) {
    try {
      const user = await usersCollection.findOne({ email: req.session.email });
      res.render('viewProfile', { user: user });

    } catch (error) {
      res.status(500).send("Error retrieving user data.");
    }
  } else {
    res.status(403).send("You must be logged in to access this page.<br><a href='/'>Go back to home page</a>");
  }
});

// POST request for the "/updateProfile" URL
app.post("/updateProfile", upload.single('profilePhoto'), async (req, res) => {
  if (req.session.loggedIn) {
    let imagePath;
    if (req.file) {
      imagePath = 'uploads/' + req.file.filename;
    }

    const schema = Joi.object({
      name: Joi.string().max(50).optional(),
      username: Joi.string().max(50).optional(),
      email: Joi.string().email().optional(),
      birthday: Joi.date().optional(),
      pronouns: Joi.string().max(50).optional(),
      interests: Joi.array().items(Joi.string()).max(10).optional(),
      image: Joi.string().optional()
    });

    if (!Array.isArray(req.body.interests)) {
      if (typeof req.body.interests != 'undefined') {
        req.body.interests = [req.body.interests];
      } else {
        req.body.interests = [];
      }
    }

    if (imagePath) {
      req.body.image = imagePath;
    }

    const validationResult = schema.validate(req.body);

    if (validationResult.error) {
      res.status(400).send(validationResult.error.details[0].message + "<br><a href='/editProfile'>Go back to edit profile</a>");
    } else {
      try {
        const user = await usersCollection.findOne({ email: req.session.email });
        if (user) {
          const updatedUser = {
            name: req.body.name,
            username: req.body.username,
            email: req.body.email,
            birthday: new Date(req.body.birthday),
            pronouns: req.body.pronouns,
            interests: req.body.interests,
            image: req.body.image,
          };
          await usersCollection.updateOne({ email: req.session.email }, { $set: updatedUser });
          req.session.name = updatedUser.name;
          req.session.email = updatedUser.email;
          res.redirect("/profile");
        } else {
          res.status(401).send("User not found.<br><a href='/editProfile'>Go back to edit profile</a>");
        }
      } catch (error) {
        res.status(500).send("Error updating profile.<br><a href='/editProfile'>Go back to edit profile</a>");
      }
    }
  } else {
    res.status(403).send("You must be logged in to update your profile.<br><a href='/'>Go back to home page</a>");
  }
});

// GET request for the "/chat" URL
app.get("/chat", async (req, res) => {
  if (req.session.loggedIn) {
    try {
      const user = await usersCollection.findOne({ email: req.session.email });
      res.render("chat", { user: user, currentPage: 'chat' });
    } catch (error) {
      res.status(500).send("Error retrieving user data.");
    }
  } else {
    res.status(403).send("You must be logged in to access this page.<br><a href='/'>Go back to home page</a>");
  }
});

// GET request to catch all other routes that are not defined
app.get('*', async (req, res) => {
  let user = null;
  if (req.session.loggedIn) {
    user = await usersCollection.findOne({ email: req.session.email });
  }
  res.status(404);
  res.render("errors/404", { user: user });
});

// Start server
app.listen(PORT, () => {
  console.log('server is running on port 3000');
});
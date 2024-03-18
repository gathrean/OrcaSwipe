// Server-side  of OrcaSwipe and app's main entry point

// Import required modules
require("dotenv").config();

const express = require("express"); // Import express
const session = require("express-session"); // Import express-session
const MongoStore = require("connect-mongo"); // Import connect-mongo
const Joi = require("joi"); // Import Joi
const bcrypt = require("bcrypt"); // Import bcrypt
const {
  MongoClient,
  ObjectId
} = require("mongodb"); // Import Object from MongoDB
const url = require("url"); // Import url
const ejs = require("ejs"); // Import ejs
const {
  DateTime
} = require('luxon');

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
const openai = require('openai');

// Serve static files from the 'public' directory
app.use(express.static('public'));

//// Open AI API ////
const configuration = new openai.Configuration({
  organization: process.env.OPENAI_ORG,
  apiKey: process.env.OPENAI_API_KEY,
});
const openaiapi = new openai.OpenAIApi(configuration);



// MongoDB collections
let usersCollection;
let podsCollection;
let testUsersCollection;
let testPodsCollection;

///// Firebase SDK /////
require('dotenv').config();

const admin = require("firebase-admin");

const serviceAccount = {
  type: process.env.TYPE,
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: process.env.AUTH_URI,
  token_uri: process.env.TOKEN_URI,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
  universe_domain: process.env.UNIVERSE_DOMAIN
}

// Check if the Firebase app has already been initialized
if (!admin.apps.length) {
  // If not initialized, initialize the Firebase app
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: `${process.env.PROJECT_ID}.appspot.com`
  });
}

const bucket = admin.storage().bucket();

const multer = require('multer');
const upload = multer({
  dest: '/tmp/uploads/'
});

// Environment variables
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_cluster = process.env.MONGODB_CLUSTER;
const mongodb_database = process.env.MONGODB_DATABASE;
const node_session_secret = process.env.NODE_SESSION_SECRET;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
const hashedPassword = process.env.HASHED_PASSWORD;
// End of environment variables

// Interest tags
const interests = ['Beach Clean-up', 'Volunteer', 'Charity', 'Clothing drive', 'Blood drive', 'Art', 'Cancer Walk', 'Travel', 'Photography']

// Set up the port
const PORT = process.env.PORT || 3000;

const path = require('path');

// Set the view engine for the app to EJS
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));

// Construct the MongoDB connection URI using the provided variables
const uri = `mongodb+srv://${mongodb_user}:${encodeURIComponent(mongodb_password)}@${mongodb_cluster}/${mongodb_database}`;

// Connect to MongoDB using the provided URI and enable unified topology
MongoClient.connect(uri, {
  useUnifiedTopology: true
})
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
app.use(express.urlencoded({
  extended: false
}));

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
  res.render("splash/splash", {
    loggedIn: req.session.loggedIn,
    name: req.session.name,
    currentPage: 'splash'
  });
});

// GET request for the "/home" URL
app.get("/home", async (req, res) => {
  var email = req.session.email;
  var user = await usersCollection.findOne({
    email: email
  });
  res.render("home", {
    loggedIn: req.session.loggedIn,
    name: req.session.name,
    currentPage: 'home',
    user: user
  });
});

// POST request for the "/home" URL
app.post("/home", async (req, res) => {
  const messages = req.body.messages;
  const model = req.body.model;
  const temp = req.body.temp;

  const completion = await openaiapi.createChatCompletion({
    model: model,
    messages: messages,
    temperature: temp,
  });
  res.status(200).json({
    result: completion.data.choices
  });
});

// Fetch the user data
async function fetchUserData(req) {
  if (req.session.loggedIn) {
    return await usersCollection.findOne({
      email: req.session.email
    });
  }
  return null;
}


// GET request for the "/splash" URL
app.get("/splash", (req, res) => {
  res.render("splash/splash", {
    loggedIn: req.session.loggedIn,
    username: req.session.username,
    currentPage: 'splash'
  });
});

// POST request for the "/splash" URL
app.post("/splash", (req, res) => {
  const {
    action
  } = req.body;

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
  res.render("splash/signup", {
    currentPage: 'signup'
  });
});

// GET request for the "/resetPassword" URL
app.get('/resetPassword', async (req, res) => {
  let user = null;
  if (req.session.loggedIn) {
    user = await usersCollection.findOne({
      email: req.session.email
    });
  }
  res.render('resetting-passwords/resetPassword', {
    user: user
  });
});


// GET request for the "/createNewPassword" URL
app.get('/createNewPassword', async (req, res) => {
  var email = req.params.email;
  var code = req.params.code;
  let user = null;
  if (req.session.loggedIn) {
    user = await usersCollection.findOne({
      email: req.session.email
    });
  }
  res.render('createNewPassword', {
    code: code,
    email: email,
    user: user
  });
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
    res.render('errors/error', {
      link: 'createNewPassword',
      error: validationResult.error
    });
  } else {

    const user = await usersCollection.findOne({
      $and: [{
        email: email
      },
      {
        resetCode: code
      }
      ]
    });
    if (user == null) {
      res.render('errors/error', {
        link: "resetting-passwords/resetPassword",
        error: 'Reset code is invalid, please try again.'
      });;
    }
    if (Date.now() < user.resetExpiry) {
      var newPassword = await bcrypt.hash(req.body.password, 10);
      await usersCollection.updateOne({
        email: email
      }, {
        $set: {
          password: newPassword
        }
      });
      res.redirect('/login');
    } else {
      res.render('errors/error', {
        link: "resetting-passwords/resetPassword",
        error: 'Reset has expired, please try again.'
      })
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
    res.render('errors/error', {
      link: 'resetting-passwords/resetPassword',
      error: validationResult.error
    });
  } else {
    const user = await usersCollection.find({
      email: email
    });
    if (user == null) {
      res.render('errors/error', {
        link: 'resetting-passwords/resetPassword',
        error: 'Email is not registered.'
      })
    } else {
      const resetCode = Math.random().toString(36).substring(2, 8);;
      const target = `${hostURL}updatePassword?email=${email}&code=${resetCode}`;
      var mailOptions = {
        from: appEmail,
        to: email,
        subject: 'OrcaSwipe - Reset Your Password',
        html: `
        <html>
          <head>
            <style>
              /* Add your CSS styles here */

              body {
                background: linear-gradient(360deg, #4676EE, #134ACC);
                font-family: 'Montserrat', sans-serif;
                display: flex;
                flex-direction: column;
                height: 50vh;
                width: 50vw;
                font-size: 16px;
                ;
              }

              h1 {
                color: white;
                font-size: 24px;
                font-weight: bold;
                display: flex;
                align-items: center;
              }

              p {
                color: white;
                font-size: 16px;
              }

              a {
                display: inline-block;
                padding: 10px 20px;
                background-color: #007bff;
                color: #fff;
                text-decoration: none;
                border-radius: 4px;
              }

              .btn {
                display: inline-block;
                padding: 10px 20px;
                border: 2px solid white;
                border-radius: 50px;
                color: white;
                background-color: transparent;
                font-size: 13px;
                text-decoration: none;
                cursor: pointer;
                transition: background-color 0.3s ease, color 0.3s ease;
                width: 200px;
              }
            
              .btn:hover {
                  background-color: rgba(0, 0, 0, 0.75);
                  color: white;
              }
            
              .white-button {
                  color: #134ACC;
                  background: white;
                  border-color: #cfd1d3;
                  width: min-content;
              }

              .navbar {
                display: flex;
                justify-content: center;
                background: linear-gradient(360deg, #134ACC, #134ACC);
                width: 100%;
                padding: 10px 20px 10px 20px;
            }
              .navbar-brand img {
                height: 30px;
                width: auto;
              } 
            </style>
          </head>
          <body>
            <div class="navbar-brand">
                <img
                    src="https://cdn.discordapp.com/attachments/828116217285836825/1110053979540430969/OrcaSwipe_Header_Logo.png">
            </div>

            <h1>Did you change your password?</h1>

            <p>
              We noticed the password for your OrcaSwipe account was recently changed. 
              <br><br>
              If you didn't make this change, you can ignore this message.
            </p>
            <hr>
            <a class="btn blue-button" href="${target}">Reset Your Password</a>
          </body>
        </html>
        `
      };
      await usersCollection.updateOne({
        email: email
      }, {
        $set: {
          resetCode: resetCode,
          resetExpiry: Date.now() + resetExpiryTime
        }
      });
      await mailer.sendMail(mailOptions, function (error, info) {
        var result = error ? error : 'Email sent! Check your inbox.'
        res.render('resetting-passwords/resetEmailSent', {
          result: result
        });
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
    user = await usersCollection.findOne({
      email: req.session.email
    });
  }
  res.render('resetting-passwords/updatePassword', {
    code: code,
    email: email,
    user: user
  });
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
        await usersCollection.updateOne({
          email: req.session.email
        }, {
          $set: updatedUser
        });
        req.session.name = updatedUser.name;
        res.redirect("/findPods");
      } catch (error) {
        res.status(500).send("Error updating user settings.<br><a href='/settings'>Go back to settings</a>");
      }
    }
  } else {
    res.status(403).render("errors/403");
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
  usersCollection.createIndex({
    "email": 1
  }, {
    unique: true
  });
  usersCollection.createIndex({
    "username": 1
  }, {
    unique: true
  });

  if (validationResult.error) {
    res.render('splash/signup', {
      errorMessage: validationResult.error.details[0].message
    });
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
        podProximity: 3000000
      };
      const result = await usersCollection.insertOne(newUser);
      req.session.loggedIn = true;
      req.session.name = newUser.name;
      req.session.email = newUser.email;
      res.redirect("/home");
    } catch (error) {
      if (error.code == 11000) {
        var problemField = Object.keys(error.keyValue);
        res.render('splash/signup', {
          errorMessage: `${problemField} is already in use.`
        });
      } else {
        res.render('splash/signup', {
          errorMessage: 'Error signing up.'
        });
      }
    }
  }
});

// POST request for the "/savePod" URL
app.post('/savePod', async (req, res) => {
  var pod = req.body.pod; // assuming your body contains a 'pod' field
  var email = req.session.email;

  const user = await usersCollection.findOne({
    email: email
  });
  if (!user) {
    console.error('User not found');
    return res.sendStatus(500);
  }

  usersCollection.updateOne({
    email: email
  }, {
    $push: {
      eventsAttended: pod
    }
  })
    .then(() => {
      const attendee = [];
      // update the attenders field in the pod (CHANGE THIS LATER TO HAVE FULL USER INFO)
      podsCollection.updateOne({
        _id: new ObjectId(pod._id)
      }, {
        $push: {
          attenders: user._id
        }
      })
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
  res.render("splash/login", {
    currentPage: 'login'
  });
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
      const user = await usersCollection.findOne({
        username: req.body.username
      });
      if (user && (await bcrypt.compare(req.body.password, user.password))) {
        req.session.loggedIn = true;
        req.session.name = user.name;
        req.session.email = user.email;
        res.redirect("/findPods");
      } else {
        res.status(401).render('errors/incorrect', {
          error: "Incorrect username and password.",
          link: "/login"
        });
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
    const currentUser = await usersCollection.findOne({
      email: req.session.email
    });
    if (currentUser && currentUser.admin) {
      const users = await usersCollection.find({}).toArray();
      res.render("admin/admin", {
        users: users,
        currentPage: 'admin'
      });
    } else {
      res.status(403).send("You must be an admin to access this page.<br><a href='/'>Go back to home page</a>");
    }
  } else {
    res.status(403).render("errors/403");
  }
});

// Button to promote User to Admin
app.get("/promote/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    await usersCollection.updateOne({
      _id: new ObjectId(userId)
    }, {
      $set: {
        admin: true
      }
    });
    res.redirect("/admin");
  } catch (error) {
    res.status(500).send("Error promoting user.");
  }
});

// Button to demote Admin to User
app.get("/demote/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    await usersCollection.updateOne({
      _id: new ObjectId(userId)
    }, {
      $set: {
        admin: false
      }
    });
    res.redirect("/admin");
  } catch (error) {
    res.status(500).send("Error demoting user.");
  }
});

// GET request for the "/settings" URL
app.get("/settings", async (req, res) => {
  if (req.session.loggedIn) {
    try {
      const user = await usersCollection.findOne({
        email: req.session.email
      });
      res.render("settings", {
        user: user,
        currentPage: 'settings'
      });
    } catch (error) {
      res.status(500).send("Error retrieving user data.");
    }
  } else {
    res.status(403).render("errors/403");
  }
});

app.get("/members", async (req, res) => {
  if (req.session.loggedIn) {
    let user = await usersCollection.findOne({
      email: req.session.email
    });
    res.render("members", {
      name: req.session.name,
      currentPage: 'members',
      user: user
    });
  } else {
    res.status(403).render("errors/403");
  }
});

// GET request for the "/pods" URL
app.get("/attendedpods", async (req, res) => {
  if (req.session.loggedIn) {
    const user = await usersCollection.findOne({
      email: req.session.email
    });
    const attendedPods = await podsCollection.find({
      attenders: user._id
    }).toArray();
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
    res.status(403).render("errors/403");
  }
});


// POST request for upvoting a specific pod
app.post("/pod/:podId/upvote", async (req, res) => {
  if (!req.session.loggedIn) {
    return
  } else {
    res.status(403).render("errors/403");
  }

  const user = await usersCollection.findOne({
    email: req.session.email
  });
  const podId = req.params.podId;

  if (!user) {
    return res.status(404).send('User not found');
  }

  try {
    await podsCollection.updateOne({
      _id: new ObjectId(podId)
    }, {
      $addToSet: {
        upvotes: user._id
      },
      $pull: {
        downvotes: user._id
      }
    });
    res.status(200).send();
  } catch (error) {
    res.status(500).send('Error voting on pod');
  }
});


// POST request for downvoting a specific pod
app.post("/pod/:podId/downvote", async (req, res) => {
  if (!req.session.loggedIn) {
    return res.status(403).send("You must be logged in to vote.<br><a href='/'>Go back to home page</a>")
  }

  const user = await usersCollection.findOne({
    email: req.session.email
  });
  const podId = req.params.podId;

  if (!user) {
    return res.status(404).send('User not found');
  }

  try {
    await podsCollection.updateOne({
      _id: new ObjectId(podId)
    }, {
      $addToSet: {
        downvotes: user._id
      },
      $pull: {
        upvotes: user._id
      }
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
      const createdPods = await podsCollection.find({
        creator: req.session.email
      }).toArray();
      res.render("createdpods", {
        activeTab: 'createdpods',
        currentPage: 'createdPods',
        createdPods: createdPods,
        user
      });
    } catch (error) {
      res.status(500).send("Error retrieving created pods.<br><a href='/'>Go back to home page</a>")
    }
  } else {
    res.status(403).render("errors/403");
  }
});


// POST request to delete a pod
app.post('/deletePod', async (req, res) => {

  const schema = Joi.object({
    id: Joi.string().hex().length(24)
  })
  var validationResult = schema.validate({
    id: req.body.podID
  });

  if (!(validationResult.error)) {
    console.log(req.body.podID)
    var targetID = new ObjectId(req.body.podID)
    var query = {
      $and: [{
        _id: targetID
      }, {
        creator: req.session.email
      }]
    }
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
      await usersCollection.updateOne({
        _id: u._id
      }, {
        $set: {
          eventsAttended: events
        }
      })
    })
  }
  const createdPods = await podsCollection.find({
    creator: req.session.email
  }).toArray();
  res.redirect("/createdpods");
});
// Fetch the user data
async function fetchUserData(req) {
  if (req.session.loggedIn) {
    return await usersCollection.findOne({
      email: req.session.email
    });
  }
  return null;
}

// GET request for the "/createpod" URL
app.get("/createpod", async (req, res) => {
  if (req.session.loggedIn) {
    const user = await fetchUserData(req);
    res.render("createpod", {
      currentPage: 'pods',
      user: user
    });
  }
});


// POST request to create a pod after create pod form is filled out
app.post("/createpod", upload.single('image'), async (req, res) => {
  console.log(req.body);

  if (req.session.loggedIn) {
    let {
      name,
      eventDescription
    } = req.body;
    var location = {
      lat: req.body.lat,
      lng: req.body.lng
    };

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
    const date = DateTime.fromISO(`${req.body.date}`);
    const formattedDate = date.toFormat('yyyy-LL-dd');
    const time = `${req.body.time}`;
    const newPod = {
      name,
      tags,
      eventDescription,
      attenders,
      creator,
      location,
      image,
      upvotes,
      downvotes,
      formattedDate,
      time
    };

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
      image: Joi.string().uri(), // validates image as a URL
      upvotes: Joi.array(), // Validates upvotes as an array
      downvotes: Joi.array(), // Validates downvotes as an array
      formattedDate: Joi.string().required(),
      time: Joi.string().required()
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
    res.status(403).render("errors/403");
  }
});


// GET request for the "/profile" URL
app.get("/profile", async (req, res) => {
  if (req.session.loggedIn) {
    try {
      const user = await usersCollection.findOne({
        email: req.session.email
      });
      res.render("profile", {
        user: user,
        currentPage: 'profile'
      });
    } catch (error) {
      res.status(500).send("Error retrieving user data.");
    }
  } else {
    res.status(403).render("errors/403");
  }
});

// GET request for the "/editProfile" URL
app.get("/editProfile", async (req, res) => {
  if (req.session.loggedIn) {
    try {
      const user = await usersCollection.findOne({
        email: req.session.email
      });
      res.render("editProfile", {
        user: user,
        currentPage: 'editProfile'
      });
    } catch (error) {
      res.status(500).send("Error retrieving user data.");
    }
  } else {
    res.status(403).render("errors/403");
  }
});

// POST request for the "/findPods" URL
app.get("/findPods", async (req, res) => {
  var email = req.session.email;
  var user = await usersCollection.findOne({
    email: email
  });
  console.log(user)
  res.render('findPods', {
    currentPage: 'findPods',
    maxDist: user.podProximity != null ? user.podProximity : 3000000,
    user: user
  });
})


// GET request for user's tags
app.get("/getUserInterests", async (req, res) => {
  var email = req.session.email;
  var user = await usersCollection.findOne({
    email: email
  });
  res.json(user.interests);
});


// GET request for the "/getPods" URL
// (NOT to be confused with /findPods)
app.get('/getPods', async (req, res) => {
  var email = req.session.email;
  var user = await usersCollection.findOne({
    email: email
  });
  var attendedPods = user.eventsAttended || [];
  var userInterests = user.interests; // Get the user's interests

  let pods;

  // Prepare a query where at least one tag from the list overlaps with user's interests
  pods = await podsCollection.find({
    name: {
      $nin: attendedPods.map(pod => pod.name)
    },
    tags: {
      $in: userInterests
    }
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
  const pod = await podsCollection.findOne({
    _id: podId
  });

  if (!pod) {
    return res.status(404).send("Pod not found");
  }

  const attenders = await usersCollection.find({
    _id: {
      $in: pod.attenders
    }
  }).toArray();
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
      const user = await usersCollection.findOne({
        email: req.session.email
      });

      if (user) {
        await podsCollection.updateOne({
          _id: new ObjectId(podId)
        }, {
          $pull: {
            attenders: user._id,
            upvotes: user._id,
            downvotes: user._id
          }
        });
        await usersCollection.updateOne({
          _id: new ObjectId(user._id)
        }, {
          $pull: {
            eventsAttended: {
              _id: podId
            }
          }
        });
        res.redirect("/attendedPods"); // Add this line
        res.status(200).send();
      } else {
        res.status(404).send('User not found');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Error leaving pod');
    }
  } else {
    res.status(403).render("errors/403");
  }
});

// GET request for the "/viewProfile" URL  res.json(attenders);
app.get("/viewProfile", async (req, res) => {
  if (req.session.loggedIn) {
    try {
      const user = await usersCollection.findOne({
        email: req.session.email
      });
      res.render('viewProfile', {
        user: user
      });

    } catch (error) {
      res.status(500).send("Error retrieving user data.");
    }
  } else {
    res.status(403).render("errors/403");
  }
});

// POST request for the "/updateProfile" URL
app.post("/updateProfile", upload.single('profilePhoto'), async (req, res) => {
  if (req.session.loggedIn) {
    try {
      const user = await usersCollection.findOne({
        email: req.session.email
      });

      if (!user) {
        res.status(401).send("User not found.<br><a href='/editProfile'>Go back to edit profile</a>");
        return;
      }

      // If the user does not upload a new image, keep the old one.
      let imagePath;
      if (req.file) {
        imagePath = 'uploads/' + req.file.filename;
      } else {
        imagePath = user.image;
      }

      const schema = Joi.object({
        name: Joi.string().max(50).optional(),
        username: Joi.string().max(50).optional(),
        email: Joi.string().email().optional(),
        birthday: Joi.date().allow("").optional(),
        pronouns: Joi.string().max(50).allow('').optional(),
        interests: Joi.array().items(Joi.string()).max(10).optional(),
        image: Joi.string().allow(null).optional()
      });

      if (!Array.isArray(req.body.interests)) {
        if (typeof req.body.interests != 'undefined') {
          req.body.interests = [req.body.interests];
        } else {
          req.body.interests = user.interests;
        }
      }

      req.body.image = imagePath;

      const validationResult = schema.validate(req.body);

      if (validationResult.error) {
        res.status(400).send(validationResult.error.details[0].message + "<br><a href='/editProfile'>Go back to edit profile</a>");
      } else {
        const updatedUser = {
          name: req.body.name || user.name,
          username: req.body.username || user.username,
          email: req.body.email || user.email,
          birthday: req.body.birthday ? new Date(req.body.birthday) : user.birthday,
          pronouns: req.body.pronouns || user.pronouns,
          interests: req.body.interests || user.interests,
          image: req.body.image || user.image,
        };
        await usersCollection.updateOne({
          email: req.session.email
        }, {
          $set: updatedUser
        });
        req.session.name = updatedUser.name;
        req.session.email = updatedUser.email;
        res.redirect("/profile");
      }
    } catch (error) {
      if (error.code == 11000) {
        var problemField = Object.keys(error.keyValue);
        res.render('editProfile', {
          errorMessage: `${problemField} is already in use.`,
          user: user
        });
      } else {
        res.render('editProfile', {
          errorMessage: 'Error updating profile.',
          user: user
        });
      }
    }
  } else {
    res.status(403).render("errors/403");
  }
});


// GET request for the "/chat" URL
app.get("/chat", async (req, res) => {
  if (req.session.loggedIn) {
    try {
      const user = await usersCollection.findOne({
        email: req.session.email
      });
      res.render("chat", {
        user: user,
        currentPage: 'chat'
      });
    } catch (error) {
      res.status(500).send("Error retrieving user data.");
    }
  } else {
    res.status(403).render("errors/403");
  }
});

app.post('/chatgpt', async (req, res) => {
  const messages = req.body.messages;
  const model = req.body.model;
  const temp = req.body.temp;

  const completion = await openaiapi.createChatCompletion({
    model: model,
    messages: messages,
    temperature: temp,
  });
  res.status(200).json({
    result: completion.data.choices
  });
});

// POST request for users updating their profile tags
app.post('/updateInterests', async (req, res) => {
  var newInterests = {
    interests: req.body.holder.split(',')
  };
  const schema = Joi.object({
    interests: Joi.array().items(Joi.string().required()).max(20).optional(),
  });
  var validationResult = schema.validate(newInterests);

  if (validationResult.error) {
    var user = await usersCollection.findOne({
      email: req.session.email
    });
    res.render("home", {
      loggedIn: req.session.loggedIn,
      name: req.session.name,
      currentPage: 'home',
      user: user,
      errorMessage: validationResult.error.message
    });
  } else if (req.body.holder != []) {
    try {
      await usersCollection.updateOne({
        email: req.session.email
      }, {
        $addToSet: {
          interests: {
            $each: req.body.holder.split(',')
          }
        }
      })
      res.redirect('findPods');
    } catch (error) {
      res.render("home", {
        loggedIn: req.session.loggedIn,
        name: req.session.name,
        currentPage: 'home',
        user: user,
        errorMessage: 'Could not update. Please try again later.'
      });
    }
  } else {
    res.render("home", {
      loggedIn: req.session.loggedIn,
      name: req.session.name,
      currentPage: 'home',
      user: user,
      errorMessage: 'Could not update. Please try again later.'
    });
  }
});

// GET request to catch all other routes that are not defined
app.get('*', async (req, res) => {
  let user = null;
  if (req.session.loggedIn) {
    user = await usersCollection.findOne({
      email: req.session.email
    });
  }
  res.status(404);
  res.render("errors/404", {
    user: user
  });
});

// Start server
app.listen(PORT, () => {
  console.log('server is running on port 3000');
});
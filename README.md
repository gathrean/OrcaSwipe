# ![1-Title](https://github.com/gathrean/2800-202310-BBY38/assets/77172769/342627a2-d3ce-48b9-af8b-f39e5a742f9b)

- OrcaSwipe
- Team BBY-38 for COMP 2800
- Qoddi Link: [URL](https://arylivqtuh.eu09.qoddiapp.com/)

- Table of Contents
  - [👏 Members](#-members)
    - [Gathrean Dela Cruz](#gathrean-dela-cruz)
    - [Alex Sichitiu](#alex-sichitiu)
    - [Ozan Yurtisigi](#ozan-yurtisigi)
    - [Laurie Solkoski](#laurie-solkoski)
  - [📖 Project Description](#-project-description)
  - [💻 Technologies Used](#-technologies-used)
    - [Frontend](#frontend)
    - [Backend](#backend)
    - [Database](#database)
    - [AI](#ai)
  - [📁 Listing of File Contents of folder](#-listing-of-file-contents-of-folder)
  - [💾 How to install or run the project](#-how-to-install-or-run-the-project)
  - [📲 How to use the product (Features)](#-how-to-use-the-product-features)
    - [`/` (Splash Page)](#-splash-page)
    - [`/login` and `/signup`](#login-and-signup)
    - [`/home` (Filtering Pods)](#home-filtering-pods)
    - [`/findPods` (Discover Pods)](#findpods-discover-pods)
    - [`createPods` (Host Pods)](#createpods-host-pods)
    - [`/profile` (Your Profile)](#profile-your-profile)
  - [🤝 Credits, References, and Licenses](#-credits-references-and-licenses)
  - [🤖 How did you use AI?](#-how-did-you-use-ai)
  - [🫡 Thank you](#-thank-you)

## 👏 Members

### Gathrean Dela Cruz

- Scrum Master
- Frontend UI / UX Design
- Backend Assistance
- Graphic Designer
- <b> Contact Info </b>
  - [LinkedIn](https://www.linkedin.com/in/gathrean/) (https://www.linkedin.com/in/laurie-solkoski/) 

### Alex Sichitiu

- Scrum Master
- Full-stack Developer

### Ozan Yurtisigi

- Scrum Master
- Database Engineer

### Laurie Solkoski

- Scrum Master
- Datasets Developer
- Full Stack Developer

## 📖 Project Description

- OrcaSwipe: Discover, join, and host tailored communities and events with a swipe, connecting you with like-minded individuals and enabling easy filtering, finding, and hosting of Pods.

## 💻 Technologies Used

### Frontend

- HTML
- EJS
- CSS
- BootStrap 5.3
- JavaScript

### Backend

- JavaScript
- Tinder Swipe Cards API from Rob Vermeer

### Database

- MongoDB is our main Database for storing users and pods
- Firestore is our secondary Database for storing user’s images and pod photos
- Realtime Database is also our secondary Database for storing messages in PodChats

### AI

- ChatGPT 3.5
- GPT-4

## 📁 Nested listing of File Contents of folder
-- Note: we have excluded the contents of node_modules due to thousands of file lines
```

├── Procfile
├── README.md
├── app.js
├── hobbies.csv
├── hobbies2.csv
├── node_modules
├── package-lock.json
├── package.json
├── public
│   ├── flappy-orca
│   │   ├── flappy-orca.css
│   │   ├── flappy-orca.html
│   │   ├── flappy-orca.js
│   │   ├── flappy-soundfx
│   │   │   ├── rizz-sounds.mp3
│   │   │   └── vine-boom.mp3
│   │   ├── orca-2.png
│   │   └── orca.png
│   ├── images
│   │   ├── OrcaSwipe_Logo.png
│   │   ├── arrow-right-from-bracket.svg
│   │   ├── circle-user.svg
│   │   ├── compass.svg
│   │   ├── heart.svg
│   │   ├── house-chimney-floor.svg
│   │   ├── layer-group.svg
│   │   ├── location-plus.svg
│   │   ├── menu.svg
│   │   ├── message-circle-chat.svg
│   │   ├── orca_pfp.jpg
│   │   ├── settings.svg
│   │   ├── shield-exclamation.svg
│   │   ├── tree-decorated-alt-1.svg
│   │   └── xmark.svg
│   ├── scripts
│   │   ├── chat.js
│   │   ├── findPods.js
│   │   ├── loading-circle.js
│   │   ├── map.js
│   │   ├── openai.js
│   │   └── podDetails.js
│   └── style
│       ├── chat.css
│       ├── findPods.css
│       ├── loading-circle.css
│       ├── pods.css
│       ├── splash-style.css
│       ├── splash.css
│       └── style.css
├── styles.css
├── uploads
└── views
    ├── admin
    │   └── admin.ejs
    ├── attendedpods.ejs
    ├── chat.ejs
    ├── createdpods.ejs
    ├── createpod.ejs
    ├── editProfile.ejs
    ├── errors
    │   ├── 403.ejs
    │   ├── 404.ejs
    │   ├── error.ejs
    │   └── incorrect.ejs
    ├── findPods.ejs
    ├── home.ejs
    ├── icons
    │   ├── chat-2.ejs
    │   ├── find-2.ejs
    │   ├── find.ejs
    │   ├── hamburger.ejs
    │   ├── home.ejs
    │   ├── host-2.ejs
    │   ├── host.ejs
    │   ├── logout.ejs
    │   ├── love.ejs
    │   ├── nope.ejs
    │   ├── pods-2.ejs
    │   ├── pods.ejs
    │   ├── profile.ejs
    │   ├── report.ejs
    │   ├── settings-2.ejs
    │   ├── settings.ejs
    │   └── tree.ejs
        ├── profile.ejs
    ├── resetting-passwords
    │   ├── resetEmailSent.ejs
    │   ├── resetPassword.ejs
    │   └── updatePassword.ejs
    ├── settings.ejs
    ├── splash
    │   ├── footer-splash.ejs
    │   ├── header-splash-login.ejs
    │   ├── header-splash.ejs
    │   ├── login.ejs
    │   ├── signup.ejs
    │   └── splash.ejs
    ├── templates
    │   ├── footer.ejs
    │   ├── header.ejs
    │   ├── navbar-bottom.ejs
    │   ├── navbar-top.ejs
    │   └── sidebar.ejs
    └── viewProfile.ejs

```

## 💾 How to install or run the project

Before you run anything, make sure you have installed the following:

```terminal
    npm install bcrypt
    npm install firebase-admin
    npm install openai -- save
    npm i luxon
    npm install dotenv

```

In your local .env, make sure you have the following fields filled in with your own keys:
Note: OrcaSwipe is set to port 3000
```json
    PORT

    MONGODB_USER
    MONGODB_PASSWORD
    MONGODB_CLUSTER
    MONGODB_DATABASE
    MONGODB_SESSION_SECRET
    NODE_SESSION_SECRET
    HASHED_PASSWORD

    EMAIL
    EMAIL_APP_PASSWORD

    HOST_URL

    IMAGE_FIREBASE_JSON

    OPENAI_API_KEY
    OPENAI_ORG
    
    // for firebase configuration
    TYPE
    PROJECT_ID
    PRIVATE_KEY_ID
    PRIVATE_KEY
    CLIENT_EMAIL
    CLIENT_ID
    AUTH_URI
    TOKEN_URI
    AUTH_PROVIDER_X509_CERT_URL
    CLIENT_X509_CERT_URL
    UNIVERSE_DOMAIN

```

For Firebase storage, do the following: 
Go to Project Overview -> Project Settings -> Service Accounts -> Firebase Admin SDK -> choose Node.js
-> Generate new private key
This will generate a .json file with the keys that you need to add to in the firebase fields in your .env
This does NOT go into you public repo.

## 📲 How to use the product (Features)

In this section, we'll guide you on what each core page does.

### `/` (Splash Page)

- Double tap on the Orca icon at the top-most part of the page for a surprise!

### `/login` and `/signup`

- Sign up with your credentials and proceed to log in.

### `/home` (Filtering Pods)

- In the promt box, describe the types of acitivities you like or activities you'd like to try.
- There are also some suggested tags that align with OrcaSwipe's vision of community involvement
- For example, "I like going to the beach", then click "Find Pod Tags"
- The bot will generate some suggested tags based on your prompt. 
- Click on "Add these interests!". This will be added to your user profile tags.

### `/findPods` (Discover Pods)

- This is the main page where users can browse cards of pods that appear in a stack.
- If your page is empty, it means no users have created pods that align or match with your interests, or you're too far away from any created pods.
- You have the option to adjust your tags, adjust your location proximity, or create your own pod.
- The pod cards that are being rendered show the pod's title, location, distance from your current location, the date and time, a brief description, and the tags that relate to it.

### `createPods` (Host Pods)

- This page shows all the pods you have created, and a path to creating a another pod.
- You can create a pod by clicking on "Host a new pod"
- All the fields when creating a pod are required, as indicated by the red asterisk at the top of the fields.
- You would need to input the following: Pod Name, upload a pod image from your local device, pod description, pod date, pod time, pod tags, and pod location.
- In alignment with OrcaSwipe's vision of promoting pod types that are beneficial to the community, there are suggested tags for the user to choose from.
- If you don't wish to choose those tags, you can deselect them. 
- If you need more info on what pods are or what the suggest tags are, you can click on the "question mark" icon beside those fields.
- After you're satisfied with your pod details, click on "Create Pod". 
- If you want to view the pod you just created, click back on the "Host" icon in the sidebar tab.

### `/profile` (Your Profile)

- In either the bottom-left of the sidebar or top right of the header is your profile photo, along with your username. If you click on that it will take you to your profile page.
- In your profile page your can either Edit details or view your current profile details.
- The fields are not required.

## 🤝 Credits, References, and Licenses

- Swiping Cards Stack effect: [Tinder-like swipable cards Rob Vermeer](https://codepen.io/RobVermeer/pen/japZpY).
- CSS Framework: [Bootstrap 5.3](https://getbootstrap.com/).
- Map API: [Leaflet](https://leafletjs.com/).
- Open AI and Chat gpt integration for OrcaAI: https://danielkhv.com/blog/createyourownchatbot 

## 🤖 How did you use AI?

> Tell us exactly what AI services and products you used and how you used them. Be very specific.

When it comes to complex programming help, it was very helpful to consult GPT for some assistance. It felt like another team member.

- Our [ChatGPT Prompt Log](https://docs.google.com/document/d/15sE_T1InzGLhURfZ1sbZYpDkJBfUg0VNvyCVzmJe6Ik/edit?usp=sharing)

We also used OpenAI's API to implement a filter suggestion feature. We used a [List of Hobbies dataset from Kaggle](https://www.kaggle.com/datasets/mrhell/list-of-hobbies) for the chatbot to learn from. The bot would then suggest related hobby tags for the users to add to their profile.

For example, if a user tells the bot "I love the outdoors and hiking," the bot would analyze what they said, parse it, and suggests similar tags such as `fishing`, `camping`, `biking`, etc.

## 🫡 Thank you

Thank you for reading our README! Please contact us if you have further questions or concerns regarding OrcaSwipe.

![OrcaSwipe](https://github.com/gathrean/2800-202310-BBY38/assets/77172769/342627a2-d3ce-48b9-af8b-f39e5a742f9b)

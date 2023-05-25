# ![1-Title](https://github.com/gathrean/2800-202310-BBY38/assets/77172769/342627a2-d3ce-48b9-af8b-f39e5a742f9b)

- OrcaSwipe
- Team BBY-38 for COMP 2800
- [Hosted URL](https://arylivqtuh.eu09.qoddiapp.com/)

## 👏 Members

### Gathrean Dela Cruz

- Scrum Master
- Frontend UI / UX Design
- Backend Assistance
- Graphic Designer
- [LinkedIn](https://www.linkedin.com/in/gathrean/)

### Alex Sichitiu

- Scrum Master
- Full-stack Developer

### Ozan Yurtisigi

- Scrum Master
- Database Engineer

### Laurie Solkoski

- Scrum Master
- Datasets Developer

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

## 📁 Listing of File Contents of folder

- placeholder

## 💾 How to install or run the project

Before you run anything, make sure you have installed the following:

```terminal
    npm install firebase-admin
    npm install openai -- save
    npm i luxon
```

In your local .env, make sure you have the following fields filled in with your own keys:

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
```

## 📲 How to use the product (Features)

In this section, we'll guide you on what each core page does.

### `/` (Splash Page)

- placeholder

### `/login` and `/signup`

- placeholder

### `/home` (Filtering Pods)

- placeholder

### `/findPods` (Discover Pods)

- placeholder

### `createPods` (Host Pods)

- placeholder

### `/profile` (Your Profile)

- placeholder

## 🤝 Credits, References, and Licenses

- Swiping Cards Stack effect: [Tinder-like swipable cards Rob Vermeer](https://codepen.io/RobVermeer/pen/japZpY).
- CSS Framework: [Bootstrap 5.3](https://getbootstrap.com/).
- Map API: [Leaflet](https://leafletjs.com/).

## 🤖 How did you use AI?

> Tell us exactly what AI services and products you used and how you used them. Be very specific.

When it comes to complex programming help, it was very helpful to consult GPT for some assistance. It felt like another team member.

- Our [ChatGPT Prompt Log](https://docs.google.com/document/d/15sE_T1InzGLhURfZ1sbZYpDkJBfUg0VNvyCVzmJe6Ik/edit?usp=sharing)

We also used OpenAI's API to implement a filter suggestion feature. We used a [List of Hobbies dataset from Kaggle](https://www.kaggle.com/datasets/mrhell/list-of-hobbies) for the chatbot to learn from. The bot would then suggest related hobby tags for the users to add to their profile.

For example, if a user tells the bot "I love the outdoors and hiking," the bot would analyze what they said, parse it, and suggests similar tags such as `fishing`, `camping`, `biking`, etc.

## 🫡 Thank you

Thank you for reading our README! Please contact us if you have further questions or concerns regarding OrcaSwipe.

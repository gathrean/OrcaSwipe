![OrcaSwipe](https://github.com/gathrean/OrcaSwipe/assets/77172769/40370498-041c-4c1b-bd09-355a2345c431)

# OrcaSwipe

Discover, join, and host tailored communities and events with a swipe, connecting you with like-minded individuals and enabling easy filtering, finding, and hosting of Pods.

## 🐋 About the App 

This app facilitates the creation and exploration of events, termed pods, tailored to users' preferences. Users can generate preference tags by providing prompts to ChatGPT, receiving tags aligned with their interests. 

Key functionalities of each core page are as follows:

<details> 
<summary>Splash Page (`/`)</summary>

- Double tap the Orca icon for a surprise.

</details>

<details>
<summary>Login and Signup Pages (`/login`, `/signup`)</summary>

- Users can sign up with credentials and proceed to log in.

</details>

<details>
<summary>Filtering Pods (`/home`)</summary>

- Users describe preferred activities or interests in the prompt box, receive suggested tags, and add them to their profile. These tags are used for filtering pods.

</details>

<details>
<summary>Discover Pods (`/findPods`)</summary>

- Main browsing page for pod cards, displaying titles, locations, dates, descriptions, and related tags. Users can adjust tags, location proximity, or create their own pods.

</details>

<details>
<summary>Host Pods (`/createPods`)</summary>

- Users view and create pods, providing required details such as pod name, image, description, date, time, tags, and location. Suggested tags align with the app's community vision.

</details>

<details>
<summary>Your Profile (`/profile`)</summary>

- Users can access their profile, view/edit details, and see their profile photo and username. Fields are optional.

</details>


## 🐋 Technologies Used

<details><summary>Front End</summary>
  
> [![Front End](https://skillicons.dev/icons?i=js,html,css,bootstrap&theme=light)](https://skillicons.dev)
- JavaScript, HTML, CSS, [Bootstrap 5.3](https://getbootstrap.com/), EJS
  
</details>

<details><summary>Back End</summary>
  
> [![Back End](https://skillicons.dev/icons?i=js,nodejs,express,mongo,firebase&theme=light)](https://skillicons.dev)
- JavaScript, Node.JS, Express.JS
- Map API: [Leaflet](https://leafletjs.com/)
- [Tinder Swipe Cards API](https://codepen.io/RobVermeer/pen/japZpY)

</details>

<details><summary>Database</summary>

> [![Back End](https://skillicons.dev/icons?i=mongo,firebase&theme=light)](https://skillicons.dev)
- MongoDB for everything
- Firebase for image uploads
- Realtime Database for Chat feature
   - https://danielkhv.com/blog/createyourownchatbot
  
</details>

<details><summary>Artificial Intelligence</summary>
  
- ChatGPT-3.5
- GPT-4
  
</details>

## 🐋 Install (For Development)

<details>
  <summary>What do I install from npm?</summary>

```terminal
    npm install bcrypt
    npm install firebase-admin
    npm install openai -- save
    npm i luxon
    npm install dotenv
```
</details>

<details> <summary>How should my .env file consist of?</summary>

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
  
</details>

<details> <summary>How do I use the Firebase Storage?</summary>

1. Go to Project Overview 
2. Go to Project Settings 
3. Go to Service Accounts 
4. Go to Firebase Admin SDK
5. Choose Node.js
6. Finally, generate new private key
  
This will generate a `.json` file with the keys that you need to add to in the firebase fields in your `.env`

This does NOT go into you public repo.

</details>

## 🐋 Roles & Contact Info
<details> <summary>Reveal table</summary>

| Name               | Role in the Project                                     | LinkedIn                                            |
|--------------------|---------------------------------------------------------|-----------------------------------------------------|
| Gathrean Dela Cruz | UI/UX Design, Frontend, Backend, Graphic Designer       | [LinkedIn](https://www.linkedin.com/in/gathrean/)   |
| Laurie Solkoski    | AI, Datasets, Full-Stack                                | [LinkedIn](https://www.linkedin.com/in/laurie-solkoski/) |
| Alex Sichitiu      | Full-stack                                              | [LinkedIn](https://www.linkedin.com/in/alex-s-60056491/) |
| Ozan Yurtisigi     | Database                                                | [LinkedIn](https://www.linkedin.com/in/ozan-yurtisigi/) |

</details>

## Thank you for checking out this Repo!

![OrcaSwipe](https://github.com/gathrean/2800-202310-BBY38/assets/77172769/342627a2-d3ce-48b9-af8b-f39e5a742f9b)

![OrcaSwipe](https://github.com/gathrean/OrcaSwipe/assets/77172769/40370498-041c-4c1b-bd09-355a2345c431)

# OrcaSwipe

## About the App 

- OrcaSwipe: Discover, join, and host tailored communities and events with a swipe, connecting you with like-minded individuals and enabling easy filtering, finding, and hosting of Pods.

## Features & How to use the product

<details>

  <summary>See more...</summary>
  
In summary, this app allows users to create events called pods and to browse and join pod that match their preferences. To generate their preference tags, they can provide a prompt to chatGPT and receive tags they might enjoy. 

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

</details>

## Technologies Used


<details>

  <summary>See more...</summary>

### Front End

> [![Front End](https://skillicons.dev/icons?i=js,html,css,bootstrap&theme=light)](https://skillicons.dev) and EJS

### Backend and Database

> [![Back End](https://skillicons.dev/icons?i=js,nodejs,express,mongo,firebase&theme=light)](https://skillicons.dev), Realtime Database (Chat), Leaflet.js, and [!Tinder Swipe Cards API](https://codepen.io/RobVermeer/pen/japZpY)

### AI

> ChatGPT-3.5 and GPT-4
  
</details>

## Install (Developer)

<details>
  <summary>See more...</summary>
  
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

</details>

## Credits, References, and Licenses

<details>
  <summary>See more...</summary>

- Swiping Cards Stack effect: [Tinder-like swipable cards Rob Vermeer](https://codepen.io/RobVermeer/pen/japZpY).
- CSS Framework: [Bootstrap 5.3](https://getbootstrap.com/).
- Map API: [Leaflet](https://leafletjs.com/).
- Open AI and Chat gpt integration for OrcaAI: https://danielkhv.com/blog/createyourownchatbot 
  
</details>

## Contact Info

Thank you for reading our README! Please contact us if you have further questions or concerns regarding OrcaSwipe. We can be reached at the following links:

| Name               | Role in the Project                                     | LinkedIn                                            |
|--------------------|---------------------------------------------------------|-----------------------------------------------------|
| Gathrean Dela Cruz | UI/UX Design, Frontend, Backend, Graphic Designer       | [LinkedIn](https://www.linkedin.com/in/gathrean/)   |
| Laurie Solkoski    | AI, Datasets, Full-Stack                                | [LinkedIn](https://www.linkedin.com/in/laurie-solkoski/) |
| Alex Sichitiu      | Full-stack                                              | [LinkedIn](https://www.linkedin.com/in/alex-s-60056491/) |
| Ozan Yurtisigi     | Database                                                | [LinkedIn](https://www.linkedin.com/in/ozan-yurtisigi/) |

## ![OrcaSwipe](https://github.com/gathrean/2800-202310-BBY38/assets/77172769/342627a2-d3ce-48b9-af8b-f39e5a742f9b)

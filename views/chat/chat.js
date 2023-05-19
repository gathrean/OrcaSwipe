admin = require("firebase-admin");
express = require("express");
app = express();

// Initialize Firebase
serviceAccount = require("./orcachat-896f1-firebase-adminsdk-3jnwn-91a6180898.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.database();
const messagesRef = db.ref("messages");

function sendMessage() {
    var messageInput = document.getElementById('message');
    var message = messageInput.value;

    axios.get('/api/getUsername')
        .then(function (response) {
            var username = response.data.username;
            firebase.database().ref('messages').push().set({
                content: message,
                username: username,
                timestamp: Date.now()
            });

            messageInput.value = '';
        })
        .catch(function (error) {
            console.error('Error retrieving username:', error);
        });
}

function displayMessage(message) {
    var listItem = document.createElement('li');
    var sender = document.createElement('strong');

    // Fetch the user data from MongoDB based on the username
    fetch('/users/' + '<%= user.username %>') // Replace '<%= user.username %>' with the appropriate endpoint
        .then(response => response.json())
        .then(user => {
            sender.appendChild(document.createTextNode(user.username + ': ')); // Use the fetched username
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
            sender.appendChild(document.createTextNode('Unknown User: ')); // Use a fallback username
        })
        .finally(() => {
            listItem.appendChild(sender);
            listItem.appendChild(document.createTextNode(message.content));

            var chatbox = document.getElementById('chatbox');
            chatbox.appendChild(listItem);
        });
}


// Listen for changes in the Firebase Realtime Database
firebase.database().ref('messages').on('child_added', function (snapshot) {
    var message = snapshot.val();
    displayMessage(message);
});

// Send a message
messagesRef.push({
    sender: "John",
    message: "Hello, how are you?"
});

messagesRef.on("child_added", (snapshot) => {
    const message = snapshot.val();
    console.log("New message:", message.sender, message.message);
});

// Inside your route handler
app.get("/api/getUsername", async (req, res) => {
    try {
        const userId = req.session.userId; // Assuming you have stored the user ID in the session
        const user = await usersCollection.findOne({ _id: userId });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const username = user.username;
        res.json({ username });
    } catch (error) {
        console.error("Error retrieving username:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

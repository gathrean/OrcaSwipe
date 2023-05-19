admin = require("firebase-admin");
express = require("express");
app = express();

// Initialize Firebase
serviceAccount = require("./orcachat-896f1-firebase-adminsdk-3jnwn-91a6180898.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// Initialize Firebase
var firebaseConfig = {
    databaseURL: "https://orcachat-896f1-default-rtdb.firebaseio.com/",
    apiKey: "AIzaSyCqohTy2xTnkLispHSq2TGRP2VDyhRcEB0",
    authDomain: "orcachat-896f1.firebaseapp.com",
    projectId: "orcachat-896f1",
    storageBucket: "orcachat-896f1.appspot.com",
    messagingSenderId: "1069412700995",
    appId: "1:1069412700995:web:c4b568bb2df7c9351055f6"
};

firebase.initializeApp(firebaseConfig);

function sendMessage() {
    var messageInput = document.getElementById('message');
    var message = messageInput.value;

    // Get the username from the session or any other source
    var username = "<%= user.username %>";

    // Save the message and the username to Firebase Realtime Database
    firebase.database().ref('PodChat10').push().set({
        content: message,
        username: username, // Add the username to the message object
        timestamp: Date.now()
    });

    // Clear the input field
    messageInput.value = '';

    // Add event listener for the Enter key press event
    document.getElementById('message').addEventListener('keyup', function (event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            sendMessage();
        }
    });
}

function displayMessage(message) {
    var listItem = document.createElement('li');
    var chatMessage = document.createElement('div');
    chatMessage.classList.add('chat-message');

    if (message.username === "<%= user.username %>") {
        chatMessage.classList.add('outgoing'); // Apply a class for outgoing messages
    } else if (message.username === 'System') {
        chatMessage.classList.add('system'); // Apply a class for system messages
    } else {
        chatMessage.classList.add('incoming'); // Apply a class for incoming messages
    }
    if (message.username !== 'System') {
        var sender = document.createElement('span');
        sender.classList.add('chat-username');
        sender.innerHTML = '@' + message.username + '<br>';
        chatMessage.appendChild(sender);
    }

    var chatbox = document.getElementById('chatbox');
    var shouldScroll = chatbox.scrollTop + chatbox.clientHeight === chatbox.scrollHeight;

    chatMessage.appendChild(document.createTextNode(message.content));

    listItem.appendChild(chatMessage);

    chatbox.appendChild(listItem);

    if (shouldScroll) {
        chatbox.scrollTop = chatbox.scrollHeight;
    }
}


// Listen for changes in the Firebase Realtime Database
firebase.database().ref('PodChat10').on('child_added', function (snapshot) {
    var message = snapshot.val();
    displayMessage(message);
});

function createNode() {
    // Get the current count of nodes
    firebase.database().ref('nodeCount').once('value')
        .then(snapshot => {
            var count = snapshot.val() || 0; // If no count exists, initialize it to 0
            count++; // Increment the count

            // Generate the node name
            var nodeName = 'PodChat' + count;

            // Update the count in the database
            firebase.database().ref('nodeCount').set(count)
                .then(() => {
                    // Generate a unique push key for the messages object
                    var messagesKey = firebase.database().ref().child(nodeName).push().key;

                    // Create the new node in the database at the same level as "messages"
                    firebase.database().ref().child(nodeName).set({
                        // Use the push key as the key for the messages object
                        [messagesKey]: {
                            username: 'System',
                            content: 'Welcome to your new Pod Chat! Be nice to everyone :)',
                            timestamp: Date.now()
                        }
                    })
                        .then(() => {
                            console.log('New node created successfully.');
                            console.log('New node name:', nodeName); // Print the new node name in the console
                        })
                        .catch(error => {
                            console.error('Error creating new node:', error);
                        });
                })
                .catch(error => {
                    console.error('Error updating node count:', error);
                });
        })
        .catch(error => {
            console.error('Error retrieving node count:', error);
        });
}

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

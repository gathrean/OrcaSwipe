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

// Get the chat name from the URL parameter
var urlParams = new URLSearchParams(window.location.search);
var chatName = urlParams.get('name');

function sendMessage() {
    // Check if the chat name is empty or not available
    if (!chatName) {
        console.error('Chat name is not provided.');
        return;
    }

    var messageInput = document.getElementById('message');
    var message = messageInput.value;

    // Check if the message is empty
    if (message === '') {
        return; // Return without sending the message
    }

    // Get the username from the session or any other source
    var username = "<%= user.username %>";
    // Get the user's image URL from your data source
    var userImage = "<%= user.image %>";

    // Set the default image URL if it is not available
    var imageUrl = userImage || "/images/orca_pfp.jpg";

    // Generate a unique ID for the message
    var messageId = firebase.database().ref().child(chatName).push().key;

    // Save the message, username, image URL, and messageId to Firebase Realtime Database
    firebase.database().ref(chatName + '/' + messageId).set({
        messageId: messageId, // Add the messageId to the message object
        content: message,
        username: username,
        imageUrl: imageUrl,
        timestamp: Date.now()
    });

    // Clear the input field
    messageInput.value = '';
}

function deleteMessage(message) {
    // Check if the chat name is empty or not available
    if (!chatName) {
        console.error('Chat name is not provided.');
        return;
    }
    var messageId = message.messageId;

    // Check if the message is already deleted
    var messageElement = document.getElementById(messageId);
    if (messageElement.classList.contains('deleted-message')) {
        return; // Abort deletion if the message is already deleted
    }

    // Display a confirmation modal
    var confirmDelete = confirm('Are you sure you want to delete this message?');
    if (!confirmDelete) {
        return; // Abort deletion if the user cancels
    }

    firebase
        .database()
        .ref(chatName + '/' + messageId)
        .remove()
        .then(() => {
            var messageElement = document.getElementById(messageId);

            // Update the message content to show it was deleted
            var contentElement = messageElement.querySelector('.chat-message-content');
            contentElement.innerHTML = 'Deleted message';

            // Add a CSS class to visually indicate the message was deleted
            messageElement.classList.add('deleted-message');
        })
        .catch((error) => {
            console.error('Error deleting message:', error);
        });
}

function displayMessage(message) {
    var listItem = document.createElement('li');
    var chatMessage = document.createElement('div');

    // Add the message to the list
    chatMessage.classList.add('chat-message');
    chatMessage.setAttribute('id', message.messageId);

    // Add the username and message content to the message
    if (message.username !== 'System') {
        var sender = document.createElement('span');
        sender.classList.add('chat-username');
        sender.innerHTML =
            '<img src="' +
            message.imageUrl +
            '" alt="pfp" class="user-image">' +
            '@' +
            message.username +
            '<br>';
        chatMessage.appendChild(sender);
    }

    if (message.username === '<%= user.username %>') {
        // Turn the message into an outgoing message
        chatMessage.classList.add('outgoing');

        // Add the delete button container
        var deleteButtonContainer = document.createElement('span');
        deleteButtonContainer.classList.add('delete-button-container');

        // Add the delete button to the container if it is not already deleted
        if (!message.deleted) {
            var deleteButton = document.createElement('button');
            deleteButton.classList.add('delete-button');
            deleteButton.innerHTML = 'X';
            deleteButton.addEventListener('click', function () {
                deleteMessage(message);
            });
            deleteButtonContainer.appendChild(deleteButton);
        }

        // Add the delete button container to the message
        chatMessage.appendChild(deleteButtonContainer);
    } else if (message.username === 'System') {
        // Turn the message into a system message
        chatMessage.classList.add('system');
    } else {
        // Turn the message into an incoming message
        chatMessage.classList.add('incoming');
    }

    // Make sure the chatbox is scrolled to the bottom to show the latest messages
    var chatbox = document.getElementById('chatbox');
    var shouldScroll =
        chatbox.scrollTop + chatbox.clientHeight === chatbox.scrollHeight;

    // Add the message content to the message
    var contentElement = document.createElement('span');
    contentElement.classList.add('chat-message-content');

    // Check if the message is already deleted
    if (message.deleted) {
        contentElement.innerHTML = 'Deleted message';
        chatMessage.classList.add('deleted-message');
    } else {
        contentElement.innerHTML = message.content;
    }

    // Create a timestamp element
    var timestampElement = document.createElement('span');
    timestampElement.classList.add('chat-timestamp');
    var timestamp = new Date(message.timestamp);
    var formattedTimestamp =
        timestamp.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });
    timestampElement.textContent = formattedTimestamp;

    // Append the timestamp element to the content element
    contentElement.appendChild(timestampElement);

    chatMessage.appendChild(contentElement);

    listItem.appendChild(chatMessage);

    chatbox.appendChild(listItem);

    if (shouldScroll) {
        chatbox.scrollTop = chatbox.scrollHeight;
    }
}


// Listen for changes in the Firebase Realtime Database
firebase.database().ref('chatName').on('child_added', function (snapshot) {
    var message = snapshot.val();
    displayMessage(message);
});

// Listen for changes in the Firebase Realtime Database
if (chatName) {
    firebase.database().ref(chatName).on('child_added', function (snapshot) {
        var message = snapshot.val();
        displayMessage(message);
    });
}

function fetchChats() {
    // Fetch the list of available chats
    firebase
        .database()
        .ref()
        .once('value')
        .then((snapshot) => {
            var chats = snapshot.val();
            if (chats) {
                // Clear the chat list container
                var chatListContainer = document.getElementById('chatList');
                chatListContainer.innerHTML = '';

                // Create a scrollable list container
                var listContainer = document.createElement('div');
                listContainer.classList.add('chat-list-container');
                chatListContainer.appendChild(listContainer);

                // Create a horizontal scrollable list
                var chatList = document.createElement('ul');
                chatList.classList.add('horizontal-scroll');

                // Loop through the chats and create a button for each chat
                for (var chat in chats) {
                    var listItem = document.createElement('li');
                    var chatButton = document.createElement('button');
                    chatButton.classList.add('btn', 'blue-button');
                    chatButton.innerHTML = chat;
                    chatButton.addEventListener('click', function () {
                        // Redirect to the chat page with the selected chat name
                        window.location.href = '/chat?name=' + this.innerHTML;
                    });
                    listItem.appendChild(chatButton);
                    chatList.appendChild(listItem);
                }

                // Add the horizontal scrollable list to the container
                listContainer.appendChild(chatList);
            }
        })
        .catch((error) => {
            console.error('Error fetching chats:', error);
        });
}

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
                            console.log('New chat created successfully.');
                            console.log('New chat name:', nodeName); // Print the new chat name in the console

                            // Fetch the list of available chats
                            firebase.database().ref().once('value')
                                .then(snapshot => {
                                    var chats = snapshot.val();
                                    if (chats) {
                                        // Clear the chat list container
                                        var chatListContainer = document.getElementById('chatList');
                                        chatListContainer.innerHTML = '';

                                        // Loop through the chats and create a list item for each chat
                                        for (var chat in chats) {
                                            var listItem = document.createElement('li');
                                            listItem.innerHTML = '<a href="/chat?name=' + chat + '">' + chat + '</a>';
                                            chatListContainer.appendChild(listItem);
                                        }
                                    }
                                })
                                .catch(error => {
                                    console.error('Error fetching chats:', error);
                                });
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
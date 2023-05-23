// Based on code from Rob Vermeer at https://codepen.io/RobVermeer/pen/japZpY

// Selecting elements from the DOM
var tinderContainer = document.querySelector('.tinder');       // Tinder container element
var allCards = document.querySelectorAll('.tinder--card');     // All card elements
var nope = document.getElementById('nope');                    // "Nope" button element
var love = document.getElementById('love');                    // "Love" button element

var pods = []; // Array to store pods

// Function to initialize the cards
function initCards(card, index) {

    // Selecting all the cards that are not removed
    var newCards = document.querySelectorAll('.tinder--card:not(.removed)');
    // Checking if there are no remaining cards
    if (newCards.length === 0) {
        // Display a message indicating that pods are empty
        var emptyMessage = document.createElement('div');
        emptyMessage.classList.add('empty-message');

        var messageText = document.createElement('p');
        messageText.textContent = "No more pods found.";
        emptyMessage.appendChild(messageText);

        var buttonContainer = document.createElement('div');
        buttonContainer.classList.add('button-container');

        var adjustTagsButton = document.createElement('a');
        adjustTagsButton.textContent = "Adjust my tags";
        adjustTagsButton.classList.add('btn', 'white-button');
        adjustTagsButton.href = "/editProfile";
        buttonContainer.appendChild(adjustTagsButton);

        var hostPodButton = document.createElement('a');
        hostPodButton.textContent = "Host a pod";
        hostPodButton.classList.add('btn', 'white-button');
        hostPodButton.href = "/createPod";
        buttonContainer.appendChild(hostPodButton);

        emptyMessage.appendChild(messageText);
        emptyMessage.appendChild(buttonContainer);

        document.getElementById('stack').appendChild(emptyMessage);
    }

    newCards.forEach(function (card, index) {
        // Setting the stacked effect for each card
        card.style.zIndex = allCards.length - index;
        card.style.transform = 'scale(' + (20 - index) / 20 + ') translateY(-' + 30 * index + 'px)';
        card.style.opacity = (10 - index) / 10;
    });

    tinderContainer.classList.add('loaded'); // Adding the "loaded" class to the Tinder container
}


let userTags;  

// Fetch user's interests before fetching pods
const xhrUser = new XMLHttpRequest();
xhrUser.open("GET", "/getUserInterests");  // Replace with your route that fetches user's interests
xhrUser.onload = () => {
    userTags = JSON.parse(xhrUser.responseText);
    console.log('User tags:', userTags);
    // Once userTags is loaded, then fetch pods
    loadPods();
};
xhrUser.send();





// Function to load pods from the server
function loadPods() {
    const xhttp = new XMLHttpRequest();
    // Show the loading circle
    var loadingCircle = document.getElementById('loading-circle');
    loadingCircle.style.display = 'block';



    // Handling the response from the server
    xhttp.onload = () => {
        // Parsing the fetched pods from the response
        var fetchedPods = JSON.parse(xhttp.responseText);

        // Adding each fetched pod to the "pods" array
        for (var i = 0; i < fetchedPods.length; i++) {
            var pod = JSON.parse(fetchedPods[i]);
            // Only push pod if it contains a tag that matches one of the user's tags
            if (pod.tags.some(tag => userTags.includes(tag))) {
                pods.push(pod);
            } else {
                console.log("Please choose tags");
            }
        }

        // If the user has specified a maximum distance, filter the pods based on the distance
        $('body').append(`<div id="map"></div>`)
        var map = L.map('map');
        if (navigator.geolocation && typeof maxDist != undefined) {
            navigator.geolocation.getCurrentPosition(function getLocation(position) {
                userLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
                pods = pods.filter((p) => {
                    return map.distance(p.location, userLocation) <= maxDist;
                })
                $('#map').empty();
                populateStack();
            });
        } else {
            populateStack();
        }
        // Hide the loading circle when the pods have finished loading
        loadingCircle.style.display = 'none';
    }
    // Making a GET request to the server to fetch the pods
    xhttp.open("GET", `getPods`);
    xhttp.send();
}

// Function to populate the stack with pods
function populateStack() {

    // Define tag map
const tagMap = window.interests || [];

// Shows the stack
for (var i = 0; i < pods.length; i++) {
    var tags = pods[i].tags;  // Now tags are an array of strings

    // Creating HTML for each card using pod data
    var card = `<div class="tinder--card">
                    <img src="${pods[i].image}">
                    <h3>${pods[i].name}</h3>
                    <p>${pods[i].eventDescription}</p>
                    <p>Tags: ${tags.join(', ')}</p>
                    <p>OrcaScore: ${pods[i].upvotes.length - pods[i].downvotes.length}</p>
                </div>`;
    $('#stack').append(card); // Appending the card to the stack
}


    // Updating the allCards variable with the newly added cards
    allCards = document.querySelectorAll('.tinder--card');
    initCards();
    makeSwipable();
}


// Function to handle the love swipe action
function handleLoveSwipe(pod) {
    const xhttp = new XMLHttpRequest();

    // Making a POST request to save the pod
    xhttp.open("POST", "/savePod");
    xhttp.setRequestHeader('Content-Type', 'application/json');

    // Sending the pod data in the request body
    xhttp.send(JSON.stringify({ pod: pod }));
}

// Function to handle the nope swipe action
function handleNopeSwipe(pod) {
    const xhttp = new XMLHttpRequest();

    // Making a POST request to perform the nope action on the pod
    xhttp.open("POST", "/nopePod");
    xhttp.setRequestHeader('Content-Type', 'application/json');

    // Sending the pod data in the request body
    xhttp.send(JSON.stringify({ pod: pod }));
}

// Function to make the cards swipable
function makeSwipable() {
    allCards.forEach(function (el) {
        // Initializing Hammer.js for touch gestures on each card
        var hammertime = new Hammer(el);

        hammertime.on('pan', function (event) {
            // Adding the "moving" class to the card when it is being panned
            el.classList.add('moving');
        });

        hammertime.on('pan', function (event) {
            if (event.deltaX === 0) return;
            if (event.center.x === 0 && event.center.y === 0) return;

            // "tinder_love" if the card is swiped to the right, "tinder_nope" if the card is swiped to the left
            tinderContainer.classList.toggle('tinder_love', event.deltaX > 0);
            tinderContainer.classList.toggle('tinder_nope', event.deltaX < 0);

            var xMulti = event.deltaX * 0.03;
            var yMulti = event.deltaY / 80;
            var rotate = xMulti * yMulti;

            event.target.style.transform = 'translate(' + event.deltaX + 'px, ' + event.deltaY + 'px) rotate(' + rotate + 'deg)'; // Applying translation and rotation to the card during panning
        });

        // Handling the "panend" event
        hammertime.on('panend', function (event) {
            el.classList.remove('moving');
            tinderContainer.classList.remove('tinder_love');
            tinderContainer.classList.remove('tinder_nope');

            // Calculating the width of the card's container
            var moveOutWidth = document.body.clientWidth;

            // Determining whether to keep the card or swipe it away based on the swipe distance and velocity
            var keep = Math.abs(event.deltaX) < 80 || Math.abs(event.velocityX) < 0.5;

            // Adding the "removed" class to the card if it should be swiped away
            event.target.classList.toggle('removed', !keep);

            if (!keep && event.deltaX > 0) {
                console.log('Swiped right on:', pods[0]);

                // Handling the love swipe action on the pod
                handleLoveSwipe(pods[0]);

                // Removing the swiped pod from the "pods" array
                pods.shift()
            } else if (!keep && event.deltaX < 0) { // <-- Add this else if to handle "Nope" swipes
                console.log('Swiped left on:', pods[0]);
        
                // Handling the nope swipe action on the pod
                handleNopeSwipe(pods[0]);
        
                // Removing the swiped pod from the "pods" array
                pods.shift();
            }

            if (keep) {
                // Resetting the transform of the card if it should be kept
                event.target.style.transform = '';
            } else {
                var endX = Math.max(Math.abs(event.velocityX) * moveOutWidth, moveOutWidth);
                var toX = event.deltaX > 0 ? endX : -endX;
                var endY = Math.abs(event.velocityY) * moveOutWidth;
                var toY = event.deltaY > 0 ? endY : -endY;
                var xMulti = event.deltaX * 0.03;
                var yMulti = event.deltaY / 80;
                var rotate = xMulti * yMulti;

                // Applying transform to animate the card off the screen
                event.target.style.transform = 'translate(' + toX + 'px, ' + (toY + event.deltaY) + 'px) rotate(' + rotate + 'deg)';

                // Re-initializing the cards
                initCards();
            }
        });
    });
}

// Function to create a button listener
function createButtonListener(love) {
    return function (event) {
        var cards = document.querySelectorAll('.tinder--card:not(.removed)');
        var moveOutWidth = document.body.clientWidth * 1.5;

        if (!cards.length) return false;

        var card = cards[0];

        card.classList.add('removed');

        if (love) {
            card.style.transform = 'translate(' + moveOutWidth + 'px, -100px) rotate(-60deg)';

            // Handling the love swipe action on the pod
            handleLoveSwipe(pods[0]);

            // Removing the swiped pod from the "pods" array
            pods.shift();
        } else {
            card.style.transform = 'translate(-' + moveOutWidth + 'px, -100px) rotate(60deg)';

            // Handling the nope swipe action on the pod
            handleNopeSwipe(pods[0]);

            // Removing the swiped pod from the "pods" array
            pods.shift();
        }

        initCards();
        event.preventDefault();
    };
}

loadPods(); // Loading the pods from the server

var nopeListener = createButtonListener(false);
var loveListener = createButtonListener(true);

nope.addEventListener('click', nopeListener);
love.addEventListener('click', loveListener);

document.addEventListener('click', function (event) {
    if (event.target.matches('.show-attenders')) {
        var podId = event.target.dataset.podId;

        const xhttp = new XMLHttpRequest();
        xhttp.onload = () => {
            var attenders = JSON.parse(xhttp.responseText);
            var attendersText = attenders.map(attender => attender.name).join(', ');  // assuming attenders have a 'name' field
            document.getElementById('modal-text').innerText = `Attenders: ${attendersText}`;

            // Show modal
            var modal = document.getElementById('modal');
            modal.style.display = "block";
        }
        xhttp.open("GET", `/pod/${podId}/attenders`);
        xhttp.send();
    }
}, false);

// When the user clicks on <span> (x), close the modal
document.getElementsByClassName('close')[0].onclick = function () {
    document.getElementById('modal').style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    var modal = document.getElementById('modal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

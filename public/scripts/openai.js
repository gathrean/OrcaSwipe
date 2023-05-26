// Built using https://danielkhv.com/blog/createyourownchatbot

//Get reference to our submit button and chatbot field
const submit = document.getElementById("submit"); // Assigns the element with the ID "submit" to the variable 'submit'
const userInput = document.getElementById("user-input"); // Assigns the element with the ID "user-input" to the variable 'userInput'
const chatHistory = document.getElementById("chat-history"); // Assigns the element with the ID "chat-history" to the variable 'chatHistory'
const loading = document.getElementById("spinner"); // Assigns the element with the ID "spinner" to the variable 'loading'
const buttonsLoading = document.getElementById("spinner2"); // Assigns the element with the ID "spinner2" to the variable 'buttonsLoading'
const set = document.getElementById('set-interests'); // Assigns the element with the ID "set-interests" to the variable 'set'
const holder = document.getElementById('holder'); // Assigns the element with the ID "holder" to the variable 'holder'
const interestDiv = document.getElementById('interests-buttons'); // Assigns the element with the ID "interests-buttons" to the variable 'interestDiv'
let promptResponses = [];


//Our call to the API
const generateResponse = async () => {
    //Get the user input field value
    //Set loading spinner
    loading.classList.remove("visually-hidden");
    submit.classList.add("visually-hidden");
    buttonsLoading.classList.remove("visually-hidden");
    interestDiv.classList.add("visually-hidden");
    set.classList.add("visually-hidden");
    var input = userInput.value;

    //Store our previous messages
    promptResponses.push({
        question: input,
        response: message
    });
    //Clear both fields
    userInput.value = "";

    var historyElement = document.createElement('div');
    historyElement.innerHTML = `<li class="list-group-item"><b>You Said:</b> ${input}</li>`;
    chatHistory.replaceChildren(historyElement);

    //Stop loading spinner
    loading.classList.add("visually-hidden");
    submit.classList.remove("visually-hidden");

    // combines a predefined activity suggestion prompt with user input, 
    // clears the contents of a specific element, and sends a POST request to a chatbot endpoint 
    // to get a response using the modified input
    interests = [];
    var activitySuggestionPrompt = `Given what I just said, could you generate an array of activities or activity types that might interest me? 
        Ensure that the array is parseable in JavaScript and only respond with the array, nothing else.`
    var modifiedInput = input + activitySuggestionPrompt;
    interestDiv.replaceChildren();

    try {
        var response = await fetch('/chatgpt', {
            method: 'POST',
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{
                    "role": "user",
                    "content": modifiedInput
                }],
                temp: 0.6
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        var responseData = await response.json();
        var message = responseData.result[0].message.content;
        interests = JSON.parse(message);
        populateInterests(interests);
    } catch (error) {
        interestDiv.append('Sorry, I couldn\'t generate any more suggestions for you. Please try again.');
    }
    buttonsLoading.classList.add("visually-hidden");
    interestDiv.classList.remove("visually-hidden");
    set.classList.remove("visually-hidden");
}

//Assign onclick method
submit.onclick = generateResponse;
var selectedInterests = [];
var interests = ['Ocean Clean-up', 'Volunteer', 'Charity', 'Clothing drive', 'Blood drive', 'Art', 'Cancer Walk', 'Travel', 'Photography'];
populateInterests(interests);
interestDiv.insertAdjacentHTML('afterbegin', '<div>Below are some Orca-approved recommended pod tags</div>');

function assignRandomColors() {
    var buttons = document.querySelectorAll('.interest-button');
    buttons.forEach(function (button) {
        // Generate a hue that isn't within the blue range
        var hue = (Math.random() * 180) + (Math.random() > 0.5 ? 240 : 0);
        // Preserve existing styles while changing the background color
        button.style.cssText += 'background-color: hsl(' + hue + ', 100%, 20%)';
    });
}

function populateInterests(interests) {
    interestDiv.replaceChildren();
    for (var i = 0; i < interests.length; i++) {
        var button = document.createElement('button');
        button.setAttribute('class', 'interest-button');
        button.setAttribute('value', interests[i])
        button.setAttribute('type', 'button');
        button.insertAdjacentText('afterbegin', interests[i]);
        button.addEventListener('click', (e) => {
            e.currentTarget.classList.toggle('selected');
            if (e.currentTarget.classList.contains('selected')) {
                selectedInterests.push(e.currentTarget.value);
            } else {
                selectedInterests.splice(selectedInterests.indexOf(e.currentTarget.value), 1);
            }
            holder.value = selectedInterests;
        })
        interestDiv.append(button);
    }
    // Call the function to assign random colors to the buttons after they have been added to the DOM
    assignRandomColors();
}
//Get reference to our submit button and chatbot field
const submit = document.getElementById("submit");
const userInput = document.getElementById("user-input");
const chatHistory = document.getElementById("chat-history");
const loading = document.getElementById("spinner");

let promptResponses = [];


//Our call to the API
const generateResponse = async () => {
    //Get the user input field value
    //Set loading spinner
    loading.classList.remove("visually-hidden");
    submit.classList.add("visually-hidden");
    var input = userInput.value;
    var response = await fetch('/chatgpt', {
        method: 'POST',
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{"role": "user", "content": input}],
            temp: 0.6
        }), 
        headers: {
            'Content-Type': 'application/json'
        }
    });

    var responseData = await response.json();
    var message = responseData.result[0].message.content;
    console.log(message);

    //Store our previous messages
    promptResponses.push({question: input, response: message});
    //Clear both fields
    userInput.value = "";

    var historyElement = document.createElement('div');
    historyElement.innerHTML = `<li class="list-group-item"><b>You:</b> ${input}</li>
                                <li class="list-group-item"><b>ChatGPT:</b> ${message}</li>`;
    chatHistory.append(historyElement);

    //Stop loading spinner
    loading.classList.add("visually-hidden");
    submit.classList.remove("visually-hidden");

    interests = [];
    var activitySuggestionPrompt = `Given what I just said, could you generate an array of activities or activity types that might interest me? Ensure that the array is parseable in JavaScript using JSON.parse().`
    var modifiedInput = input + activitySuggestionPrompt;
    response = await fetch('/chatgpt', {
        method: 'POST',
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{"role": "user", "content": modifiedInput}],
            temp: 0.6
        }), 
        headers: {
            'Content-Type': 'application/json'
        }
    });
    responseData = await response.json();
    message = responseData.result[0].message.content;
    console.log(message);
    interests = JSON.parse(message);
    populateInterests(interests);
}

//Assign onclick method
submit.onclick = generateResponse;

var interests = ['Ocean Clean-up', 'Volunteer', 'Charity', 'Black Lives Matter', 'Clothing drive', 'Blood drive', 'Art', 'Cancer Walk', 'Travel', 'Photography'];

function populateInterests(interests){
    $('#interests-buttons').empty();
    for (var i = 0; i < interests.length; i++){
        $('#interests-buttons').append(`<button class="interest-button" type="button" data-interest="${interests[i]}">${interests[i]}</button>`);
    }
}
populateInterests(interests);
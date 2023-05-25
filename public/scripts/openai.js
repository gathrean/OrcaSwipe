//Get reference to our submit button and chatbot field
const submit = document.getElementById("submit");
const userInput = document.getElementById("user-input");
const chatHistory = document.getElementById("chat-history");
const loading = document.getElementById("spinner");
const buttonsLoading = document.getElementById("spinner2");
const set = document.getElementById('set-interests');
const holder = document.getElementById('holder');
const interestDiv = document.getElementById('interests-buttons');

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
    // var response = await fetch('/chatgpt', {
    //     method: 'POST',
    //     body: JSON.stringify({
    //         model: "gpt-3.5-turbo",
    //         messages: [{"role": "user", "content": input}],
    //         temp: 0.6
    //     }), 
    //     headers: {
    //         'Content-Type': 'application/json'
    //     }
    // });

    // var responseData = await response.json();
    // var message = responseData.result[0].message.content;

    //Store our previous messages
    promptResponses.push({question: input, response: message});
    //Clear both fields
    userInput.value = "";

    var historyElement = document.createElement('div');
    historyElement.innerHTML = `<li class="list-group-item"><b>You:</b> ${input}</li>`;
    chatHistory.replaceChildren(historyElement);

    //Stop loading spinner
    loading.classList.add("visually-hidden");
    submit.classList.remove("visually-hidden");

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
                messages: [{"role": "user", "content": modifiedInput}],
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
        interestDiv.append('Sorry, I couldn\'t generate any suggestions for you. Please try again.');
    }
    buttonsLoading.classList.add("visually-hidden");
    interestDiv.classList.remove("visually-hidden");
    set.classList.remove("visually-hidden");
}

//Assign onclick method
submit.onclick = generateResponse;
var selectedInterests = [];
var interests = ['Ocean Clean-up', 'Volunteer', 'Charity', 'Black Lives Matter', 'Clothing drive', 'Blood drive', 'Art', 'Cancer Walk', 'Travel', 'Photography'];
populateInterests(interests);
interestDiv.insertAdjacentHTML('afterbegin', '<div>Here are some default suggestions where you can help your community!</div>');


function populateInterests(interests){
    interestDiv.replaceChildren();
    for (var i = 0; i < interests.length; i++){
        var button = document.createElement('button');
        button.setAttribute('class', 'interest-button');
        button.setAttribute('value', interests[i])
        button.setAttribute('type', 'button');
        button.insertAdjacentText('afterbegin', interests[i]);
        button.addEventListener('click', (e) => {
            e.currentTarget.classList.toggle('selected');
            if (e.currentTarget.classList.contains('selected')){
                selectedInterests.push(e.currentTarget.value);
            } else {
                selectedInterests.splice(selectedInterests.indexOf(e.currentTarget.value), 1);
            }
            holder.value = selectedInterests;
        })
        interestDiv.append(button);
    }
}
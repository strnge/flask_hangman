/*
 * developed by strnge
 * with assistance from cr0wlet
 * 03-2025
*/
var game_data_container = null;
var display_word = "";
var display_graveyard = "";

//should prompt if user tries to refresh?
//TODO: doesn't work right now
function refresh_prompt(){
    confirm_message = "Are you sure you want to refresh?\nIt will erase your current game session without saving your score.";
    if(confirm(confirm_message)){
        init();
    }
}

//begin game logic, load game interface
function init(){
    display_word = "";
    window.location.href = '/init';
}

function update_health(health){
    document.getElementById('health_counter').innerHTML = "Guesses remaining: ".concat(health);
}

//updates debug display on page
function update_debug_state(state){
    document.getElementById('state_debug').innerHTML = "State = ".concat(state);
}

//updates word display on page
function update_word_display(){
    document.getElementById('word_container').innerHTML = "Word: ".concat(display_word);
}

function update_winloss(wins, losses){
    document.getElementById('score_container').innerHTML = "Wins: ".concat(wins) + " || Losses: ".concat(losses);
}

function update_game_message(debug){
    var msg_update = ""
    switch(debug){
        case "good_guess":
            msg_update = "Good guess!";
            break;
        case "bad_guess":
            msg_update = "Bad guess!";
            break;
        case "duplicate_guess":
            msg_update = "Please only use english alphabetical characters.";
            break;
        case "alpha_err":
            msg_update = "Duplicate guess!";
            break;
        case "length_err":
            msg_update = "Must be exactly 1 character!";
            break;
    }
    document.getElementById("game_message").innerHTML = msg_update;
}

function update_graveyard(graveyard){
    display_graveyard = "";
    for (var character of graveyard){
        display_graveyard += character + " ";
    }
    document.getElementById('graveyard').innerHTML = "Graveyard = ".concat(display_graveyard);
}

// TODO: update this with an AJAX req to handle game logic accordingly
function submit_guess() {
    var guess = document.getElementById('input_box').value; //grab value from user input box
    var alphaCheck = /^[A-Za-z]{1}$/.test(guess); //checks whether the string only contains alphabetical characters
    if (guess.length != 1){ //checking the length of the char
        update_game_message("length_err");
        update_debug_state("length_err");
    } else if (!alphaCheck){ //only if guess does not contain only alphabetical characters
        update_game_message("alpha_err");
        update_debug_state("alpha_err");
    } else { 
        try{
            console.log(guess);
            guess = guess.toLowerCase();
            fetch("/send_guess?input_box=" + guess, { // send a GET request with our guess, and receive back the game state as a response 
                method: 'GET',
            }).then(function(response){ // we receieve the promise object and turn it into json with .json() 
                return response.json();
            }).then(function(json){ // now we can use the fields within the json obj
                if(json.debug != "game_over" && json.debug != "game_win") {
                    display_word = json.display_word;
                    update_health(json.health);
                    update_word_display();
                    update_debug_state(json.debug);
                    update_game_message(json.debug);
                    update_winloss(json.wins, json.losses);
                    update_graveyard(json.graveyard);
                    console.log(json);
                }
            });
        } catch (err){
            console.log(err);
        }
    }
    document.getElementById("input_box").value = ""; //reset input box to prepare for new guess
}
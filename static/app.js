/*
 * developed by strnge
 * with assistance from cr0wlet
 * 03-2025
*/
var display_word = "";
var display_graveyard = "";

/* initialization */

//begin game logic, load game interface
function init(){
    display_word = "";
    display_graveyard = "";
    location.href = "/init";
}

//inits a new game while keeping current score
function new_game(){
    display_word = "";
    display_graveyard = "";
   try{
        fetch("/new_game",{// fetch request, retrieves json response containing the state of the game
            method: "GET"
        }).then(function(response){
            return response.json();
        }).then(function(json){
            updateUI(json);
        });
    }catch (err){
        console.log(err);
    }
}

/* prompts */

//prompt user to play again
//winner is a boolean value
//if set to false, will display message indicating player lost - otherwise will display message indicating they won
function prompt_replay(winner){
    if(winner == true)
        prompt = "You won! Do you want to play another match?";
    else
        prompt = "You lost! Do you want to play another match?";
    if(confirm(prompt)){
        new_game();
    } else {
        var score_button = document.getElementById("submit_score");
        score_button.style.display = "block";
        var score_button = document.getElementById("submit_guess");
        score_button.style.display = "none";
        var optional_ui = document.getElementById("hidable_elements");
        optional_ui.style.display = "none";
    }
}

//should prompt if user tries to refresh?
//TODO: doesn't work right now
function prompt_restart(){
    confirm_message = "Are you sure you want to restart?\nIt will erase your current game session without saving your score.";
    if(confirm(confirm_message)){
        init();
    }
}

/* ui updates */

//updates debug display on page
function update_debug_state(state){
    document.getElementById("state_debug").innerHTML = "State = ".concat(state);
}

//updates word display on page
function update_word_display(){
    document.getElementById("word_container").innerHTML = "Word: ".concat(display_word);
}

//updates the score table
function update_winloss(wins, losses){
    document.getElementById("score_container").innerHTML = "Wins: ".concat(wins) + " || Losses: ".concat(losses);
}

//update the game message to display
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
            msg_update = "Duplicate guess!";
            break;
        case "alpha_err":
            msg_update = "Please only use english alphabetical characters.";
            break;
        case "length_err":
            msg_update = "Must be exactly 1 character!";
            break;
        case "username_err":
            msg_update = "Please only use A-Z, 0-9, and underscores (_)"
    }
    document.getElementById("game_message").innerHTML = msg_update;
}

//updates display of graveyard so user can keep track of previously guessed chars
function update_graveyard(graveyard){
    display_graveyard = "";
    for (var character of graveyard){
        display_graveyard += character + " ";
    }
    document.getElementById("graveyard").innerHTML = "Graveyard = ".concat(display_graveyard);
}

//updates game ui with json response data
function updateUI(json){
    display_word = json.display_word;
    update_word_display();
    update_debug_state(json.debug);
    update_game_message(json.debug);
    update_winloss(json.wins, json.losses);
    update_graveyard(json.graveyard);
    update_health(json.health);
}

//update health value on screen
function update_health(health){
    document.getElementById("health_counter").innerHTML = "Guesses remaining: ".concat(health);
    if(health == 0){
        prompt_replay(false);
    } else if(!(/(\*+)/.test(display_word))){
        prompt_replay(true);
    }
}

/* server submissions and responses */

//uses fetch to send the user"s guess, then retrieve the JSON response with the current state of the game (was the guess successful, how much health is left, etc)
function submit_guess() {
    var guess = document.getElementById("input_box").value; //grab value from user input box
    var alphaCheck = /^[A-Za-z]{1}$/.test(guess); //checks whether the string only contains alphabetical characters
    if (guess.length != 1){ //checking the length of the char
        update_game_message("length_err");
        update_debug_state("length_err");
    } else if (!alphaCheck){ //only if guess does not contain only alphabetical characters
        update_game_message("alpha_err");
        update_debug_state("alpha_err");
    } else { 
        try{
            guess = guess.toLowerCase(); // for ease of use and consistency we convert to lower case
            fetch("/send_guess?input_box=" + guess, { // send a GET request with our guess, and receive back the game state as a JSON response 
                method: "GET",
            }).then(function(response){ // we receieve the promise object and turn it into json with .json() 
                return response.json();
            }).then(function(json){ // now we can use the fields within the json obj
                //various UI updates
                updateUI(json);
            });
        } catch (err){
            console.log(err);
        }
    }
    document.getElementById("input_box").value = ""; //reset input box to prepare for new guess
}

//submits score via fetch to be stored in the scores file
function submit_score(){
    var username = document.getElementById("input_box").value;
    if(!/\W+/g.test(username)){
        try{
            fetch("/update_board?input_box=" + username, { // send a GET request with our guess, and receive back the game state as a JSON response 
                method: "GET"
            }).then(function(response){ // we receieve the promise object and turn it into json with .json() 
                if(response.text == "submitted"){
                    location.href = "/scoreboard";
                } else {
                    console.log("error submitting score, check logs");
                }
            })
        } catch (err){
            console.log(err);
        } 
    } else {
        update_game_message("username_err");
        update_debug_state("username_err");
    }
}
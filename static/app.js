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
    diff_menu = document.getElementById("difficulty");
    diff_select = diff_menu.options[diff_menu.selectedIndex].value;

    display_word = "";
    display_graveyard = "";
    location.href = 'init?difficulty=' + diff_select;
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

//should prompt if user tries to restart game
//does not do anything if they refresh the page
function prompt_restart(){
    confirm_message = "Are you sure you want to restart?\nIt will erase your current game session without saving your score.";
    if(confirm(confirm_message)){
        new_game();
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
    var msg_color;
    

    //determine coloring of message, errors should be red to catch the user's attention
    if(debug=="good_guess"){
        msg_color = "black";
    } else {
        msg_color = "red";
    }

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
    document.getElementById("game_message").style.color = msg_color;
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
    var visdis = document.getElementById("visdis");
    switch(health){
        case 6:
        case 4:
        case 2:
        case 0:
            visdis.src = "./static/images/one.png";
            visdis.alt = "placeholder image 1";
            break;
        case 5:
        case 3:
        case 1:
            visdis.src = "./static/images/two.png";
            visdis.alt = "placeholder image 2";
            break;
    }
    if(health == 0){
        prompt_replay(false);//TODO: CHANGE PROMPTS TO DYNAMIC UI LIKE THE REST OF UI
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

function scoreboard_redirect(){
    diff_menu = document.getElementById("difficulty");
    diff_select = diff_menu.options[diff_menu.selectedIndex].value;

    location.href = "scoreboard?difficulty=" + diff_select;
}

//submits score via fetch to be stored in the scores file
function submit_score(){
    var username = document.getElementById("input_box").value;
    if(!/\W+/g.test(username)){//regex to make sure they're only entering word characters 
        try{
            fetch("/update_board?input_box=" + username, { // send a GET request with our guess, and receive back the game state as a JSON response 
                method: "GET"
            }).then(function(response){ // we receieve the promise object and turn it into json with .json() 
                if(response.ok){
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
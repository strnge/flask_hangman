var game_data_container = null;
var display_word = "";

//should prompt if user tries to refresh?
function refresh_prompt(){
    confirm_message = "Are you sure you want to refresh?\nIt will erase your current game session without saving your score.";
    if(confirm(confirm_message)){
        init();
    }
}

function begin_game(){
    //begin game logic, load game interface
    display_word = "";
    window.location.href = '/init';
}

function init(){
    //begin game logic, load game interface
    display_word = "";
    window.location.href = '/init';
/*     $.ajax({
        url: '/init', //api route to be called
        type: 'POST', //request type, POST or GET
        success: function(response) { //what to do if the server responds successfully
            //do something
            window.location.href = '/init'
        },
        error: function(error) { //what to do if the server responds with an error
            console.log(error);
            update_debug_state('ajax error');
        }
    }) */
}
/*
function generate_word(){
    //reset score
    text ="";
    wins = 0;
    losses = 0;
    //request word from the server, init display_word and store game_word
    $.ajax({
        url: '/init', //api route to be called
        type: 'POST', //request type, POST or GET
        data: text,
        success: function(response) { //what to do if the server responds successfully

        },
        error: function(error) { //what to do if the server responds with an error
            console.log(error);
            update_debug_state('ajax error');
        }
    })
}

function update_game_message(message){
    document.getElementById("game_message").innerHTML = message;
}

function update_debug_state(state){
    document.getElementById('state_debug').innerHTML = "State = ".concat(state);
}

function update_word_display(){
    document.getElementById('word_container').innerHTML = "Word: ".concat(display_word);
}*/

// TODO: update this with an AJAX req to handle game logic accordingly
function submit_guess() {
    var guess = document.getElementById('input_box').value; //grab value from user input box
    var alphaCheck = /^[A-Za-z]+$/.test(guess); //checks whether the string only contains alphabetical characters
    if (guess.length != 1){ //checking the length of the char
        update_game_message("Must be exactly 1 character!");
        update_debug_state("length_err");
    } else if (!alphaCheck){ //only if guess does not contain only alphabetical characters
        update_game_message("Please only use english alphabetical characters.");
        update_debug_state("alpha_err");
    } else { //call to search for char/update string
        //char_graveyard.push(guess);
        var response = fetch("/send_guess", {
            method: 'POST',
            //TODO: maybe solution?
        })
    }
    document.getElementById("input_box").value = ""; //reset input box to prepare for new guess
}
/*
function game_search(e) {
    var char_array = [...display_word];//convert these to arrays for ease of individual searching
    var game_array = [...game_word];
    var chars_found = 0;
    for (i = 0;i<game_array.length;i++) {
        if(game_array[i] == e){
            char_array[i] = e; // at each index i replace a '*' with element e
            chars_found++;
        }
    }
    display_word = char_array.toString().replaceAll(/,/gi,""); //convert array back to string
    if(chars_found>0){
        update_game_message("Great guess!");
        update_debug_state("guess_success");
    } else {
        update_game_message("Try again!");
        update_debug_state("guess_fail");
    }
    update_word_display();
    if(display_word === game_word){
        wins++;
        update_game_message("Well done! The word was " + game_word);
        update_debug_state("win");
    }
}*/
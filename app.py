from flask import Flask,render_template,request,session,jsonify,redirect
from markupsafe import escape
import re
import random
import secrets
import strnge_logger
import datetime

'''
developed by strnge
with assistance from cr0wlet
03-2025
'''

#debug types:
# new_game , bad_guess , good_guess , duplicate_guess

app = Flask(__name__)
app.secret_key = secrets.token_hex(8) # tokenize for the session, required

curtime = datetime.datetime.now().strftime("%Y-%m-%d %H-%M-%S")
strnge_logger.start_log(curtime) # begin logging

# generate word for game
# open local word file, read in, strip out unnecesary chars, 
# random.choice from the generated list, return that choice
def generate_word():
    with open('./static/words.txt','r') as f: 
        word_list = f.readlines()
        word_list = [item.strip() for item in word_list]
    word = random.choice(word_list)
    return word

# searches through the word for each occurence of a character, and returns a list of each position. 
# if the returned list is empty, no occurences were found
def search_char(s, ch):
    return [i for i, ltr in enumerate(s) if ltr == ch]


# on first call, generates the display version of the word
# on subsequent calls, searches the word of occurences of the last character guessed, 
# gets a position list, and replaces those corresponding characters in the display word
def reveal_word():
    if session["display_word"] == "": # initial generation of display string
        for i in range(len(session["word"])):
            session["display_word"] += "*"
        session["display_word"]
    else:
        reveal_list = search_char(session["word"], session["graveyard"][-1])
        if(not reveal_list):# bad guess! health decreased by 1, 
            session["health"] = session["health"]-1
            session["debug"] = "bad_guess"
        else:
            session["debug"] = "good_guess"
            word_to_list = list(session["display_word"])
            for i in range(len(reveal_list)):
                word_to_list[reveal_list[i]] = session["graveyard"][-1]
            session["display_word"] = ''.join(word_to_list)
    if('*' not in session["display_word"]):
        session["wins"] = session["wins"] + 1 

# create json object of the important vars for the game
def get_state():
    returnable_json = { 
                        "display_word": session["display_word"],
                        "health": session["health"],
                        "graveyard": session["graveyard"],
                        "wins": session["wins"],
                        "losses": session["losses"],
                        "debug": session["debug"]
                      }
    return jsonify(returnable_json)

# welcome screen, leads to gameplay
@app.route('/')
def home():
    return render_template('welcome.html')

# initialize the session and the first round by calling new_game() after setting/resetting win and loss session vars
# TODO: implement difficulty selection, determines max length of word (easy could be 4-5, medium 5-6, hard 6+ only)
@app.route('/init')
def init_game():
    session["wins"] = 0
    session["losses"] = 0

    new_game()
    
    strnge_logger.log_operation(curtime, "app initialization", [session["word"],session["wins"],session["losses"],session["display_word"],session["health"],session["graveyard"],session["debug"]])

    return render_template('index.html', state=session["debug"], health=session["health"], wins=session["wins"], losses=session["losses"], display=session["display_word"], default_message="Hello!",motd="This is where the MOTD would go")

# sets up a new game still in the same session(lets user continue accruing wins and losses)
@app.route('/new_game')
def new_game():
    session["word"] = generate_word() # generate word for the session
    session["display_word"] = ""
    reveal_word() # initial call to generate display word
    session["health"] = 6
    session["graveyard"] = list()
    session["debug"] = "new_game"
    # generate json response for the client
    state = get_state()
    return state

# client sends user's guess, check against word
@app.route('/send_guess',methods=['GET'])
def guess():
    request_data = escape(request.args.get("input_box"))
    strnge_logger.log_operation(curtime, "input processing", request_data)

    # regex search to make sure only 1 alpha character was guessed
    # technically we should only have received this POST req if
    # the client-side verified that already but we double check in case
    # there are any issues on the client side
    if(re.search(r"^[A-Za-z]{1}$", request_data[0]) is not None):
        if(request_data[0] in session["graveyard"]):# check graveyard to see if this guess has been made already
            session["debug"] = "duplicate_guess"
        else:
            session["graveyard"].append(request_data)# add guess to the end of the graveyard
            reveal_word()# search for the guessed character and modify health/display string as needed
    return get_state()

# request scoreboard
@app.route('/scoreboard')
def scoreboard():
    '''TODO: something like return render_template('index.html', html_file="score_interface.html",'
    ' score_file=local_score_file***json file goes here, declared above***)'''
    # redir makes more sense here
    return -1 

# run localhost only
if __name__ == '__main__':
    app.run(host='127.0.0.1',port=3000,debug=True)
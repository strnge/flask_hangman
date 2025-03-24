from flask import Flask,render_template,request,session,jsonify
from markupsafe import escape
from operator import itemgetter
import re, random, datetime, secrets, json, strnge_logger

'''
developed by strnge
with assistance from cr0wlet
03-2025
'''

# debug types:
# new_game , bad_guess , good_guess , duplicate_guess

app = Flask(__name__)
app.secret_key = secrets.token_hex(8) # tokenize for the session, required

'''TO ENABLE LOGGER, CHANGE THIS TO TRUE'''
LOGGING=False
'''TO ENABLE LOGGER, CHANGE THIS TO TRUE'''

if(LOGGING==True):
    curtime = datetime.datetime.now().strftime("%Y-%m-%d %H-%M-%S")
    strnge_logger.start_log(curtime) # begin logging


# V ----------- nonroute functions ----------- V #


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

# takes the scores file, parses and sorts by score descending, then writes the sorted version back ot the file
def sort_scoreboard():
    with open('./static/scores.json','r') as scores_f:
        scores_data = json.load(scores_f) #load the contents of the file as json
        sorted_board = json.dumps(sorted(scores_data['scoreboard'],key=itemgetter('score'), reverse=True)) #sort the list of score entries by the score value, descending
        sorted_board = json.loads(sorted_board) #reparse the sorted list back to json from a string
        scores_data['scoreboard'] = sorted_board #overwrite the unsorted board with the new sorted version
    with open('./static/scores.json','w') as scores_fw:
        scores_fw.write(json.dumps(scores_data, indent=4))


# V ----------- routes ----------- V #


# on first call, generates the display version of the word
# on subsequent calls, searches the word of occurences of the last character guessed, 
# gets a position list, and replaces those corresponding characters in the display word
def reveal_word():
    if session["display_word"] == "": # initial generation of display string
        for i in range(len(session["word"])):
            session["display_word"] += "*"
        session["display_word"]
    else: # perform string manip based on user guess
        reveal_list = search_char(session["word"], session["graveyard"][-1])
        if(not reveal_list):# bad guess! health decreased by 1, 
            session["health"] = session["health"] - 1
            session["debug"] = "bad_guess"
        else:# good guess! reveal guessed character in word
            session["debug"] = "good_guess"
            word_to_list = list(session["display_word"]) 
            for i in range(len(reveal_list)):
                word_to_list[reveal_list[i]] = session["graveyard"][-1]
            session["display_word"] = ''.join(word_to_list)
    if('*' not in session["display_word"]):# word fully revealed! user has won this match
        session["wins"] = session["wins"] + 1 
        if(LOGGING==True):
            strnge_logger.log_operation(curtime, "player win successfully", session["wins"])

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
    
    if(LOGGING==True):
        strnge_logger.log_operation(curtime, "app initialization", [session["word"],session["wins"],session["losses"]])

    return render_template('index.html', state=session["debug"], health=session["health"], wins=session["wins"], losses=session["losses"], display=session["display_word"], default_message="Hello!",motd="This is where the MOTD would go")

# sets up a new game still in the same session(lets user continue accruing wins and losses)
@app.route('/new_game')
def new_game():
    session["word"] = generate_word() # generate word for the session
    session["display_word"] = ""
    reveal_word() # initial call to generate display word
    session["health"] = 6
    session["graveyard"] = list() # empty list
    session["debug"] = "new_game"
    if(LOGGING==True):
        strnge_logger.log_operation(curtime, "new game generation", [session["word"],session["display_word"],session["health"],session["graveyard"],session["debug"]])
    # generate json response for the client
    state = get_state()
    return state

# client sends user's guess, check against word
@app.route('/send_guess',methods=['GET'])
def guess():
    request_data = escape(request.args.get("input_box"))
    if(LOGGING==True):
        strnge_logger.log_operation(curtime, "input processing", request_data)

    # regex search to make sure only 1 alpha character was guessed
    # technically we should only have received this GET req if
    # the client-side verified that already but we double check in case
    # there are any issues on the client side
    if(re.search(r"^[A-Za-z]{1}$", request_data[0]) is not None):
        if(request_data[0] in session["graveyard"]):# check graveyard to see if this guess has been made already
            session["debug"] = "duplicate_guess"
        else:
            session["graveyard"].append(request_data[0])# add guess to the end of the graveyard
            reveal_word()# search for the guessed character and modify health/display string as needed
            if(session["health"] == 0):# user lost :(
                session["losses"] = session["losses"] + 1
                if(LOGGING==True):
                    strnge_logger.log_operation(curtime, "player lost", "losses: " + str(session["losses"]))
    return get_state()

#ported function from previously written console hangman, adds new user to the list
@app.route('/update_board')
def update_board():
        # open scores, add to list
    with open('./static/scores.json','r') as scores_f:
        sorted_board = json.load(scores_f)
        username = escape(request.args.get("input_box"))
        if(re.search(r"\W+", username) is not None): # double checking input from user
            return "name error"
        userscore = session["wins"] - session["losses"]
        if(LOGGING==True):
            strnge_logger.log_operation(curtime, "scoreboard update", "score: " + str(userscore) + " username: " + username)
        # append to the board in memory
        sorted_board['scoreboard'].append(dict(name=username,score=userscore))
        # write the updated board to the scores file
        with open('./static/scores.json','w') as scores_fw:
            scores_fw.write(json.dumps(sorted_board, indent=4))
    return "submitted"
            


# request scoreboard, pass the json to the template
@app.route('/scoreboard')
def scoreboard():
    sort_scoreboard()

    with open('./static/scores.json', 'r') as scores_f:
        score_json = json.load(scores_f)

    return render_template('score_page.html', board=score_json)

# run localhost only
if __name__ == '__main__':
    app.run(host='127.0.0.1',port=3000,debug=True)
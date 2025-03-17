from flask import Flask,render_template,request,session,jsonify
import random
import secrets

app = Flask(__name__)
app.secret_key = secrets.token_hex(8) # tokenize for the session, required

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
def find(s, ch):
    return [i for i, ltr in enumerate(s) if ltr == ch]


# on first call, generates the display version of the word
# on subsequent calls, searches the word of occurences of the last character guessed, 
# gets a position list, and replaces those corresponding characters in the display word
def reveal_word():
    if not session["display_word"]:
        for i in range(len(session["word"])):
            session["display_word"] += "*"
        session["display_word"]
    else:
        reveal_list = find(session["word"], session["graveyard"][-1])
        word_to_list = list(session["display_word"])
        for i in range(len(reveal_list)):
            word_to_list[reveal_list[i]] = session["graveyard"][-1]
        session["display_word"] = ''.join(word_to_list)
    return

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

    return new_game()

# sets up a new game still in the same session(lets user continue accruing wins and losses)
@app.route('/new_game')
def new_game():
    session["word"] = generate_word() # generate word for the session
    session["health"] = 6
    session["graveyard"] = []
    session["debug_state"] = "new_game"
    
    return render_template('index.html', word_length=len(session["word"]), state=session["debug_state"], health=session["health"], wins=session["wins"], losses=session["losses"], graveyard=session["graveyard"])

# client sends user's guess, check against word
@app.route('/send_guess',methods=['POST'])
def guess():
    # TODO: receieve guess from client, verify and send response back
    return -1 #render_template blablabla

# request scoreboard
@app.route('/scoreboard')
def scoreboard():
    '''TODO: something like return render_template('index.html', html_file="score_interface.html",'
    ' score_file=local_score_file***json file goes here, declared above***)'''

    return -1 

# run localhost only
if __name__ == '__main__':
    app.run(host='127.0.0.1',port=3000,debug=True)
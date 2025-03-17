from flask import Flask,render_template,request,session,jsonify
import random
import secrets

app = Flask(__name__)
app.secret_key = secrets.token_hex(8) #tokenize for the session, required

# generate word for game
def generate_word():
    with open('./flask_hangman/static/words.txt','r') as f:
        word_list = f.readlines()
        word_list = [item.strip() for item in word_list]
    word = random.choice(word_list)
    return word

def get_current_state():
    state_json = [session["guesses_remaining"],session["wins"],session["losses"]]

#welcome screen, leads to gameplay
@app.route('/')
def home():
    return render_template('index.html',html_file='welcome_interface.html')

#initialize the session and the first round
#TODO: implement difficulty selection, determines max length of word (easy could be 4-5, medium 5-6, hard 6+ only)
@app.route('/init', methods=['POST'])
def init_game():
    session["word"] = generate_word() #generate word for the session
    session["guesses_remaining"] = 6
    session["wins"] = 0
    session["losses"] = 0

    return render_template('index.html', html_file="game_interface.html",word_length=len(session["word"]), wins=session["wins"], losses=session["losses"])

#sets up a new game still in the same session(lets user continue accruing wins and losses)
@app.route('/new_game', methods=['POST'])
def new_game():
    session["word"] = generate_word() #generate word for the session
    session["guesses_remaining"] = 6 
    #returnable_json = [session["guesses_remaining"],session["wins"],session["losses"]];
    #returnable_json = jsonify(returnable_json)
    
    return render_template('index.html', html_file="game_interface.html",word_length=len(session["word"]), wins=session["wins"], losses=session["losses"])

#client sends user's guess, check against word
@app.route('/send_guess',methods=['POST'])
def guess():
    #TODO: send guess from client, verify and send response back
    return -1

#request scoreboard
@app.route('/scoreboard')
def scoreboard():
    '''TODO: something like return render_template('index.html', html_file="score_interface.html",'
    ' score_file=local_score_file***json file goes here, declared above***)'''

    return -1 

#run localhost only
if __name__ == '__main__':
    app.run(host='127.0.0.1',port=3000,debug=True)
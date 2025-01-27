from flask import Flask, jsonify, request, render_template, send_from_directory
from flask_cors import CORS
from gamesFromMLB import *
from databaseCode import fetch_team, fetch_player, fetch_players, fetch_games, fetch_record, fetch_team_list
from fakeDB import db_elements
from chat import make_flashcards_from_selection, read_streak_file

app = Flask(__name__, static_folder='static/build', template_folder='templates')

def keyword_search(elements, search_keywords):
    matching_elements = []
    for element in elements:
        if any(keyword in element["keywords"] for keyword in search_keywords):
            matching_elements.append(element)
    return matching_elements

def read_config(file_path):
    config = {}
    try:
        with open(file_path, "r") as config_file:
            for line in config_file:
                # Strip leading/trailing whitespace and split by '='
                key, value = line.strip().split('=')
                config[key.strip()] = value.strip()
    except FileNotFoundError:
        print(f"Error: {file_path} not found.")
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
    
    return config

CORS(app)  # Enable Cross-Origin Resource Sharing for React frontend
mlb_data_dict = get_mlb_team_data(data) #gives us a dictionary request of all mlb data

@app.route('/api/mlb_team_list', methods=['GET'])
def mlb_team_list():
    data_dict = return_team_list()
    return jsonify(data_dict)

@app.route('/api/get_team_leaders')
def get_team_leaders_endpoint():
    team_name = request.args.get('teamName', 'Chicago Cubs')  # Default to 'Chicago Cubs' if no 'teamName' parameter is provided
    leaders_unrefined, standing = get_team_leaders_dict(mlb_data_dict, team_name)
    leaders_refined = get_team_leaders(leaders_unrefined)
    return jsonify({'standing': standing, 'leaders': leaders_refined})

@app.route('/api/get_five_recent_games')
def get_five_recent_games():
    team_name = request.args.get('teamName', 'Chicago Cubs')  # Default to 'Chicago Cubs' if no 'teamName' parameter is provided
    games_dict = game_history_five(mlb_data_dict, team_name, mlb_data_dict[team_name]['lastYearSchedule'])
    record = games_dict[0]
    game_history = games_dict[1:] # This is a list of five games
    return jsonify({'record': record, 'game_history': game_history})

@app.route('/api/fetch_data_from_database')
def get_data():
    parameter = request.args.get('parameter', 'Chicago Cubs')
    tableName = request.args.get('tableName', 'Teams')
    result = ""
    match tableName:
        case "Teams":
            result = fetch_team(parameter)
        case "Players Single":
            result = fetch_player(parameter)
        case "Players Many":
            result = fetch_players(parameter)
        case "Games":
            result = fetch_games(parameter, False)
        case "UpcomingGames":
            result = fetch_games(parameter, True)
        case "Records":
            result = fetch_record(parameter)

    return jsonify(result)

@app.route('/api/fetch_team_list')
def get_team_list():
    return jsonify(fetch_team_list())

@app.route('/api/keyword_search', methods=['GET'])
def search_by_keyword():
    keywords = request.args.get('keywords', "")
    keywords = keywords.split(", ")
    result = keyword_search(db_elements, keywords)

    return jsonify(result)

@app.route('/api/get_bitesize_config', methods=['GET'])
def get_bitesize_config():
    fileName = request.args.get('fileName', "")
    result = read_config(f"{fileName}.txt")

    return jsonify(result)

@app.route('/api/make_flashcards', methods=['GET'])
def make_flashcards():
    selection = request.args.getlist('selection')
    id = request.args.get('id')
    result = make_flashcards_from_selection(selection, f'{id}.json')

    return jsonify(result)

@app.route('/api/retrieve_flashcard', methods=['GET'])
def retrieve_flashcard():
    flashcard_id = request.args.get('id')
    with open(f'{id}.json', 'r') as file:
        existing_flashcards = json.load(file)

    return jsonify(existing_flashcards)

@app.route('/api/get_streak_data', methods=['GET'])
def get_streak_data():

    return jsonify(read_streak_file('learningstreak.txt'))

@app.route('/api/test_message', methods=['GET'])
def test_message():
    return jsonify({"message": "Hello from Flask!"})

if __name__ == '__main__':
    app.run(debug=True)

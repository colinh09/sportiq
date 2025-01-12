from flask import Flask, jsonify, request, render_template, send_from_directory
from flask_cors import CORS
from gamesFromMLB import *

app = Flask(__name__, static_folder='static/build', template_folder='templates')
CORS(app)  # Enable Cross-Origin Resource Sharing for React frontend
mlb_data_dict = get_mlb_team_data(data) #gives us a dictionary request of all mlb data

@app.route('/api/mlb_team_list', methods=['GET'])
def mlb_team_list():
    data_dict = return_team_list()
    return jsonify(data_dict)

@app.route('/api/get_team_leaders')
def get_team_leadera():
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

@app.route('/api/test_message', methods=['GET'])
def test_message():
    return jsonify({"message": "Hello from Flask!"})

if __name__ == '__main__':
    app.run(debug=True)

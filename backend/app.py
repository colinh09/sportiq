from flask import Flask, jsonify, request, render_template, send_from_directory
from flask_cors import CORS
from gamesFromMLB import *

app = Flask(__name__, static_folder='static/build', template_folder='templates')
CORS(app)  # Enable Cross-Origin Resource Sharing for React frontend


@app.route('/api/mlb_team_list', methods=['GET'])
def get_test_data():
    data_dict = return_team_list()
    print(f"\n\data_dict_values: {data_dict}")
    return jsonify(data_dict)

@app.route('/api/get_team_leaders')
def index():
    page = request.args.get('team-name', 'Chicago Cubs')  # Default to 'Chicago Cubs' if no 'team-name' parameter is provided
    const [leaders_unrefined, standing] = get_team_leaders_dict(dict, team-name);
    leaders_refined = get_team_leaders(leaders_unrefined)
    return jsonify({'standing': standing, 'leaders': leaders_refined})

@app.route('/api/test_message', methods=['GET'])
def get_scores():
    return jsonify({"message": "Hello from Flask!"})


if __name__ == '__main__':
    app.run(debug=True)
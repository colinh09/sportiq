from flask import Flask, jsonify, request
from flask_cors import CORS
from gamesFromMLB import *

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing for React frontend

@app.route('/api/get_mlb_scores', methods=['GET'])
def get_test_data():
    data_dict = return_team_list()
    print(f"\n\data_dict_values: {data_dict}")
    return jsonify(data_dict)

@app.route('/api/test_message', methods=['GET'])
def get_scores():
    return jsonify({"message": "Hello from Flask!"})

if __name__ == '__main__':
    app.run(debug=True)

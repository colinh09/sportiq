from flask import Flask, jsonify, request, render_template, send_from_directory
from flask_cors import CORS
from gamesFromMLB import *

app = Flask(__name__, static_folder='static/build', template_folder='templates')
CORS(app)  # Enable Cross-Origin Resource Sharing for React frontend

@app.route('/api/get_mlb_scores', methods=['GET'])
def get_test_data():
    data_dict = return_team_list()
    print(f"\n\data_dict_values: {data_dict}")
    return jsonify(data_dict)

@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('build/static', path)

@app.route('/')
def index():
    page = request.args.get('page', 'home')  # Default to 'home' if no 'page' parameter is provided
    if page == 'home':
        return render_template('home.html')
    elif page == 'about':
        return render_template('about.html')
    else:
        return render_template('index.html')

@app.route('/api/test_message', methods=['GET'])
def get_scores():
    return jsonify({"message": "Hello from Flask!"})


if __name__ == '__main__':
    app.run(debug=True)

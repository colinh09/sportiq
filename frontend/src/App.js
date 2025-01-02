import React, { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';

function App() {
    const [teams, setTeams] = useState([]);

    useEffect(() => {
        axios.get('http://127.0.0.1:5000/api/get_mlb_scores')
            .then(response => setTeams(response.data))
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    return (
        <div>
            <h1 id="top_title">The MLB Teams</h1>
            <div>
                {/* Map through the teams and render team data */}
                {teams.length > 0 ? (
                    teams.map((team, index) => (
                        <div key={index} style={{ marginBottom: '20px' }}>
                            <p class="team-names">{team.teamAbbreviation}</p> {/* Display team abbreviation     */}
                            <img src={team.Logo} alt={`${team.teamAbbreviation} logo`} style={{ width: '100px' }} /> {/* Display logo */}
                        </div>
                    ))
                ) : (
                    <p>Loading...</p>
                )}
            </div>
        </div>
    );
}

export default App;

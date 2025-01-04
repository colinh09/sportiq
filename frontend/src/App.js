import React, { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';

function App() {
    const [teams, setTeams] = useState([]);
    const [currentPage, setCurrentPage] = useState("home");

    let best_players = {};

    useEffect(() => {
        // Fetch teams data only when on the "Teams" page
        if (currentPage === "teams") {
            axios.get('http://127.0.0.1:5000/api/mlb_team_list')
                .then(response => setTeams(response.data))
                .catch(error => {
                    console.error('Error fetching data:', error);
                    setTeams([]); // Clear teams on error
                });
        }
    }, [currentPage]); // Trigger fetching when the user navigates to the "Teams" page



    const renderPageContent = () => {
        switch (currentPage) {
            case "home":
                return <h2>Welcome to SportIQ! Select a page from the navigation bar above.</h2>;
            case "teams":
                return (
                    <div id="teams-container">
                        {/* Conditionally render the teams */}
                        {teams.length > 0 ? (
                            teams.map((team, index) => (
                                <div className="team-item" key={index} style={{ marginBottom: '20px' }}>
                                    <p className="team-name">{team.displayName + " (" + team.teamAbbreviation + ")"}</p> {/* Display team abbreviation */}
                                    <img src={team.Logo} alt={`${team.teamAbbreviation} logo`} style={{ width: '100px' }} className="team-logo"/> {/* Display logo */}
                                    <h3>Important Players</h3>
                                </div>
                            ))
                        ) : (
                            <p>Loading teams...</p>
                        )}
                    </div>
                );
            case "about":
                return <p>About SportIQ: This is an app to explore MLB teams and scores.</p>;
            default:
                return <p>Page not found!</p>;
        }
    };

    return (
        <div>
            <h1 id="top-title">SportIQ</h1>

            {/* Navigation bar */}
            <nav style={{ marginBottom: '20px' }}>
                <button className="nav-button" onClick={() => setCurrentPage("home")}>
                    Home
                </button>
                <button className="nav-button" onClick={() => setCurrentPage("teams")}>
                    Teams
                </button>
                <button className="nav-button" onClick={() => setCurrentPage("about")}>
                    About
                </button>
            </nav>

            {/* Render the content based on the current page */}
            {renderPageContent()}
        </div>
    );
}

export default App;
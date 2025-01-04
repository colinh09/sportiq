import React, { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';

function App() {
    const [teams, setTeams] = useState([]);
    const [currentPage, setCurrentPage] = useState("home");

    useEffect(() => {
        // Fetch teams data only when on the "Teams" page
        if (currentPage === "teams") {
            axios.get('http://127.0.0.1:5000/api/get_mlb_scores')
                .then(response => setTeams(response.data))
                .catch(error => console.error('Error fetching data:', error));
        }
    }, [currentPage]); // Trigger fetching when the user navigates to the "Teams" page

    const renderPageContent = () => {
        switch (currentPage) {
            case "home":
                return <h2>Welcome to SportIQ! Select a page from the navigation bar above.</h2>;
            case "teams":
                return (
                    <div>
                        {/* Conditionally render the teams */}
                        {teams.length > 0 ? (
                            teams.map((team, index) => (
                                <div key={index} style={{ marginBottom: '20px' }}>
                                    <p className="team-names">{team.teamAbbreviation}</p> {/* Display team abbreviation */}
                                    <img src={team.Logo} alt={`${team.teamAbbreviation} logo`} style={{ width: '100px' }} /> {/* Display logo */}
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
            <h1 id="top_title">SportIQ</h1>

            {/* Navigation bar */}
            <nav style={{ marginBottom: '20px' }}>
                <button onClick={() => setCurrentPage("home")} style={{ marginRight: '10px' }}>
                    Home
                </button>
                <button onClick={() => setCurrentPage("teams")} style={{ marginRight: '10px' }}>
                    Teams
                </button>
                <button onClick={() => setCurrentPage("about")}>
                    About
                </button>
            </nav>

            {/* Render the content based on the current page */}
            {renderPageContent()}
        </div>
    );
}

export default App;

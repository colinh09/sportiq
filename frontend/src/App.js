import React, { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";

function App() {
  const [teams, setTeams] = useState([]);
  const [teamData, setTeamData] = useState({});
  const [currentPage, setCurrentPage] = useState("home");
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const fetchTeamsAndData = async () => {
      try {
        // Fetch teams
        const teamResponse = await axios.get("http://127.0.0.1:5000/api/mlb_team_list");
        const fetchedTeams = teamResponse.data;
        setTeams(fetchedTeams);

        // Fetch team data for each team
        const updatedTeamData = {};
        for (const team of fetchedTeams) {
          const teamLeadersResponse = await axios.get("http://127.0.0.1:5000/api/get_team_leaders", {
            params: { teamName: team.displayName },
          });
          updatedTeamData[team.displayName] = {
            standing: teamLeadersResponse.data.standing,
            bestPlayers: teamLeadersResponse.data.leaders,
          };
          //console.log(updatedTeamData[team.displayName].bestPlayers);
        }
        setTeamData(updatedTeamData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setFetchError(error.message || "Unknown error occurred");
      }
    };

    fetchTeamsAndData();
    
  }, []); // Empty dependency array ensures this runs only once on mount

  const renderPageContent = () => {
    switch (currentPage) {
      case "home":
        return <h2>Welcome to SportIQ! Select a page from the navigation bar above.</h2>;
      case "teams":
        return (
          <div id="teams-container">
            {fetchError ? (
              <p>Error: {fetchError}</p>
            ) : teams.length > 0 ? (
              teams.map((team, teamIndex) => (
                <div className="team-item" key={teamIndex} style={{ marginBottom: "20px" }}>
                  <p className="team-name">
                    {team.displayName + " (" + team.teamAbbreviation + ")"}
                  </p>
                  <img
                    src={team.Logo}
                    alt={`${team.teamAbbreviation} logo`}
                    style={{ width: "100px" }}
                    className="team-logo"
                  />
                  {teamData[team.displayName] ? (
                    <div>
                      <p>Standing: {teamData[team.displayName].standing}</p>
                      <h3>Important Players</h3>
                      {teamData[team.displayName].bestPlayers.map((player, playerIndex) => (
                        <div className="player-item" key={playerIndex}>
                          <p className="player-name">{player[0] + " (" + player[1] + ")"}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>Loading team leaders...</p>
                  )}
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
      <nav style={{ marginBottom: "20px" }}>
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
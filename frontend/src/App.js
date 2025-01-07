import React, { useEffect, useState, createContext, useContext } from "react";
import "./App.css";
import axios from "axios";

const logoUrl = '/SportIQ_Logo.jpg';

const fadeoutContext = createContext();

function Popup({ message = "error", isFading = true }) {
    return (
        <div className={`popup ${isFading ? 'fade-out' : ''}`}>
            <p>{message}</p>
        </div>
    )
}

function SelectionView({ selection = [] }) {
    return (
        <div>
            <h2>Current selection:</h2>
            <ul>
                {selection.length > 0 ? (
                    selection.map((dp, dpIndex) => (
                        <li key={dpIndex}>{dp}</li>
                    ))
                ) : (
                    <li>Nothing selected yet</li>
                )}
            </ul>
            <button>Make a course!</button>
        </div>
    )
}

function App() {
  const [teams, setTeams] = useState([]);
  const [teamData, setTeamData] = useState({});
  const [currentPage, setCurrentPage] = useState("home");
  const [specificTeamData, setSpecificTeamData] = useState({"standing": "1", "Logo": "1", "displayName": 1, "teamAbbreviation": "1", "bestPlayers": "1"});
  const [fetchError, setFetchError] = useState(null);
  const [bitesizeSelection, setBitesizeSelection] = useState([]);
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [popupMessage, setPopupMessage] = useState("error");

  function selectTeamView(curTeamData) {
    if (!curTeamData) {
      console.error("Invalid team data:", curTeamData);
      return; // Prevent navigation if data is invalid
    }
    setSpecificTeamData(curTeamData);
    setCurrentPage('specificTeam');
  }

  function showPopup(message) {
    setPopupMessage(message);
    setPopupVisible(true);
  }

  function addSelection(newData) {
    if (!bitesizeSelection.includes(newData)) {
        showPopup(`Added ${newData} to your selection!`);
        setBitesizeSelection([...bitesizeSelection, newData]);
    } else {
        showPopup(`${newData} is already in your selection!`);
    }
  }

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
            displayName: team.displayName,
            teamAbbreviation: team.teamAbbreviation,
            Logo: team.Logo
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

  useEffect(() => {
    if (isPopupVisible) {
      setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => {
          setPopupVisible(false);
          setFadeOut(false);
        }, 750);
      }, 1400);
    }
  }, [isPopupVisible]);
    
  useEffect(() => {
    setPopupVisible(false);
    setFadeOut(false);
  }, [currentPage])

  const renderPageContent = () => {
    switch (currentPage) {
      case "home":
        return (
            <div>
                <h2>Welcome to SportIQ! Select a page from the navigation bar above.</h2>
                <img src={logoUrl} alt="SportIQ_Logo" id="app-logo" />
            </div>
        );
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
                    onClick={() => selectTeamView(teamData[team.displayName])}
                  />
                  <button onClick={() => addSelection(team.displayName)} class='add-button'>Add to list</button>
                </div>
              ))
            ) : (
              <p>Loading teams...</p>
            )}
          </div>
        );
      case "specificTeam":
        return (
            <div id="team-container">
              {fetchError ? (
                <p>Error: {fetchError}</p>
              ) : (
                <div id="specific-team-item">
                <p className="team-name">
                    {specificTeamData.displayName + " (" + specificTeamData.teamAbbreviation + ")"}
                </p>
                <img
                    src={specificTeamData.Logo}
                    alt={`${specificTeamData.teamAbbreviation} logo`}
                    style={{ width: "100px" }}
                    className="team-logo"
                />
                <button onClick={() => setCurrentPage("teams")} class='back-button'>Back to teams</button>
                <p>Standing: {specificTeamData.standing}</p>
                <h3>Important Players</h3>
                <div id='player'>
                {specificTeamData.bestPlayers.map((player, playerIndex) => (
                    <div className="player-item" key={playerIndex}>
                    <p className="player-name">{player[0] + " (" + player[1] + ")"}</p>
                    <img
                        src={player[2]}
                        alt={`${player[0]} photo`}
                        style={{ width: "50px" }}
                        className="player-photo"
                    />
                    </div>
                ))}
                </div>
                </div>
              )}
            </div>
          );
      case "about":
        return <p>About SportIQ: This is an app to explore MLB teams and scores.</p>;
      case "selection":
        return <SelectionView selection={bitesizeSelection} />
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
        <button className="nav-button" onClick={() => setCurrentPage("selection")}>
          Selection
        </button>
      </nav>
      {isPopupVisible && (
        <fadeoutContext.Provider value={{ fadeOut }}>
            <Popup message={popupMessage} isFading={fadeOut}></Popup>
        </fadeoutContext.Provider>
        
      )}

      {/* Render the content based on the current page */}
      {renderPageContent()}
    </div>
  );
}

export default App;
import React, { useEffect, useState, createContext, useContext } from "react";
import "./App.css";
import axios from "axios";

const logoUrl = '/SportIQ_Logo.jpg';

const teamToAbbr = {
  "Arizona Diamondbacks": "ARI",
  "Atlanta Braves": "ATL",
  "Baltimore Orioles": "BAL",
  "Boston Red Sox": "BOS",
  "Chicago Cubs": "CHC",
  "Chicago White Sox": "CWS",
  "Cincinnati Reds": "CIN",
  "Cleveland Guardians": "CLE",
  "Colorado Rockies": "COL",
  "Detroit Tigers": "DET",
  "Houston Astros": "HOU",
  "Kansas City Royals": "KCR",
  "Los Angeles Angels": "LAA",
  "Los Angeles Dodgers": "LAD",
  "Miami Marlins": "MIA",
  "Milwaukee Brewers": "MIL",
  "Minnesota Twins": "MIN",
  "New York Mets": "NYM",
  "New York Yankees": "NYY",
  "Oakland Athletics": "OAK",
  "Philadelphia Phillies": "PHI",
  "Pittsburgh Pirates": "PIT",
  "San Diego Padres": "SDP",
  "San Francisco Giants": "SFG",
  "Seattle Mariners": "SEA",
  "St. Louis Cardinals": "STL",
  "Tampa Bay Rays": "TBR",
  "Texas Rangers": "TEX",
  "Toronto Blue Jays": "TOR",
  "Washington Nationals": "WSH"
};

const fadeoutContext = createContext();
const searchContext = createContext();
const flashcardContext = createContext();

function Popup({ message = "error", isFading = true }) {
    return (
        <div className={`popup ${isFading ? 'fade-out' : ''}`}>
            <p>{message}</p>
        </div>
    )
}

const SearchBar = () => {
  const { searchQuery, setSearchQuery } = useContext(searchContext);

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div id="search-bar">
      <input
        type="text"
        value={searchQuery}
        onChange={handleInputChange}
        placeholder="Search keywords separated by spaces"
        id="search-input"
      />
    </div>
  );
};

const FlashcardApp = ({ flashcards }) => {
  // State to track the current flashcard index and whether the definition is visible
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);

  // Function to toggle the visibility of the definition
  const toggleDefinition = () => {
    setShowDefinition(!showDefinition);
  };

  // Function to navigate to the next flashcard
  const nextFlashcard = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowDefinition(false); // Reset definition visibility when changing flashcard
    }
  };

  // Function to navigate to the previous flashcard
  const prevFlashcard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowDefinition(false); // Reset definition visibility when changing flashcard
    }
  };

  // Get the current flashcard based on the index
  const currentFlashcard = flashcards[currentIndex];

  return (
    <div className="flashcard-container">
      <h1>Flashcard: {currentFlashcard.Topic}</h1>

      <div className="flashcard">
        <h2>Concept: {currentFlashcard.Concept}</h2>
        {showDefinition && (
          <p>
            <strong>Definition:</strong> {currentFlashcard.Definition}
          </p>
        )}
        <button onClick={toggleDefinition}>
          {showDefinition ? "Hide Definition" : "Show Definition"}
        </button>
      </div>

      <div className="navigation-buttons">
        <button onClick={prevFlashcard} disabled={currentIndex === 0}>
          Previous
        </button>
        <button onClick={nextFlashcard} disabled={currentIndex === flashcards.length - 1}>
          Next
        </button>
      </div>
    </div>
  );
};


let flashcard_id_num = 1;
function SelectionView({ selection = []}) {
  const { setFlashcards, flashcards, setCurrentPage, currentPage} = useContext(flashcardContext);

  function make_course(id, selection) {
    let course = axios.get("http://127.0.0.1:5000/api/fetch_team_list", {
      params: {
        selection: ['player', 'team', 'rule'],
        id: id
      }
    })
    .then(response => {
      console.log(response.data);
    })
    .catch(error => {
      console.error(error);
    });
    setFlashcards(course.data);
    setCurrentPage("flashcards");
  };

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
            <button onClick={() => make_course(`Set ${flashcard_id_num}`, selection)}>Make a course!</button>
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
  const [fadeOut, setFadeOut] = useState(false)
  const [popupMessage, setPopupMessage] = useState("error");
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchData, setFetchData] = useState([]);
  const [showPlayers, setShowPlayers] = useState(false);
  const [streak, setStreak] = useState(0);
  const [flashcards, setFlashcards] = useState([]);

  const style = {
    backgroundColor: currentPage === "home" ? "black" : "white",
  };

  Object.assign(document.body.style, style);

  function selectTeamView(curTeamData) {
    if (!curTeamData) {
      console.error("Invalid team data:", curTeamData);
      return; // Prevent navigation if data is invalid
    }
    setSpecificTeamData(curTeamData);
    setSpecificTeamData.teamDict = {};
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

  function togglePlayers() {
    setShowPlayers(!showPlayers);
  }

  const querying = [{value: "Querying...", type: ""}];
  useEffect(() => {
    const fetchDataFunction = async () => {
      if (currentPage === "teams") {
        try {
          const api_return = await axios.get("http://127.0.0.1:5000/api/fetch_team_list");
          setTeams(api_return.data);
        } catch (error) {
          console.error("Error fetching data:", error);
          setFetchError(error.message || "Unknown error occurred");
        }
      } else if (currentPage === "specificTeam") {
        try {
          let curTeamData = {}

          const recordsFetch = await axios.get("http://127.0.0.1:5000/api/fetch_data_from_database", {
            params: {
              parameter: specificTeamData.displayName,
              tableName: "Records"
            }
          });
          curTeamData.record = recordsFetch.data[0];

          const teamLeadersFetch = await axios.get("http://127.0.0.1:5000/api/get_team_leaders", {
            params: {
              teamName: specificTeamData.displayName
            }
          });
          curTeamData.standing = teamLeadersFetch.data.standing;
          curTeamData.bestPlayers = teamLeadersFetch.data.leaders;

          const playersFetch = await axios.get("http://127.0.0.1:5000/api/fetch_data_from_database", {
            params: {
              parameter: specificTeamData.displayName,
              tableName: "Players Many"
            }
          });
          curTeamData.playerData = playersFetch.data;

          const gamesFetch = await axios.get("http://127.0.0.1:5000/api/fetch_data_from_database", {
            params: {
              parameter: specificTeamData.displayName,
              tableName: "Games"
            }
          });
          curTeamData.games = gamesFetch.data;

          const upcomingGamesFetch = await axios.get("http://127.0.0.1:5000/api/fetch_data_from_database", {
            params: {
              parameter: specificTeamData.displayName,
              tableName: "UpcomingGames"
            }
          });
          curTeamData.upcomingGames = upcomingGamesFetch.data;
          
          curTeamData.teamDict = specificTeamData;

          console.log(specificTeamData.bestPlayers);
          setSpecificTeamData(curTeamData);
        } catch (error) {
          console.error("Error fetching data:", error);
          setFetchError(error.message || "Unknown error occurred");
        }
      };
    };

    fetchDataFunction();
  }, [currentPage]);

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
    let streak_data = axios.get("http://127.0.0.1:5000/api/get_streak_data", {
      params: {
        teamName: specificTeamData.displayName
      }
    });
    setStreak(streak_data);
  }, []);
    
  useEffect(() => {
    setPopupVisible(false);
    setFadeOut(false);
  }, [currentPage]);

  function searchFunction(query) {
    setFetchData(querying); // Set to a loading state
    axios
      .get("http://127.0.0.1:5000/api/keyword_search", {
        params: {
          keywords: query,
        },
      })
      .then((response) => {
        // Update with the response data
        setFetchData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching search results:", error);
        setFetchData([]); // Optionally set an empty array or an error message
      });
  }

  const renderPageContent = () => {
    switch (currentPage) {
      case "home":
        return (
            <div>
                <h2 className="welcome">Welcome to SportIQ! Select a page from the navigation bar above.</h2>
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
                    onClick={() => selectTeamView(team)}
                  />
                  <button onClick={() => addSelection(team.displayName + " (team)")} class='add-button'>Add to list</button>
                </div>
              ))
            ) : (
              <p>Loading teams...</p>
            )}
          </div>
        );
      case "specificTeam":
        return (
          <div className="team-container">
            <button onClick={() => setCurrentPage("teams")} className="back-button">Back to teams</button>
            
            {fetchError ? (
              <p className="error-message">Error: {fetchError}</p>
            ) : specificTeamData.teamDict ? (
              <>
                <div className="team-header">
                  <img src={specificTeamData.teamDict.Logo} alt="Team Logo" className="team-logo-small" />
                  <h1 className="team-title">{`${specificTeamData.teamDict.displayName} (${specificTeamData.teamDict.teamAbbreviation})`}</h1>
                  <p className="standingP">Standing: {specificTeamData.standing}</p>
                  <p className="recordP">Record: {`${specificTeamData.record.win}-${specificTeamData.record.loss}`}</p>
                </div>
        
                <section className="important-players">
                  <h3>Important Players</h3>
                  <div className="player-grid">
                    {specificTeamData.bestPlayers.map((player, index) => (
                      <div 
                        key={index} 
                        className="player-item" 
                        onClick={() => addSelection(player[0] + " (player)")}>
                        <p className="player-name">{`${player[0]} (${player[1]})`}</p>
                        <img 
                          src={player[2]} 
                          alt={`${player[0]} photo`} 
                          className="player-photo" />
                      </div>
                    ))}
                  </div>
                </section>
                <button onClick={togglePlayers} className="toggle-players-button">
                    {showPlayers ? "Hide Players" : "Show Players"}
                  </button>
                  <section className="team-players">
                    {showPlayers && (
                      <div className="players-list">
                        {specificTeamData.playerData.map((player, index) => (
                          <div key={index} className="player-list-item" onClick={() => addSelection(player.name + " (player)")}>
                            <img src={player.headshotUrl} alt={player.name} className="player-headshot" />
                            <p className="player-name">{`${player.name} - ${player.position}`}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
        
                <section className="team-games">
                  <h2 class="games-title">Past Games</h2>
                  <ul>
                    {specificTeamData.upcomingGames.map((game, index) => (
                      <li key={index} className="game-item" style={{backgroundColor: game.won? '#4CAF50' : '#FF7043'}}  onClick={() => addSelection(game.date+": "+ teamToAbbr[game.team] +" vs "+ teamToAbbr[game.opponent] + " (game)")}>
                        {`${game.date}: ${game.team} (${game.teamScore}) vs ${game.opponent} (${game.opponentScore}) - ${game.won ? "Win" : "Loss"}`}
                      </li>
                    ))}
                  </ul>
                </section>
        
                <section className="team-upcoming-games">
                  <h2 class="games-title">Upcoming Games</h2>
                  <ul>
                    {specificTeamData.games.map((game, index) => (
                      <li key={index} className="game-item" onClick={() => addSelection(game.date+": "+ teamToAbbr[game.team] +" vs "+ teamToAbbr[game.opponent] + " (game)")}>
                        {`${game.date}: ${game.team} vs ${game.opponent}`}
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            ) : (
              <p>Loading team data...</p>
            )}
          </div>
        );
      case "search":
            return (
              <searchContext.Provider value={{ searchQuery, setSearchQuery }}>
                <div id="search-container">
                  <h1>Search For Data</h1>
                  <SearchBar/>
                  <button id="#search-button" onClick={() => searchFunction(searchQuery)}>
                    Search
                  </button>
                </div>
                {fetchData.map((item, index) => (
                  <li key={index} className="search-item" onClick={() => addSelection(`${item.value} (${item.type})`)}>
                    <h2 className="search-title">{`${item.value}`}</h2>
                  </li>
                ))}
              </searchContext.Provider>
              
            );
      case "about":
        return (
          <div>
            <p>SportIQ!</p>
          </div>
        );
      case "selection":
        return (
          <flashcardContext.Provider value={{ setFlashcards, flashcards, setCurrentPage, currentPage }}>
            <SelectionView selection={bitesizeSelection} />
          </flashcardContext.Provider>
        );
      default:
        return <p>Page not found!</p>;
      case "flashcards":
        return <FlashcardApp flashcards={flashcards} />;
    }
  };

  return (
    <div style={style} className="wrapper">
      <h1 id="top-title">SportIQ</h1>
      <div className="streak-indicator">
        Learning Streak: 1
      </div>
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
        <button className="nav-button" onClick={() => setCurrentPage("search")}>
          Search
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

/*

*/

export default App;
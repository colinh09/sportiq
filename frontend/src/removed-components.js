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

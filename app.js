const express = require("express");

const app = express();

app.use(express.json());

const sqlite = require("sqlite");

const sqlite3 = require("sqlite3");

const path = require("path");

const filePath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const dbConnection = async () => {
  try {
    db = await sqlite.open({
      filename: filePath,
      driver: sqlite3.Database,
    });
  } catch (e) {
    console.log(e.message);
  }
};

dbConnection();

app.listen(3000, () => {
  console.log("server is running");
});

const dbToResponse = (each) => {
  return {
    playerId: each.player_id,
    playerName: each.player_name,
  };
};

app.get("/players/", async (req, res) => {
  const query = `
          SELECT * FROM player_details;`;
  const response = await db.all(query);
  const resObj = response.map((each) => dbToResponse(each));
  res.send(resObj);
});

//api 2  on to get player

app.get("/players/:playerId/", async (req, res) => {
  const { playerId } = req.params;
  const query = `
           SELECT * FROM player_details
           WHERE player_id=${playerId};`;
  const response = await db.get(query);
  // const resObj = response.map((each) => dbToResponse(each));
  res.send({ playerId: response.player_id, playerName: response.player_name });
});

//api 3on put
app.put("/players/:playerId/", async (req, res) => {
  const { playerId } = req.params;
  const body = req.body;
  const { playerName } = body;
  //console.log(playerName);
  const query = `
        UPDATE player_details 
        SET
        player_name='${playerName}'
        WHERE player_id=${playerId};`;
  const response = await db.run(query);
  res.send("Player Details Updated");
});

//api call 4

app.get("/matches/:matchId/", async (req, res) => {
  const { matchId } = req.params;
  const query = `
            SELECT * FROM match_details
            WHERE match_id=${matchId};`;
  const response = await db.get(query);
  res.send({
    matchId: response.match_id,
    match: response.match,
    year: response.year,
  });
});

//api 5
const dbTores = (each) => {
  return {
    matchId: each.match_id,
    match: each.match,
    year: each.year,
  };
};

app.get("/players/:playerId/matches", async (req, res) => {
  const { playerId } = req.params;
  const query = `
        SELECT *
         FROM match_details NATURAL JOIN player_match_score 
        WHERE
         player_match_score.player_id=${playerId}`;
  const response = await db.all(query);
  //console.log(response);
  const responseObj = response.map((each) => dbTores(each));
  res.send(responseObj);
});

//api 6
app.get("/matches/:matchId/players", async (req, res) => {
  const { matchId } = req.params;
  const query = `
            SELECT *
             FROM player_details NATURAL JOIN  player_match_score 
            WHERE 
            player_match_score.match_id=${matchId};`;
  const response = await db.all(query);
  const resObj = response.map((each) => dbToResponse(each));
  res.send(resObj);
});

//api 7

app.get("/players/:playerId/playerScores", async (req, res) => {
  const { playerId } = req.params;
  const query = `
           SELECT player_details.player_id as playerId,player_details.player_name as playerName, SUM(player_match_score.score) as score, SUM(fours) as fours, SUM(sixes) as sixes 
           FROM player_details INNER JOIN player_match_score ON player_details.player_id=player_match_score.player_id
           WHERE player_details.player_id=${playerId};`;
  const response = await db.get(query);
  //console.log(response);
  res.send({
    playerId: response.playerId,
    playerName: response.playerName,
    totalScore: response["score"],
    totalFours: response["fours"],
    totalSixes: response["sixes"],
  });
});

module.exports = app;

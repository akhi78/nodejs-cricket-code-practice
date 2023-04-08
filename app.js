const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const DbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

const InitilizeDbToServer = async () => {
  try {
    db = await open({
      filename: DbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000");
    });
  } catch (e) {
    console.log(`Batabase error is ${e.message}`);
    process.exit(1);
  }
};

InitilizeDbToServer();

const Convert = (item) => {
  return {
    playerId: item.player_id,
    playerName: item.player_name,
    jerseyNumber: item.jersey_number,
    role: item.role,
  };
};

//Get the detail fo all players....

app.get("/players/", async (request, response) => {
  const Query = `SELECT * FROM cricket_team`;
  const AllPlayerDetail = await db.all(Query);
  response.send(
    AllPlayerDetail.map((eachitem) => {
      return {
        playerId: eachitem.player_id,
        playerName: eachitem.player_name,
        jerseyNumber: eachitem.jersey_number,
        role: eachitem.role,
      };
    })
  );
});

//post Method

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const Query = `INSERT INTO cricket_team (player_name,jersey_number,role)
  Values('${playerName}','${jerseyNumber}','${role}')`;
  const Dbresponse = await db.run(Query);
  response.send("Player Added to Team");
});

//get player detail from playerId
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const Query = `SELECT * FROM cricket_team WHERE player_id = '${playerId}'`;
  const GetPlayerDetail = await db.get(Query);
  response.send(Convert(GetPlayerDetail));
});

//update the value pf player in databse
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  const Query = `UPDATE cricket_team
  SET player_name='${playerName}',
  jersey_number='${jerseyNumber}',
  role='${role}'
  WHERE player_id = ${playerId}`;
  const DbResponse = await db.run(Query);
  response.send("Player Details Updated");
});

//delete api

app.delete("/players/:playerId", (request, response) => {
  const { playerId } = request.params;
  const Query = `DELETE FROM  cricket_team Where player_id=${playerId}`;
  const dbResponse = db.run(Query);
  response.send("Player Removed");
});

module.exports = app;

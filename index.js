const express = require("express");
const mongoose = require("mongoose");
const path = require('path')
const app = express();
const http = require('http')
const socketio = require('socket.io');
const { Localize } = require('./telegram/main');


const PORT = process.env.PORT || 8080;

const db_link = "mongodb://mongo:27017/first_db";
mongoose.connect(db_link, { useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true }, function (err) {
  if (err)
    console.error("Error occurred while connecting to DB!", err);
  else
    console.log("Database connection established successfully");
});


const server = http.createServer(app);
const io = socketio(server);


//set static folder
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", async (req, res) => {
  res.send('Hello World');
});


server.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});

Localize(io);

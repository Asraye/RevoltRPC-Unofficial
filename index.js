require("dotenv").config();
const { Client } = require("revolt.js");
const fetch = require("node-fetch");
const psListImport = require("ps-list");
const psList = psListImport.default || psListImport;
const fs = require("fs");
const path = require("path");
const si = require("systeminformation");

const client = new Client();
const UPDATE_INTERVAL_MS = Number(process.env.UPDATE_INTERVAL_MS);

const gamesPath = path.join(__dirname, "games.json");
const games = JSON.parse(fs.readFileSync(gamesPath, "utf-8"));

const config = {
  enableLastfm: process.env.ENABLE_LASTFM === "true",
  enableGameDetection: process.env.ENABLE_GAME_DETECTION === "true",
  defaultStatusText: process.env.DEFAULT_STATUS_TEXT || "Just chilling 😎",
  defaultPresence: process.env.DEFAULT_PRESENCE || "Online",
  emoji: {
    music: process.env.STATUS_EMOJI_MUSIC || "🎧",
    game: process.env.STATUS_EMOJI_GAME || "🎮"
  },
  lastfm: {
    username: process.env.LASTFM_USERNAME,
    apiKey: process.env.LASTFM_API_KEY
  }
};

let lastStatus = "";
let statusIndex = 0;
const statusTypes = ["Listening", "Playing"];
let currentGameExe = null;
let gameStartTime = null;

function formatElapsedTime(startTime) {
  const elapsedMs = Date.now() - startTime;
  const minutes = Math.floor(elapsedMs / 60000);
  const seconds = Math.floor((elapsedMs % 60000) / 1000);

  if (minutes > 0) {
    return `(for ${minutes}m)`;
  } else {
    return `(for ${seconds}s)`;
  }
}


async function getNowPlaying(username) {
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${config.lastfm.apiKey}&format=json&limit=1`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const track = data.recenttracks?.track?.[0];

    if (!track || track["@attr"]?.nowplaying !== "true") return null;

    const song = `${track.name} - ${track.artist["#text"]}`;
    return `${config.emoji.music}: ${song}`;
  } catch (err) {
    console.error("❌ Failed to fetch Last.fm data:", err);
    return null;
  }
}

async function detectRunningGame() {
  try {
    const processes = await psList();
    const sysInfo = await si.processes();

    for (const proc of processes) {
      const exe = proc.name.toLowerCase();

      if (exe === "code.exe") {
        const cmd = proc.cmd || "";
        const parts = cmd.split(/["\s]/).filter(p => p);
        const projectPath = parts.find(p =>
          p &&
          !p.toLowerCase().includes("code.exe") &&
          fs.existsSync(p) &&
          fs.lstatSync(p).isDirectory()
        );

        const folderName = projectPath ? path.basename(projectPath) : "Revolt Projects";
        return `💻 Creating ${folderName} on VSC`;
      }

      const matchingGame = games.find(game => game.exe.toLowerCase() === exe);
      if (matchingGame) {
        const gameProc = sysInfo.list.find(p => p.name.toLowerCase() === exe);
        if (gameProc && gameProc.started) {
          const startedTime = new Date(gameProc.started).getTime();

          if (currentGameExe !== exe) {
            currentGameExe = exe;
            gameStartTime = startedTime;
          }

          const elapsed = formatElapsedTime(gameStartTime);
          return `${config.emoji.game} Playing: ${matchingGame.name} ${elapsed}`;
        } else {
          return `${config.emoji.game} Playing: ${matchingGame.name}`;
        }
      }
    }

    currentGameExe = null;
    gameStartTime = null;
    return null;
  } catch (err) {
    console.error("❌ Error detecting running games:", err);
    return null;
  }
}

async function updateStatus() {
  let statusText = null;

  const isListening = statusTypes[statusIndex] === "Listening";
  const isPlaying = statusTypes[statusIndex] === "Playing";

  if (isListening && config.enableLastfm) {
    statusText = await getNowPlaying(config.lastfm.username);
  } else if (isPlaying && config.enableGameDetection) {
    statusText = await detectRunningGame(); 
  }

  if (!statusText) {
    statusText = config.defaultStatusText;
    currentGameExe = null;
    gameStartTime = null;
  }

  if (statusText === lastStatus) return;

  try {
    await client.api.patch("/users/@me", {
      status: {
        text: statusText,
        presence: config.defaultPresence,
      },
    });
    console.log(`✅ Status updated: ${statusText}`);
    lastStatus = statusText;
  } catch (err) {
    console.error("❌ Failed to update status:", err);
  }

  statusIndex = (statusIndex + 1) % statusTypes.length;
}


function updateStatusLoop() {
  setInterval(updateStatus, UPDATE_INTERVAL_MS);
}


client.once("ready", async () => {
  console.log(`✅ Logged in as ${client.user.username}`);
  await updateStatus();
  updateStatusLoop();
});

client.loginBot({ token: process.env.USER_TOKEN });

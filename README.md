# RevoltRPC-Unofficial

A status updater for Revolt using Last.fm scrobbling and game detection to dynamically update your status with music or game info, similar to Discord's RPC system

---

## Support

If you need help or want to discuss features, join our [Support Server](https://rvlt.gg/eB6J6rve) for assistance and community support.

---

## Features

- Automatically update your Revolt status with currently playing Last.fm track.
- Detect currently running games and update status accordingly.
- Fallback to default custom status when no music or game detected.
- Customizable update interval and emojis.
- Supports Windows/Linux/macOS via Node.js.
- Configured entirely via `.env` file.

---

## Installation

1. **Clone the repository:**

```bash
git clone https://github.com/yourusername/RevoltRPC-Unofficial.git
cd RevoltRPC-Unofficial
```

2. **Install dependencies:**

```bash
npm install
```

3. **Create and configure `.env` file:**

Copy `example.env` to `.env` and fill in your tokens and preferences.

---

## Configuration

The script reads config from environment variables defined in `.env`.  
Here's a summary of configurable options:

| Variable               | Description                                    | Default                 |
| ---------------------- | ---------------------------------------------- | ----------------------- |
| `USER_TOKEN`           | Your Revolt user token (required)              | —                       |
| `LASTFM_API_KEY`       | Last.fm API key for scrobbling (optional)      | —                       |
| `LASTFM_USERNAME`      | Your Last.fm username (optional)                | —                       |
| `UPDATE_INTERVAL_MS`   | Interval to update status (in milliseconds)    | 30000 (30 seconds)      |
| `ENABLE_LASTFM`        | Enable Last.fm listening status                 | true                    |
| `ENABLE_GAME_DETECTION`| Enable game detection for status                | true                    |
| `DEFAULT_STATUS_TEXT`  | Fallback status text                             | `Using RevoltRPC-Unofficial 😎`       |
| `DEFAULT_PRESENCE`     | Presence to show (`Online`, `Idle`, `Focus`, etc.)       | `Online`                |
| `STATUS_EMOJI_MUSIC`   | Emoji for music status                    | 🎧                      |
| `STATUS_EMOJI_GAME`    | Emoji for game status                     | 🎮                      |

> **⚠️ Important:**  
> Do **not** set `UPDATE_INTERVAL_MS` too low (EX; below 10 seconds) to avoid spamming the API and risking rate limits or bans. A recommended minimum is 30,000 ms (30 seconds)

---

## Usage

### Running the bot

Run the bot with:

```bash
npm start
```

Or in development mode (auto-restarts on code changes):

```bash
npm run dev
```

---

## How it works

- On startup, the bot logs in using your Revolt token.
- It every 30s attempts to:
  - Fetch your currently playing track from Last.fm.
  - Detect any running games from a predefined games list. (Contributes are appreciated and encouraged to grow our supported game list)
- It updates your Revolt status with either:
  - Now playing music (if enabled and available).
  - Currently running game (if enabled and detected).
  - Default fallback status text.

---

## File Structure

```
RevoltRPC-Unofficial/
├── index.js            # Main script
├── games.json          # List of supported games for detection
├── example.env         # Example environment variables
├── package.json        # Project config and dependencies
└── README.md           # This documentation
```

---

## Adding/Editing Games for Detection

The `games.json` file contains a list of games with their executable names to detect running games.  
Add your own games by editing this file:

```json
 { "exe": "Among Us.exe", "name": "Among Us" },
{ "exe": "Fallout4.exe", "name": "Fallout 4" },
```

Contributions are **actively encouraged**!  
Please feel free to submit a [Pull Request](https://github.com/Asraye/RevoltRPC-Unofficial/pulls) or open an [Issue](https://github.com/Asraye/RevoltRPC-Unofficial/issues) to help improve the game list!

---

### Getting Your Revolt User Token

To get your user token from the browser:

1. Open [Revolt](https://app.revolt.chat) in your browser.
2. Press <kbd>F12</kbd> to open Developer Tools (or right-click → Inspect).
3. Go to the **Console** tab.
4. Paste and run the following code:

    ```js
    window.state.auth.sessions.get(controllers.client.getReadyClient().user._id).session.token
    ```

5. Copy the output string — this is your user token.

⚠️ **Never share this token** 

---

## Troubleshooting

- **Status does not update?**  
  Ensure your `USER_TOKEN` is correct and active.

- **Last.fm data not showing?**  
  Verify your `LASTFM_API_KEY` and `LASTFM_USERNAME` are correct.

- **Game detection not working?**  
  Add your game's executable to `games.json` and confirm the app has permissions to list processes.

- **Errors during startup?**  
  Check the console logs for errors and ensure all dependencies are installed.

- **Check Node Version**  
  The only tested node version for this project is `v22.15.0`

---

## Contributing

Contributions, bug reports, and feature requests are welcome!  
Feel free to open an issue or submit a pull request.

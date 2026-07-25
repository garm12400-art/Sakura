/**
 * @author NTKhang
 * Official source: https://github.com/ntkhang03/Goat-Bot-V2
 */

const { spawn } = require("child_process");
const express = require("express");
const log = require("./logger/log.js");

const app = express();
const PORT = process.env.PORT || 1000;

// Host / Uptime Checkers er jonno simple route
app.get("/", (req, res) => {
    res.send("Bot is alive and running!");
});

// Port open implementation to pass Port Scanning
app.listen(PORT, () => {
    log.info("INDEX", `Express server is listening on port: ${PORT}`);
});

function startProject() {
    const child = spawn("node", ["Sakura.js"], {
        cwd: __dirname,
        stdio: "inherit",
        shell: true,
        env: { ...process.env, PORT: PORT }
    });

    child.on("close", (code) => {
        if (code === 2) {
            log.info("Restarting Project...");
            startProject();
        } else if (code !== 0) {
            log.err("INDEX", `Process exited with code ${code}. Restarting in 3 seconds...`);
            setTimeout(startProject, 3000);
        }
    });

    child.on("error", (err) => {
        log.err("INDEX", "Failed to start Sakura.js", err);
    });
}

startProject();

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "dfw",
    aliases: ["downloadcmd", "installcmd"],
    version: "1.0.0",
    author: "Mr.King 🎭",
    countDown: 5,
    role: 1, // শুধুমাত্র বট অ্যাডমিনরা ব্যবহার করতে পারবে
    category: "admin",
    shortDescription: { en: "Download and install scripts directly from the server" },
    guide: { en: "{pn} <script_name.js>" }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    if (args.length === 0) {
      return api.sendMessage("⚠️ Please provide a script name! Example: /dfw check.js", threadID, messageID);
    }

    let scriptName = args[0];
    if (!scriptName.includes(".")) {
      scriptName += ".js";
    }

    const BASE_URL = "https://script-rmy3.onrender.com";
    const scriptUrl = `${BASE_URL}/scripts/${scriptName}`;
    const targetPath = path.join(__dirname, scriptName); // সরাসরি কারেন্ট কমান্ডস ফোল্ডারে সেভ হবে

    const loadingMsg = await api.sendMessage(`⏳ Connecting to server to install '${scriptName}'...`, threadID, messageID);

    try {
      const response = await axios.get(scriptUrl);
      const rawCode = response.data;

      if (!rawCode || rawCode.includes("404: Script not found")) {
        api.unsendMessage(loadingMsg.messageID);
        return api.sendMessage(`❌ Script '${scriptName}' was not found on the server!`, threadID, messageID);
      }

      // ফাইল সিস্টেমে স্ক্রিপ্টটি সেভ করা
      await fs.ensureDir(path.dirname(targetPath));
      fs.writeFileSync(targetPath, rawCode, "utf8");

      api.unsendMessage(loadingMsg.messageID);

      const successCard = 
        `╭───〔 𝗜𝗡𝗦𝗧𝗔𝗟𝗟 𝗦𝗨𝗖𝗖𝗘𝗦𝗦 〕──⬣\n` +
        `│ ⚙️ Script : ${scriptName}\n` +
        `│ 📁 Path   : scripts/cmds/${scriptName}\n` +
        `│ 📥 Status : Installed Successfully\n` +
        `╰────────────────⬣\n` +
        `𝐌𝐚𝐝𝐞 𝐰𝐢𝐭𝐡 🤍 𝐛𝐲 --𝔐𝔯.𝔎𝔦𝔫𝔤`;

      return api.sendMessage(successCard, threadID, messageID);

    } catch (error) {
      console.error("DFW Error:", error);
      api.unsendMessage(loadingMsg.messageID);
      return api.sendMessage(`🔴 Installation failed! Server might be offline.`, threadID, messageID);
    }
  }
};

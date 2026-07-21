const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "dfw",
    aliases: ["installcmd", "loadweb"],
    version: "1.1.0",
    author: "Mr.King ",
    countDown: 5,
    role: 1, // শুধুমাত্র বট অ্যাডমিনদের জন্য
    category: "admin",
    shortDescription: { en: "Download and overwrite/install scripts live from web server" },
    guide: { en: "{pn} <script_name.js>" }
  },

  onStart: async function ({ api, event, args, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang }) {
    const { threadID, messageID } = event;

    if (args.length === 0) {
      return api.sendMessage("⚠️ Please provide a script name! Example: /dfw check.js", threadID, messageID);
    }

    let scriptName = args[0];
    if (!scriptName.endsWith(".js")) {
      scriptName += ".js";
    }

    const fileName = scriptName.slice(0, -3); // .js এক্সটেনশন ছাড়া ফাইলের নাম
    const BASE_URL = "https://script-rmy3.onrender.com";
    const scriptUrl = `${BASE_URL}/scripts/${scriptName}`;

    const loadingMsg = await api.sendMessage(`⏳ Downloading and installing '${scriptName}'...`, threadID, messageID);

    try {
      // ১. সার্ভার থেকে র কোড ডাউনলোড
      const response = await axios.get(scriptUrl);
      const rawCode = response.data;

      if (!rawCode || (typeof rawCode === "string" && rawCode.includes("404: Script not found"))) {
        api.unsendMessage(loadingMsg.messageID);
        return api.sendMessage(`❌ Script '${scriptName}' was not found on the server!`, threadID, messageID);
      }

      // ২. GoatBot-এর গ্লোবাল ইউটিলস থেকে লোডার মেথড সংগ্রহ
      const { loadScripts, log } = global.utils;
      const { configCommands } = global.GoatBot;

      // ৩. লোড/ওভাররাইট মেকানিজম রান করা (rawCode দিয়ে ফাইল ওভাররাইট ও মেমোরি রিলোড করে)
      const infoLoad = loadScripts(
        "cmds",
        fileName,
        log,
        configCommands,
        api,
        threadModel,
        userModel,
        dashBoardModel,
        globalModel,
        threadsData,
        usersData,
        dashBoardData,
        globalData,
        getLang,
        rawCode
      );

      api.unsendMessage(loadingMsg.messageID);

      if (infoLoad.status === "success") {
        const successCard = 
          `╭───〔 𝗜𝗡𝗦𝗧𝗔𝗟𝗟 𝗦𝗨𝗖𝗖𝗘𝗦𝗦 〕──⬣\n` +
          `│ ⚙️ Script : ${scriptName}\n` +
          `│ 🔄 Mode   : Overwritten & Reloaded\n` +
          `│ 📥 Status : Installed Successfully\n` +
          `╰────────────────⬣\n` +
          `𝐌𝐚𝐝𝐞 𝐰𝐢𝐭𝐡 🤍 𝐛𝐲 --𝔐𝔯.𝔎𝔦𝔫𝔤`;

        return api.sendMessage(successCard, threadID, messageID);
      } else {
        return api.sendMessage(
          `❌ Failed to load script "${fileName}":\n${infoLoad.error.name}: ${infoLoad.error.message}`,
          threadID,
          messageID
        );
      }

    } catch (error) {
      console.error("DFW Error:", error);
      api.unsendMessage(loadingMsg.messageID);
      return api.sendMessage(`🔴 Request failed! Server is offline or URL is invalid.`, threadID, messageID);
    }
  }
};

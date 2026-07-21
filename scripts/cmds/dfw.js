module.exports = {
  config: {
    name: "dfw",
    aliases: ["downloadfrommweb"],
    version: "1.2.0",
    author: "Mr.King ",
    countDown: 3,
    role: 1, // শুধুমাত্র বট অ্যাডমিনদের জন্য
    category: "utility",
    shortDescription: { en: "Get the direct download link of a script from the website" },
    guide: { en: "{pn} <script_name.js>" }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    if (args.length === 0) {
      return api.sendMessage("⚠️ Please provide a script name! Example: /dfw check.js", threadID, messageID);
    }

    let scriptName = args[0];
    if (!scriptName.endsWith(".js")) {
      scriptName += ".js";
    }

    const BASE_URL = "https://script-rmy3.onrender.com";
    const scriptUrl = `${BASE_URL}/scripts/${scriptName}`;

    const replyMsg = 
      `╭───〔 𝗦𝗖𝗥𝗜𝗣𝗧 𝗟𝗜𝗡𝗞 〕──⬣\n` +
      `│ ⚙️ Script : ${scriptName}\n` +
      `│ 🌐 Link   : ${scriptUrl}\n` +
      `╰────────────────⬣\n` +
      `💡 Click or copy the link to download manually.`;

    return api.sendMessage(replyMsg, threadID, messageID);
  }
};

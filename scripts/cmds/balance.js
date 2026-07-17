// Banner Image: https://files.catbox.moe/ixj7u8.jpg

module.exports = {
  config: {
    name: "balance",
    aliases: ["bal", "money"],
    version: "1.1.0",
    author: "Mr.King 🎭",
    countDown: 5,
    role: 0,
    category: "economy",
    shortDescription: { en: "Check wallet balance with compact format" },
    guide: { en: "{pn} | {pn} @mention | reply to a message" }
  },

  onStart: async function ({ api, event, usersData }) {
    const { threadID, messageID, mentions, messageReply, senderID } = event;

    let targetID = senderID;

    if (messageReply) {
      targetID = messageReply.senderID;
    } else if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    }

    try {
      const userData = await usersData.get(targetID);
      const name = userData.name || "User";
      const rawBalance = userData.money || 0;

      // K, M, B, T ফরম্যাটে কনভার্ট করার লজিক
      function formatEconomy(num) {
        if (num >= 1e12) return (num / 1e12).toFixed(1).replace(/\.0$/, "") + "T";
        if (num >= 1e9) return (num / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
        if (num >= 1e6) return (num / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
        if (num >= 1e3) return (num / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
        return num.toString();
      }

      const formattedBalance = formatEconomy(rawBalance);

      const infoCard = 
        `💰 𝗕𝗔𝗟𝗔𝗡𝗖𝗘 𝗜𝗡𝗙𝗢\n` +
        `╭────────────────⬣\n` +
        `│ 👤 𝗡𝗮𝗺𝗲 : ${name}\n` +
        `│ 💳 𝗪𝗮𝗹𝗹𝗲𝘁 : ${formattedBalance} coins\n` +
        `│ 📊 𝗦𝘁𝗮𝘁𝘂𝘀 : Verified User\n` +
        `╰────────────────⬣\n` +
        `𝐌𝐚𝐝𝐞 𝐰𝐢𝐭𝐡 🤍 𝐛𝐲 --𝔐𝔯.𝔎𝔦𝔫𝔤`;

      return api.sendMessage(infoCard, threadID, messageID);
    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ Error fetching balance from database.", threadID, messageID);
    }
  }
};

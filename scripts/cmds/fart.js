// This script is for custom Messenger Bots (Mirai/Goatbot/Xva style)
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "fart",
    aliases: ["pad", "padmar"],
    version: "1.0.0",
    author: "Custom Bot",
    countDown: 5,
    role: 0,
    category: "fun",
    guide: {
      en: "Tag someone to fart on their face!"
    }
  },

  onStart: async function ({ api, event, message, usersData }) {
    const { threadID, messageID, senderID, mentions } = event;
    
    const mentionIDs = Object.keys(mentions);
    if (mentionIDs.length === 0) {
      return message.reply("⚠️ আরে ভাই, কার মুখে পাদ মারবেন তাকে তো মেনশন করবেন! (যেমন: {pn} @name)");
    }

    const victimID = mentionIDs[0];
    if (victimID === senderID) {
      return message.reply("⚠️ নিজের বাতাসে নিজে অজ্ঞান হতে চান? সুবহানাল্লাহ! 😹");
    }

    try {
      const attackerData = await usersData.get(senderID);
      const victimData = await usersData.get(victimID);
      
      const attackerName = attackerData.name || "Attacker";
      const victimName = victimData.name || "Victim";

      // Super Funny Fart Scenarios
      const fartStories = [
        `😷 ${attackerName} আচমকা ঘুরে দাঁড়িয়ে ${victimName} এর মুখের ওপর এক বিকট পাদ মেরে দিয়েছে!\n\n🔬 𝐓𝐨𝐱𝐢𝐜 𝐑𝐞𝐩𝐨𝐫𝐭: পাদের তীব্রতা ছিল রিখটার স্কেলে ৭.৫! বাতাসের বিষাক্ত গ্যাসের কারণে ${victimName} সাময়িকভাবে জ্ঞান হারিয়েছে এবং গ্রুপের বাকি মেম্বাররা মাস্ক পরা শুরু করেছে। 💀`,
        
        `🚀 ${attackerName} এত জোরে ${victimName}-এর দিকে তাক করে পাদ দিয়েছে যে, সেই প্রেসারে ${victimName} সোজা চাঁদে গিয়ে ল্যান্ড করেছে! NASA এখন তাকে উদ্ধারের চেষ্টা চালাচ্ছে। 🌙`,
        
        `🤢 ${attackerName} একটি সাইলেন্ট কিন্তু ডেডলি (পাইলট) পাদ মেরেছে ${victimName}-এর সামনে!\n\n👃 𝐒𝐦𝐞𝐥𝐥 𝐓𝐞𝐬𝐭: গন্ধ এতই ভয়ানক যে ${victimName}-এর ফোনের ডিসপ্লে ফেটে গেছে এবং সে আইসিইউতে ভর্তি হওয়ার প্রস্তুতি নিচ্ছে। 🏥`,
        
        `🔊 ${attackerName} জনসমক্ষে একটি হাইড্রোজেন পাদের বিস্ফোরণ ঘটিয়েছে ${victimName}-এর কান ঘেঁষে!\n\n📢 𝐍𝐨𝐢𝐬𝐞 𝐋𝐞𝐯𝐞𝐥: বিকট শব্দে এলাকার ৩টি ট্রান্সফর্মার ফেটে গেছে এবং ${victimName} এখন কানে শুধু ভোঁ-ভোঁ শব্দ শুনছে! 🧏‍♂️`
      ];

      const randomFart = fartStories[Math.floor(Math.random() * fartStories.length)];

      const finalMessage = `💨 𝐅𝐀𝐑𝐓 𝐀𝐓𝐓𝐀𝐂𝐊!!! 💨\n\n` + randomFart;

      return message.reply(finalMessage);

    } catch (err) {
      console.error(err);
      return message.reply("⚠️ পাদের গ্যাসে সিস্টেম ক্র্যাশ করেছে! আবার চেষ্টা করুন।");
    }
  }
};
        

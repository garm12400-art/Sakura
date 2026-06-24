module.exports = {
  config: {
    name: "rps",
    aliases: ["battle", "khelbo"],
    version: "3.5.0",
    author: "Mr.King",
    countDown: 3,
    role: 0,
    shortDescription: { en: "Play RPS with Extreme Roasting" },
    category: "game",
    guide: { en: "{pn} rock/paper/scissor" }
  },

  onStart: async function ({ api, event, message, args }) {
    const { threadID, messageID, senderID } = event;

    if (args.length === 0) {
      return message.reply("⚔️ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐜𝐡𝐨𝐨𝐬𝐞: 𝐫𝐨𝐜𝐤, 𝐩𝐚𝐩𝐞𝐫, 𝐨𝐫 𝐬𝐜𝐢𝐬𝐬𝐨𝐫!\nExample: /rps rock");
    }

    const userChoice = args[0].toLowerCase();
    const choices = ["rock", "paper", "scissor"];
    const icons = { rock: "✊", paper: "✋", scissor: "✂️" };

    if (!choices.includes(userChoice)) {
      return message.reply("🚫 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐜𝐡𝐨𝐢𝐜𝐞! 𝐔𝐬𝐞: 𝐫𝐨𝐜𝐤, 𝐩𝐚𝐩𝐞𝐫, 𝐨𝐫 𝐬𝐜𝐢𝐬𝐬𝐨𝐫");
    }

    try {
      api.setMessageReaction("⚔️", messageID, () => {}, true);
      const botChoice = choices[Math.floor(Math.random() * choices.length)];
      
      let result = "";
      let roast = "";

      if (userChoice === botChoice) {
        result = "🤝 𝐈𝐓'𝐒 𝐀 𝐓𝐈𝐄!";
        roast = "ভাগ্য ভালো যে ড্র হয়েছে, নয়তো আজ তোর ইজ্জতের ফালুদা বানিয়ে দিতাম! 😒";
      } else if (
        (userChoice === "rock" && botChoice === "scissor") ||
        (userChoice === "paper" && botChoice === "rock") ||
        (userChoice === "scissor" && botChoice === "paper")
      ) {
        result = "🏆 𝐘𝐎𝐔 𝐖𝐈𝐍!";
        const winMsgs = [
          "হঠাৎ করে অন্ধের যষ্টির মতো জিতে গেছিস, এটা তোর যোগ্যতা না! 😎🔥",
          "উঁইপোকাও মাঝে মাঝে বাঘের সাথে জিতে যায়, আজ তোর কপালটাই তেমন! 🐯🤣",
          "জিতে খুব ভাব নিচ্ছিস? যা এক প্যাকেট বিরিয়ানি খাইয়ে আয় সবাইকে! 🍛😎"
        ];
        roast = winMsgs[Math.floor(Math.random() * winMsgs.length)];
      } else {
        result = "💀 𝐘𝐎𝐔 𝐋𝐎𝐒𝐄!";
        const roastList = [
          "তোর বুদ্ধির যা হাল, এর চেয়ে আয়নার সামনে দাঁড়িয়ে নিজের গালে ৩টা থাপ্পড় দে! 🤡👏",
          "তোর মতো আবালকে হারানোর জন্য আমার একটা সার্কিটই যথেষ্ট, পুরো সিস্টেম লাগে না! 🧠🤣",
          "তোর ইজ্জত তো এখন ডাস্টবিনের পচা আলুর চেয়েও সস্তা হয়ে গেছে! 🥔💀",
          "তোর মতো বলদ এই গ্রুপে আছে কেন? যা গিয়ে হিরো আলমের সাথে লুডু খেল গে! 🕺😂",
          "তোর হার দেখে আমার প্রসেসর পর্যন্ত হাসতে হাসতে হ্যাং হয়ে যাচ্ছে! 💻🤣",
          "তোর দ্বারা চ্যাটিং হবে না, তুই গিয়ে বাজারে গিয়ে পচা মাছের দরদাম কর! 🐟🤡",
          "তোর যা কপাল, তুই যদি পানিতে নামিস তবে মাছেরা তোকে দেখে হাসবে! 🐠🤣",
          "তোর লজ্জা থাকলে আজ আর ইনবক্সে মুখ দেখাতিনা! 🙈😂",
          "তোর লেভেল আর আমার লেভেলের মধ্যে আকাশ পাতাল তফাৎ, ফাউল চ্যাটার! ⚔️🔥",
          "তোর আইকিউ (IQ) নাকি মাইনাস ১০০? খেলা দেখে তাই মনে হচ্ছে! 📉🤡"
        ];
        roast = roastList[Math.floor(Math.random() * roastList.length)];
      }

      const report = `⚔️ 𝐁𝐀𝐓𝐓𝐋𝐄 𝐑𝐄𝐒𝐔𝐋𝐓 ⚔️\n\n` +
                     `👤 𝐘𝐨𝐮: ${icons[userChoice]} (${userChoice.toUpperCase()})\n` +
                     `🤖 𝐁𝐨𝐭: ${icons[botChoice]} (${botChoice.toUpperCase()})\n\n` +
                     `📊 𝐎𝐮𝐭𝐜𝐨𝐦𝐞: ${result}\n` +
                     `🔥 𝐌𝐞𝐬𝐬𝐚𝐠𝐞: ${roast}\n\n` +
                     `🦭 𝐆𝐚𝐦𝐞 𝐁𝐲: 𝐌𝐫.𝐊𝐢𝐧𝐠 𝐄𝐧𝐭𝐞𝐫𝐭𝐚𝐢𝐧𝐦𝐞𝐧𝐭 🕊️💖\n\n`;

      return message.reply(report);

    } catch (err) {
      return message.reply("⚠️ 𝐁𝐚𝐭𝐭𝐥𝐞 𝐅𝐢𝐞𝐥𝐝 𝐢𝐬 𝐛𝐮𝐬𝐲! 🛠️🤣");
    }
  }
};
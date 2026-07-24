module.exports = {
  config: {
    name: "send",
    aliases: ["pay", "give"],
    version: "1.0.1",
    author: "𝔐𝔯.𝔎𝔦𝔫𝔤",
    countDown: 5,
    role: 0,
    category: "economy",
    shortDescription: { en: "Send coins to another user using mention or reply" },
    guide: { en: "{pn} @mention [amount] OR reply to a message with {pn} [amount]" }
  },

  onStart: async function ({ api, event, args, usersData }) {
    const { threadID, messageID, senderID, type, messageReply } = event;

    let receiverID = null;
    let amountStr = "";

    // ১. রিপ্লাই পদ্ধতির মাধ্যমে আইডি এবং অ্যামাউন্ট চেক
    if (type === "message_reply") {
      receiverID = messageReply.senderID;
      amountStr = args[0];
    } 
    // ২. মেনশন পদ্ধতির মাধ্যমে আইডি এবং অ্যামাউন্ট চেক
    else if (Object.keys(event.mentions).length > 0) {
      receiverID = Object.keys(event.mentions)[0];
      amountStr = args.join(" ").replace(/@[^ ]+/g, "").trim();
    }

    // ভ্যালিডেশন চেক
    if (!receiverID) {
      return api.sendMessage("❌ Please mention a user or reply to their message to send coins.", threadID, messageID);
    }

    if (!amountStr) {
      return api.sendMessage("❌ Please specify the amount of coins you want to send.", threadID, messageID);
    }

    if (receiverID === senderID) {
      return api.sendMessage("❌ You cannot send coins to yourself!", threadID, messageID);
    }

    // K, M, B, T কে সংখ্যায় রূপান্তর করা
    const parsedAmount = parseShortAmount(amountStr);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return api.sendMessage("❌ Invalid amount! Please enter a valid positive number.", threadID, messageID);
    }

    try {
      // ইউজার ডাটা অবজেক্ট সংগ্রহ
      const senderData = await usersData.get(senderID);
      const receiverData = await usersData.get(receiverID);

      const senderBalance = senderData.money || 0;

      if (senderBalance < parsedAmount) {
        return api.sendMessage(`❌ You do not have enough coins! Your current balance is ${formatNumber(senderBalance)} coins.`, threadID, messageID);
      }

      // ব্যালেন্স আপডেট ও ডাটাবেজে সেভ করা (Fixed Methods)
      senderData.money = senderBalance - parsedAmount;
      receiverData.money = (receiverData.money || 0) + parsedAmount;

      await usersData.set(senderID, senderData);
      await usersData.set(receiverID, receiverData);

      // প্রোফাইল নাম সংগ্রহ
      const senderName = senderData.name || "Sender";
      const receiverName = receiverData.name || "Receiver";

      // ১০ নম্বর স্টাইল অনুযায়ী আউটপুট মেসেজ তৈরি
      const msg = `🌿 𝖲𝖾𝗇𝖽𝗂𝗇𝖫𝗈𝗀 — 𝖲𝗎𝖼𝖼𝖾𝔰𝔰\n` +
                  `╭🌱━━━━━━━━━━━━━━━╮\n` +
                  ` 🍃 Sender : ${senderName}\n` +
                  ` 🍃 Receiver : ${receiverName}\n` +
                  ` 🍃 Total : ${formatNumber(parsedAmount)} coins\n` +
                  `╰━━━━━━━━━━━━━━━🌱╯\n` +
                  `Enjoy your balance! 🐸✨`;

      return api.sendMessage(msg, threadID, messageID);

    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ An error occurred while processing the transaction.", threadID, messageID);
    }
  }
};

// K, M, B, T কনভার্ট করার ইন্টারনাল ফাংশন
function parseShortAmount(str) {
  const cleanStr = str.toLowerCase().trim();
  const matches = cleanStr.match(/^([0-9.]+)\s*([kmbt]?)$/);
  
  if (!matches) return NaN;
  
  const value = parseFloat(matches[1]);
  const suffix = matches[2];
  
  switch (suffix) {
    case "k": return value * 1000;
    case "m": return value * 1000000;
    case "b": return value * 1000000000;
    case "t": return value * 1000000000000;
    default: return value;
  }
}

// সংখ্যা সুন্দরভাবে দেখানোর ফাংশন
function formatNumber(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(1).replace(/\.0$/, "") + "T";
  if (num >= 1e9) return (num / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toString();
}

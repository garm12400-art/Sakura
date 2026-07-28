const axios = require("axios");

const baseApiUrl = "https://baby-1-tf9x.onrender.com";
const ADMIN_CREDENTIALS = {
  username: "Mr.king",
  password: "nomnomnom009"
};

const activeTeachSessions = new Map();

// Auto-delete message helper
const sendAutoDeleteMsg = (api, threadID, text, replyToID) => {
  api.sendMessage(text, threadID, (err, info) => {
    if (!err && info) {
      setTimeout(() => {
        api.unsendMessage(info.messageID).catch(() => {});
      }, 15000);
    }
  }, replyToID);
};

// Fetch random trigger from DB and prompt user
const sendNextPromptFromDB = async (api, threadID, userID, messageID) => {
  try {
    const res = await axios.get(`${baseApiUrl}/api/jan/random-trigger`);
    const randomTrigger = res.data && res.data.trigger ? res.data.trigger : "babu";
    
    const msgText = `╭┈─────── ೄྀ࿐ ˊˎ-\n┊ 👑 𝗠𝗶𝘀𝘀-𝗤𝘂𝗲𝗲𝗻 : ${randomTrigger}\n┊ 💌 What reply should I send?\n╰─────────────── 🚀`;

    api.sendMessage(msgText, threadID, (err, info) => {
      if (!err && info) {
        activeTeachSessions.set(userID, {
          currentTrigger: randomTrigger,
          promptMessageID: info.messageID
        });

        global.GoatBot.onReply.set(info.messageID, {
          commandName: "teach",
          type: "interactive_teach",
          messageID: info.messageID,
          author: userID,
          trigger: randomTrigger
        });
      }
    }, messageID);
  } catch (err) {
    sendAutoDeleteMsg(api, threadID, "❌ Failed to load triggers from database!", messageID);
  }
};

module.exports.config = {
  name: "teach",
  aliases: ["addmsg"],
  version: "4.5",
  author: "Mr.King",
  role: 0,
  category: "utility",
  guide: {
    en: "{pn} -c | {pn} -on | {pn} -off | {pn} -show [trigger]"
  }
};

module.exports.onStart = async ({ api, event, args, usersData, role }) => {
  const senderID = event.senderID;

  // 🔍 -show দিয়ে ডাটাবেজের উত্তর চেক করা
  if (args[0] === "-show") {
    const queryText = args.slice(1).join(" ").trim();
    if (!queryText) {
      return sendAutoDeleteMsg(api, event.threadID, "⚠️ Please provide a text to check!\nExample: teach -show kemon aso", event.messageID);
    }

    try {
      const res = await axios.post(`${baseApiUrl}/api/hinata`, { text: queryText });
      
      // ব্যাকএন্ডে রিকুয়েস্ট পাঠিয়ে ডাটা আনা
      if (res.data && res.data.message) {
        if (res.data.message === "sikai deu 🥺") {
          return sendAutoDeleteMsg(api, event.threadID, `❌ No responses found for: "${queryText}"`, event.messageID);
        }

        const replyMsg = `╭┈─────── ೄྀ࿐ ˊˎ-\n┊ 👑 𝗧𝗿𝗶𝗴𝗴𝗲𝗿 : ${queryText}\n┊ 💬 𝗥𝗲𝘀𝗽𝗼𝗻𝘀𝗲 : ${res.data.message}\n╰─────────────── 🚀`;
        return sendAutoDeleteMsg(api, event.threadID, replyMsg, event.messageID);
      }
    } catch (err) {
      return sendAutoDeleteMsg(api, event.threadID, "❌ Error checking responses from server!", event.messageID);
    }
  }

  // DB Status Check
  if (args[0] === "-c") {
    try {
      const res = await axios.get(`${baseApiUrl}/api/jan/list`);
      if (res.data) {
        return sendAutoDeleteMsg(api, event.threadID, `✅ Database Connected!\n${res.data.message}`, event.messageID);
      }
      return sendAutoDeleteMsg(api, event.threadID, "❌ Database connection check failed!", event.messageID);
    } catch {
      return sendAutoDeleteMsg(api, event.threadID, "❌ Cannot connect to Database Server!", event.messageID);
    }
  }

  // VIP Check
  const user = await usersData.get(senderID);
  const vipData = user?.data?.vip;
  const isVip = vipData?.expires && vipData.expires > Date.now();
  const isAdmin = role >= 2;

  if (!isVip && !isAdmin) {
    return sendAutoDeleteMsg(api, event.threadID, "❌ | Only VIP users can use this command!", event.messageID);
  }

  if (args[0] === "-off") {
    if (activeTeachSessions.has(senderID)) {
      activeTeachSessions.delete(senderID);
      return sendAutoDeleteMsg(api, event.threadID, "🛑 Interactive Teach Mode Stopped!", event.messageID);
    }
    return sendAutoDeleteMsg(api, event.threadID, "⚠️ Teach Mode is not active right now.", event.messageID);
  }

  if (args[0] === "-on") {
    sendAutoDeleteMsg(api, event.threadID, "🚀 Interactive Teach Mode ON!", event.messageID);
    return await sendNextPromptFromDB(api, event.threadID, senderID, event.messageID);
  }

  return sendAutoDeleteMsg(api, event.threadID, "Usage:\nteach -c (Check DB)\nteach -on (Start)\nteach -off (Stop)\nteach -show [text] (Check response)", event.messageID);
};

module.exports.onReply = async ({ api, event, Reply }) => {
  const senderID = event.senderID;

  if (Reply.type !== "interactive_teach" || senderID !== Reply.author) return;
  if (!activeTeachSessions.has(senderID)) return;

  const userResponse = event.body ? event.body.trim() : "";
  if (!userResponse) return;

  const sessionData = activeTeachSessions.get(senderID);
  const triggerText = Reply.trigger;

  // Delete previous prompt when user replies
  if (sessionData && sessionData.promptMessageID) {
    api.unsendMessage(sessionData.promptMessageID).catch(() => {});
  }

  try {
    const saveRes = await axios.post(`${baseApiUrl}/api/jan/teach`, {
      trigger: triggerText,
      responses: userResponse
    }, {
      headers: ADMIN_CREDENTIALS
    });

    if (saveRes.data && saveRes.data.success) {
      sendAutoDeleteMsg(api, event.threadID, "Successfully added ✅", event.messageID);
      
      if (activeTeachSessions.has(senderID)) {
        setTimeout(async () => {
          await sendNextPromptFromDB(api, event.threadID, senderID, event.messageID);
        }, 1200);
      }
    } else {
      sendAutoDeleteMsg(api, event.threadID, "❌ Failed to save teach response!", event.messageID);
    }
  } catch (err) {
    sendAutoDeleteMsg(api, event.threadID, "❌ Error saving teach data to database!", event.messageID);
  }
};
          

const axios = require("axios");

const baseApiUrl = "https://baby-1-tf9x.onrender.com";
const ADMIN_CREDENTIALS = {
  username: "Mr.king",
  password: "tanindev@#90"
};

const activeTeachSessions = new Map();

// Auto-delete message helper (শুধু Error/Status মেসেজের জন্য)
const sendAutoDeleteMsg = (api, threadID, text, replyToID) => {
  api.sendMessage(text, threadID, (err, info) => {
    if (!err && info) {
      setTimeout(() => {
        api.unsendMessage(info.messageID).catch(() => {});
      }, 10000);
    }
  }, replyToID);
};

// ইউজারকে বটের কথোপকথনের মতো প্রম্পট পাঠানো
const sendPromptToUser = (api, threadID, userID, triggerText, messageID, mode) => {
  const msgText = `╭┈─────── ೄྀ࿐ ˊˎ-\n┊ 👑 𝗠𝗶𝘀𝘀-𝗤𝘂𝗲𝗲𝗻 : ${triggerText}\n┊ 💌 এটার কি উত্তর দেব বলো তো?\n╰─────────────── 🚀`;

  api.sendMessage(msgText, threadID, (err, info) => {
    if (!err && info) {
      activeTeachSessions.set(userID, {
        currentTrigger: triggerText,
        promptMessageID: info.messageID,
        mode: mode
      });

      global.GoatBot.onReply.set(info.messageID, {
        commandName: "teach",
        type: "interactive_teach",
        messageID: info.messageID,
        author: userID,
        trigger: triggerText
      });
    }
  }, messageID);
};

// ডাটাবেজ থেকে র‍্যান্ডম প্রম্পট এনে পাঠানো
const sendRandomPromptFromDB = async (api, threadID, userID, messageID, mode) => {
  try {
    const res = await axios.get(`${baseApiUrl}/api/jan/random-trigger`);
    const randomTrigger = res.data && res.data.trigger ? res.data.trigger : "Hi";
    sendPromptToUser(api, threadID, userID, randomTrigger, messageID, mode);
  } catch (err) {
    sendAutoDeleteMsg(api, threadID, "❌ Failed to load triggers from database!", messageID);
  }
};

module.exports.config = {
  name: "teach",
  aliases: ["addmsg"],
  version: "7.0",
  author: "Mr.King",
  role: 0,
  category: "utility",
  guide: {
    en: "{pn} -c | {pn} -on | {pn} -chain | {pn} -off | {pn} -show [text]"
  }
};

module.exports.onStart = async ({ api, event, args, usersData, role }) => {
  const senderID = event.senderID;

  // 🔍 -show দিয়ে রেসপন্স চেক করা
  if (args[0] === "-show") {
    const queryText = args.slice(1).join(" ").trim();
    if (!queryText) {
      return sendAutoDeleteMsg(api, event.threadID, "⚠️ Please provide a text to check!\nExample: teach -show kemon aso", event.messageID);
    }

    try {
      const res = await axios.post(`${baseApiUrl}/api/hinata`, { text: queryText });
      if (res.data && res.data.message) {
        if (res.data.message === "sikai deu 🥺") {
          return sendAutoDeleteMsg(api, event.threadID, `❌ No responses found for: "${queryText}"`, event.messageID);
        }
        const replyMsg = `╭┈─────── ೄྀ࿐ ˊˎ-\n┊ 👑 𝗧𝗿𝗶𝗴𝗴𝗲𝗿 : ${queryText}\n┊ 💬 𝗥𝗲𝘀𝗽𝗼𝗻𝘀𝗲 : ${res.data.message}\n╰─────────────── 🚀`;
        return sendAutoDeleteMsg(api, event.threadID, replyMsg, event.messageID);
      }
    } catch (err) {
      return sendAutoDeleteMsg(api, event.threadID, "❌ Error checking response!", event.messageID);
    }
  }

  // DB Connection check
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

  // 🎲 ১. র‍্যান্ডম মোড
  if (args[0] === "-on") {
    sendAutoDeleteMsg(api, event.threadID, "🚀 Interactive Teach Mode Started!", event.messageID);
    return await sendRandomPromptFromDB(api, event.threadID, senderID, event.messageID, "random");
  }

  // 🔗 ২. চেইন মোড
  if (args[0] === "-chain") {
    sendAutoDeleteMsg(api, event.threadID, "🚀 Chain Teach Mode Started!", event.messageID);
    return await sendRandomPromptFromDB(api, event.threadID, senderID, event.messageID, "chain");
  }

  return sendAutoDeleteMsg(api, event.threadID, "Usage:\nteach -on (Random DB Mode)\nteach -chain (Chain Response Mode)\nteach -off (Stop)\nteach -c (Check DB)\nteach -show [text]", event.messageID);
};

module.exports.onReply = async ({ api, event, Reply }) => {
  const senderID = event.senderID;

  if (Reply.type !== "interactive_teach" || senderID !== Reply.author) return;
  if (!activeTeachSessions.has(senderID)) return;

  const userResponse = event.body ? event.body.trim() : "";
  if (!userResponse) return;

  const sessionData = activeTeachSessions.get(senderID);
  const triggerText = Reply.trigger;

  // উত্তর দেওয়া মাত্রই বটের আগের প্রশ্ন মেসেজটি রিমুভ হবে
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
      // ✅ সফল হলে কোনো মেসেজ দেবে না, সরাসরি পরের প্রম্পটে চলে যাবে
      if (activeTeachSessions.has(senderID)) {
        setTimeout(async () => {
          if (sessionData.mode === "chain") {
            const nextTrigger = saveRes.data.nextTrigger || userResponse;
            sendPromptToUser(api, event.threadID, senderID, nextTrigger, event.messageID, "chain");
          } else {
            await sendRandomPromptFromDB(api, event.threadID, senderID, event.messageID, "random");
          }
        }, 800);
      }
    } else {
      // ❌ ব্যর্থ হলে শুধু মেসেজ দেবে
      sendAutoDeleteMsg(api, event.threadID, "❌ Failed to save response!", event.messageID);
    }
  } catch (err) {
    // ❌ এরর হলেও মেসেজ দেবে
    sendAutoDeleteMsg(api, event.threadID, "❌ Server error! Could not save data.", event.messageID);
  }
};
  

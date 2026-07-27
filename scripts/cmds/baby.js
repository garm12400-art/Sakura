const axios = require("axios");

const roniBotTriggers = [
  "baby", "bby", "babu", "bbu", "jan", "bot", "জান", "জানু", "বেবি", "wifey", "hinata", "king", "mrking"
];

const peacockTriggers = ["baby", "bby", "jan", "জান", "জানু", "বেবি"];
const spamCooldown = new Map();

// Local fallback security list (Web database er satheo check hobe)
const allowedUsers = new Set(["61591264419890", "100012686563429", "61591681238739"]);

const fallbackMessages = [
  "ilu bby😘🕊️",
  "Jani na 😢",
  "k je 🙁",
  "usta you 🥱",
  "lungi chor",
  "u keda",
  "chop Uganda pathai dimu",
  "ale le le le"
];

// 🌐 Admin Header for Secured APIs
const ADMIN_AUTH = {
  username: "Mr.king",
  password: "nomnomnom009"
};

const baseApiUrl = async () => {
  return "https://baby-1-tf9x.onrender.com";
};

// Sans-Serif Bold Font Generator
const makeBold = (text) => {
  if (!text) return "";
  const fonts = {
    a: "𝗮", b: "𝗯", c: "𝗰", d: "𝗱", e: "𝗲", f: "𝗳", g: "𝗴", h: "𝗵", i: "𝗶", j: "𝗷", k: "𝗸", l: "𝗹", m: "𝗺",
    n: "𝗻", o: "𝗼", p: "𝗽", q: "𝗾", r: "𝗿", s: "𝘀", t: "𝘁", u: "𝘂", v: "𝘃", w: "𝘄", x: "𝘅", y: "𝘆", z: "𝘇",
    A: "𝗔", B: "𝗕", C: "𝗖", D: "𝗗", E: "𝗘", F: "𝗙", G: "𝗚", H: "𝗛", I: "𝗜", J: "𝗝", K: "𝗞", L: "𝗟", M: "𝗠",
    N: "𝗡", O: "𝗢", P: "𝗣", Q: "𝗤", R: "𝗥", S: "𝗦", T: "𝗧", U: "𝗨", V: "𝗩", W: "𝗪", X: "𝘅", Y: "𝗬", Z: "𝗭",
    "0": "𝟬", "1": "𝟭", "2": "𝟮", "3": "𝟯", "4": "𝟰", "5": "𝟱", "6": "𝟲", "7": "𝟳", "8": "𝟴", "9": "𝟵"
  };
  return text.split("").map(char => fonts[char] || char).join("");
};

// ইমোজি ফিল্টার ফাংশন
const cleanText = (text) => {
  if (!text) return "";
  return text
    .trim()
    .toLowerCase()
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .trim();
};

// Dynamic UID Authorization Check (Server + Local)
const isUserAllowed = async (uid) => {
  if (allowedUsers.has(uid)) return true;
  try {
    const res = await axios.get(`${await baseApiUrl()}/api/jan/check-uid/${uid}`);
    return res.data && res.data.allowed;
  } catch (err) {
    return false;
  }
};

const handleMediaCheck = (attachments) => {
  if (attachments && attachments.length > 0) {
    const type = attachments[0].type;
    if (type === "video") return "Mb nai bby pore dio";
    if (type === "audio") return "Sent 100000000tk to bkash then I will listen";
    if (type === "photo") return "iss amk picture diye potanor chesta 🌚😘";
  }
  return null;
};

const getFallbackResponse = () => {
  return fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
};

// 🔧 FIX: Auth Headers Added for Teach Requests
const saveTeachData = async (trigger, newResponses, uid) => {
  const url = await baseApiUrl();
  return await axios.post(`${url}/api/jan/teach`, { 
      trigger: trigger, 
      responses: newResponses, 
      userID: uid 
  }, {
      headers: ADMIN_AUTH
  });
};

module.exports.config = {
   name: "baby", 
   aliases: ["hinata", "bby", "bbu", "jan", "janu", "wifey", "bot"],
   version: "12.0",
   author: "Mr.King",
   role: 0,
   category: "chat",
   guide: {
     en: "{pn} [message] OR {pn} teach [Q] - [A] OR reply {pn} add / {pn} remove"
   }
};

module.exports.onStart = async ({ api, event, args, usersData }) => {
      if (event.senderID == api.getCurrentUserID()) return;
      
      const uid = event.senderID;
      const currentTime = Date.now();
      if (spamCooldown.has(uid)) {
          const lastTime = spamCooldown.get(uid);
          if (currentTime - lastTime < 3000) {
              return api.sendMessage(makeBold("Hop bumb koros kn 😒"), event.threadID, event.messageID);
          }
      }
      spamCooldown.set(uid, currentTime);

  try {
    const mediaReply = handleMediaCheck(event.attachments);
    if (mediaReply) {
      return api.sendMessage(makeBold(mediaReply), event.threadID, event.messageID);
    }

    if (!args || args.length === 0) {
      const ran = ["Bolo baby", "I love you", "type !baby hi", "Mr.King এর বটের চ্যাটবক্সে স্বাগতম! 😎"];
      return api.sendMessage(makeBold(ran[Math.floor(Math.random() * ran.length)]), event.threadID, event.messageID);
    }

    const inputCmd = args[0].toLowerCase();

    // 🚀 Add User Permission
    if (inputCmd === "add") {
      const allowed = await isUserAllowed(uid);
      if (!allowed) {
        return api.sendMessage(makeBold("❌ | আপনার এই কমান্ড ব্যবহার করার অনুমতি নেই!"), event.threadID, event.messageID);
      }
      if (event.type !== "message_reply") {
        return api.sendMessage(makeBold("❌ | যাকে পারমিশন দিতে চান তার মেসেজে Reply দিন!"), event.threadID, event.messageID);
      }
      const targetUID = event.messageReply.senderID;
      allowedUsers.add(targetUID);
      
      // Syncing with Website DB
      try {
        await axios.post(`${await baseApiUrl()}/api/admin/add-uid`, { uid: targetUID }, { headers: ADMIN_AUTH });
      } catch (e) {}

      const name = (await usersData.getName(targetUID)) || targetUID;
      return api.sendMessage(makeBold(`✅ | ${name} কে সফলভাবে Teach করার পারমিশন দেওয়া হয়েছে!`), event.threadID, event.messageID);
    }

    // 🚀 Remove User Permission
    if (inputCmd === "remove") {
      const allowed = await isUserAllowed(uid);
      if (!allowed) {
        return api.sendMessage(makeBold("❌ | আপনার এই কমান্ড ব্যবহার করার অনুমতি নেই!"), event.threadID, event.messageID);
      }
      if (event.type !== "message_reply") {
        return api.sendMessage(makeBold("❌ | যার পারমিশন সরাতে চান তার মেসেজে Reply দিন!"), event.threadID, event.messageID);
      }
      const targetUID = event.messageReply.senderID;
      allowedUsers.delete(targetUID);

      try {
        await axios.post(`${await baseApiUrl()}/api/admin/remove-uid`, { uid: targetUID }, { headers: ADMIN_AUTH });
      } catch (e) {}

      const name = (await usersData.getName(targetUID)) || targetUID;
      return api.sendMessage(makeBold(`❌ | ${name} এর Teach পারমিশন সরিয়ে দেওয়া হয়েছে!`), event.threadID, event.messageID);
    }

    // 🚀 Teach Command Handler (Fixed Auth)
    if (inputCmd === "teach") {
      const allowed = await isUserAllowed(uid);
      if (!allowed) {
          return api.sendMessage(makeBold("❌ | আপনার teach করার অনুমতি নেই!"), event.threadID, event.messageID);
      }

      const fullText = args.slice(1).join(" ");

      if (fullText === "-a" || fullText === "-r" || fullText === "") {
        const isRestricted = fullText === "-r";
        const promptText = isRestricted 
          ? "📝 (Restricted Mode) আপনি যা সেভ করতে চান তা এই মেসেজে Reply দিয়ে লিখুন।\n\n💡 ফরম্যাট: [প্রশ্ন] - [উত্তর১, উত্তর২, উত্তর৩]"
          : "📝 (Any Mode) বটের উত্তর সেভ করতে এই মেসেজে Reply দিন।\n\n💡 ফরম্যাট: [প্রশ্ন] - [উত্তর১, উত্তর২, উত্তর৩]";
        
        return api.sendMessage(makeBold(promptText), event.threadID, (err, info) => {
          if (!err && info) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: module.exports.config.name,
              type: "teach_input",
              messageID: info.messageID,
              author: uid,
              restricted: isRestricted
            });
          }
        }, event.messageID);
      }

      if (fullText.includes("-")) {
        const parts = fullText.split("-");
        const rawTrigger = parts[0].trim();
        const responsesArr = parts.slice(1).join("-").trim();

        const cleanedTrigger = cleanText(rawTrigger);
        let formattedResponses = responsesArr.split(/,|\n|-/).map(r => r.trim()).filter(Boolean).join(" - ");

        const res = await saveTeachData(cleanedTrigger, formattedResponses, uid);

        if (res.data && res.data.success) {
            const userName = (await usersData.getName(uid)) || "Boss";
            return api.sendMessage(makeBold(`✅ সফলভাবে ডাটাবেজে যুক্ত করা হয়েছে!\n\n• Teacher: ${userName}\n• Question: ${cleanedTrigger}\n• Response: ${formattedResponses}`), event.threadID, event.messageID);
        } else {
            return api.sendMessage(makeBold("❌ | ডাটাবেজে সেভ করতে ব্যর্থ হয়েছে!"), event.threadID, event.messageID);
        }
      } else {
        return api.sendMessage(makeBold("❌ | সঠিক ফরম্যাটে লিখুন!\nউদাহরণ: baby teach Hi - hilu , hi , janu"), event.threadID, event.messageID);
      }
    }

    if (inputCmd === "list") {
      const response = await axios.get(`${await baseApiUrl()}/api/jan/list`);
      return api.sendMessage(makeBold(response.data.message), event.threadID, event.messageID);
    }

    const getBotResponse = async (text, attachments) => { 
        try { 
            const res = await axios.post(`${await baseApiUrl()}/api/hinata`, { text: text, style: 3, attachments }); 
            if (res.data.message && (res.data.message.includes("sikai deu") || res.data.message.includes("error") || res.data.message.includes("fetching"))) {
                return getFallbackResponse();
            }
            if (res.data.message && res.data.message.includes(" | ")) {
                const list = res.data.message.split(" | ");
                return list[Math.floor(Math.random() * list.length)];
            }
            return res.data.message; 
        } catch { return getFallbackResponse(); } 
    };

    const userMsg = args.join(" ");
    const botResponse = await getBotResponse(userMsg, event.attachments || []);
    api.sendMessage(makeBold(botResponse), event.threadID, (err, info) => {
      if (!err && info) {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: module.exports.config.name,
          type: "reply",
          messageID: info.messageID,
          author: uid,
          text: botResponse
        });
      }
    }, event.messageID);

  } catch (err) {
    console.error(err);
  }
};

module.exports.onReply = async ({ api, event, Reply, usersData }) => {
   if (event.senderID == api.getCurrentUserID()) return;
   
   const uid = event.senderID;
   const currentTime = Date.now();
   if (spamCooldown.has(uid)) {
       const lastTime = spamCooldown.get(uid);
       if (currentTime - lastTime < 3000) {
           return api.sendMessage(makeBold("Hop spam koros kn 😒"), event.threadID, event.messageID);
       }
   }
   spamCooldown.set(uid, currentTime);

   try {
    if (Reply && Reply.type === "teach_input") {
        const allowed = await isUserAllowed(uid);
        if (!allowed) {
            return api.sendMessage(makeBold("❌ | আপনার teach করার অনুমতি নেই!"), event.threadID, event.messageID);
        }
        if (Reply.restricted && Reply.author !== uid) {
            return api.sendMessage(makeBold("❌ | যে teach-r শুরু করেছে শুধু সে-ই উত্তর দিতে পারবে!"), event.threadID, event.messageID);
        }

        const replyContent = event.body || "";
        if (!replyContent.includes("-")) {
            return api.sendMessage(makeBold("❌ | সঠিক ফরম্যাটে দিন!\nউদাহরণ: Hi - hilu , hi , janu"), event.threadID, event.messageID);
        }

        const parts = replyContent.split("-");
        const rawTrigger = parts[0].trim();
        const responsesArr = parts.slice(1).join("-").trim();

        const cleanedTrigger = cleanText(rawTrigger);
        let formattedResponses = responsesArr.split(/,|\n|-/).map(r => r.trim()).filter(Boolean).join(" - ");

        const res = await saveTeachData(cleanedTrigger, formattedResponses, uid);

        if (res.data && res.data.success) {
            const userName = (await usersData.getName(uid)) || "User";
            return api.sendMessage(makeBold(`✅ সফলভাবে ডাটাবেজে যুক্ত করা হয়েছে!\n\n• Teacher: ${userName}\n• Question: ${cleanedTrigger}\n• Response: ${formattedResponses}`), event.threadID, event.messageID);
        } else {
            return api.sendMessage(makeBold("❌ | ডাটাবেজে সেভ করতে ব্যর্থ হয়েছে!"), event.threadID, event.messageID);
        }
    }

    const mediaReply = handleMediaCheck(event.attachments);
    if (mediaReply) {
      return api.sendMessage(makeBold(mediaReply), event.threadID, event.messageID);
    }

    const getBotResponse = async (text, attachments) => {  
        try {
            const res = await axios.post(`${await baseApiUrl()}/api/hinata`, { text: text, style: 3, attachments }); 
            if (res.data.message && (res.data.message.includes("sikai deu") || res.data.message.includes("error") || res.data.message.includes("fetching"))) {
                return getFallbackResponse();
            }
            if (res.data.message && res.data.message.includes(" | ")) {
                const list = res.data.message.split(" | ");
                return list[Math.floor(Math.random() * list.length)];
            }
            return res.data.message; 
        } catch { return getFallbackResponse(); } 
    };

    const replyMessage = await getBotResponse(event.body || "meow", event.attachments || []);
    api.sendMessage(makeBold(replyMessage), event.threadID, (err, info) => {
      if (!err && info) {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: module.exports.config.name,
          type: "reply",
          messageID: info.messageID,
          author: event.senderID,
          text: replyMessage
        });
      }
    }, event.messageID);
  } catch (err) {
    console.error(err);
  }
};

module.exports.onChat = async ({ api, event, usersData }) => {
  if (event.senderID == api.getCurrentUserID()) return;

  try {
    const message = event.body || "";
    const attachments = event.attachments || [];

    const lowerMessage = message.toLowerCase();
    if (roniBotTriggers.some(word => lowerMessage.startsWith(word))) {
        
        const uid = event.senderID;
        const currentTime = Date.now();
        if (spamCooldown.has(uid)) {
            const lastTime = spamCooldown.get(uid);
            if (currentTime - lastTime < 3000) {
                return api.sendMessage(makeBold("Hop bumb koros kn 😒"), event.threadID, event.messageID);
            }
        }
        spamCooldown.set(uid, currentTime);

        const reactionEmoji = peacockTriggers.some(word => lowerMessage.startsWith(word)) ? "🦚" : "🪽";
        api.setMessageReaction(reactionEmoji, event.messageID, () => {}, true); 
        api.sendTypingIndicator(event.threadID, true);   

        let cleanMsg = message.trim();
        for (const prefix of roniBotTriggers) {
            if (lowerMessage.startsWith(prefix)) { 
                cleanMsg = message.substring(prefix.length).trim();
                break;
            }
        }

        const subCmd = cleanMsg.toLowerCase();
        if ((subCmd === "add" || subCmd === "remove") && event.type === "message_reply") {
            const allowed = await isUserAllowed(uid);
            if (!allowed) {
                return api.sendMessage(makeBold("❌ | আপনার এই আদেশ দেওয়ার অনুমতি নেই!"), event.threadID, event.messageID);
            }
            const targetUID = event.messageReply.senderID;
            const name = (await usersData.getName(targetUID)) || targetUID;
            
            if (subCmd === "add") {
                allowedUsers.add(targetUID);
                try {
                  await axios.post(`${await baseApiUrl()}/api/admin/add-uid`, { uid: targetUID }, { headers: ADMIN_AUTH });
                } catch(e) {}
                return api.sendMessage(makeBold(`✅ | ${name} কে সফলভাবে Teach করার পারমিশন দেওয়া হয়েছে!`), event.threadID, event.messageID);
            } else {
                allowedUsers.delete(targetUID);
                try {
                  await axios.post(`${await baseApiUrl()}/api/admin/remove-uid`, { uid: targetUID }, { headers: ADMIN_AUTH });
                } catch(e) {}
                return api.sendMessage(makeBold(`❌ | ${name} এর Teach পারমিশন সরিয়ে দেওয়া হয়েছে!`), event.threadID, event.messageID);
            }
        }

        const mediaReply = handleMediaCheck(attachments);
        if (mediaReply) {
          return api.sendMessage(makeBold(mediaReply), event.threadID, event.messageID);
        }
        
        const messageParts = lowerMessage.trim().split(/\s+/);
        
        let userText = message; 
        for (const prefix of roniBotTriggers) {
            if (lowerMessage.startsWith(prefix)) { 
                userText = message.substring(prefix.length).trim();
                break;
            }
        }

        const getBotResponse = async (text, attachments) => {
            try {
                const res = await axios.post(`${await baseApiUrl()}/api/hinata`, { text: text, style: 3, attachments });  
                if (res.data.message && (res.data.message.includes("sikai deu") || res.data.message.includes("error") || res.data.message.includes("fetching"))) {
                    return getFallbackResponse();
                }
                if (res.data.message && res.data.message.includes(" | ")) {
                    const list = res.data.message.split(" | ");
                    return list[Math.floor(Math.random() * list.length)];
                }
                return res.data.message; 
            } catch { return getFallbackResponse(); }
        };

        const randomMessage = [
            "Mr.King এর মনের রাজ্যে শুধু তোমারই বসবাস! 👑💖",
            "Everything is temporary, but Mr.King's bot is permanent! ✨♾️",
            "বেবি বেশি কিছু চাই না, শুধু সারাজীবন তোমার হাতটা ধরে থাকতে চাই 🤝❤️",
            "You are the most beautiful chapter of my life! 🥀💫"
        ];
                                                                                                                 
        const customMessage = randomMessage[Math.floor(Math.random() * randomMessage.length)];
        
        if (messageParts.length === 1 && attachments.length === 0) {
            api.sendMessage(makeBold(customMessage), event.threadID, (err, info) => {
              if (!err && info) {
                global.GoatBot.onReply.set(info.messageID, {
                  commandName: module.exports.config.name,
                  type: "reply",
                  messageID: info.messageID,
                  author: event.senderID,
                  text: customMessage
                });
              }
            }, event.messageID);
        } else { 
            const botResponse = await getBotResponse(userText, attachments);
            api.sendMessage(makeBold(botResponse), event.threadID, (err, info) => {
              if (!err && info) {
                global.GoatBot.onReply.set(info.messageID, {
                  commandName: module.exports.config.name,
                  type: "reply",
                  messageID: info.messageID,
                  author: event.senderID,
                  text: botResponse
                });
              }
            }, event.messageID);
        }
    }
  } catch (err) {
    console.error(err);
  }
};
                                   

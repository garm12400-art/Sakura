// Banner Image: https://files.catbox.moe/ixj7u8.jpg

const axios = require("axios");

const roniBotTriggers = [
  "baby", "bby", "babu", "bbu", "jan", "bot", "জান", "জানু", "বেবি", "wifey", "hinata", "king", "mrking"
];

const peacockTriggers = ["baby", "bby", "jan", "জান", "জানু", "বেবি"];
const spamCooldown = new Map();

const fallbackMessages = [
  "ilu bby😘🕊️",
  "Jani na 😢",
  "Gumaw tumi ",
  "usta you 🥱",
  "lungi chor",
  "u keda",
  "chop Uganda pathai dimu",
  "ale le le le"
];

const baseApiUrl = "https://baby-1-tf9x.onrender.com";

const makeBold = (text) => {
  if (!text) return "";
  const fonts = {
    a: "𝗮", b: "𝗯", c: "𝗰", d: "𝗱", e: "𝗲", f: "𝗳", g: "𝗴", h: "𝗵", i: "𝗶", j: "𝗷", k: "𝗸", l: "𝗹", m: "𝗺",
    n: "𝗻", o: "𝗼", p: "𝗽", q: "𝗾", r: "𝗿", s: "𝘀", t: "𝘁", u: "𝘂", v: "𝘃", w: "𝘄", x: "𝘅", y: "𝘆", z: "𝘇",
    A: "𝗔", B: "𝗕", C: "Ｃ", D: "Ｄ", E: "𝗘", F: "𝗙", G: "𝗚", H: "𝗛", I: "𝗜", J: "𝗝", K: "Ｋ", L: "𝗟", M: "Ｍ",
    N: "𝗡", O: "𝗢", P: "𝗣", Q: "𝗤", R: "𝗥", S: "𝗦", T: "𝗧", U: "𝗨", V: "𝘃", W: "𝗪", X: "𝘅", Y: "𝗬", Z: "𝗭",
    "0": "𝟬", "1": "𝟭", "2": "𝟮", "3": "𝟯", "4": "𝟰", "5": "𝟱", "6": "𝟲", "7": "𝟳", "8": "𝟴", "9": "𝟵"
  };
  return text.split("").map(char => fonts[char] || char).join("");
};

const extractEmojis = (text) => {
  if (!text) return [];
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
    const segments = Array.from(segmenter.segment(text));
    const emojiRegex = /\p{Extended_Pictographic}/u;
    return segments.map(s => s.segment).filter(str => emojiRegex.test(str));
  }
  const fallbackRegex = /(\p{Extended_Pictographic}[\u{1F3FB}-\u{1F3FF}]?)/gu;
  return text.match(fallbackRegex) || [];
};

const checkSingleQuery = async (query) => {
  if (!query) return null;
  try {
    const res = await axios.post(`${baseApiUrl}/api/hinata`, { text: query, style: 3 });
    const replyMsg = res.data ? res.data.message : null;
    
    if (replyMsg && 
        !replyMsg.includes("sikai deu") && 
        !replyMsg.includes("error") && 
        !replyMsg.includes("fetching") && 
        !replyMsg.includes("I don't know")) {
      
      if (replyMsg.includes(" | ")) {
        const list = replyMsg.split(" | ");
        return list[Math.floor(Math.random() * list.length)];
      }
      return replyMsg;
    }
  } catch {
    return null;
  }
  return null;
};

const handleMediaCheck = (attachments) => {
  if (attachments && attachments.length > 0) {
    const type = attachments[0].type;
    const replies = {
      video: ["Mb nai bby pore dio", "ajaira sop video😒", "1 ta kidni de then dekhmu"],
      audio: ["Sent 100000000tk to bkash then I will listen", "aj boyra bole kisu sunte parlam na😤", "tor Kun Kun jaygay betha go bandubi lolita"],
      photo: ["iss amk picture diye potanor chesta 🌚😘", "pic dekhe ki hobe jokon mb e nai"]
    };
    if (replies[type]) {
      const list = replies[type];
      return list[Math.floor(Math.random() * list.length)];
    }
  }
  return null;
};

const getFallbackResponse = () => fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];

const fetchApiResponse = async (text, attachments = []) => {
  try {
    const fullTextResp = await checkSingleQuery(text);
    if (fullTextResp) return fullTextResp;

    const emojis = extractEmojis(text);
    if (emojis.length > 0) {
      for (const singleEmoji of emojis) {
        const emojiResp = await checkSingleQuery(singleEmoji);
        if (emojiResp) return emojiResp;
      }
    }

    const words = text.trim().split(/\s+/);
    if (words.length > 1) {
      for (const word of words) {
        const cleanWord = word.replace(/[^\p{L}\p{N}]/gu, "");
        if (cleanWord.length < 2) continue;
        
        const wordResp = await checkSingleQuery(cleanWord);
        if (wordResp) return wordResp;
      }
    }

    return getFallbackResponse();
  } catch {
    return getFallbackResponse();
  }
};

module.exports.config = {
   name: "baby", 
   aliases: ["hinata", "bby", "bbu", "jan", "janu", "wifey", "bot"],
   version: "20.0",
   author: "Mr.King",
   role: 0,
   category: "chat",
   guide: {
     en: "{pn} [message]"
   }
};

module.exports.onStart = async ({ api, event, args }) => {
  if (event.senderID == api.getCurrentUserID()) return;
  
  const uid = event.senderID;
  const currentTime = Date.now();
  if (spamCooldown.has(uid) && currentTime - spamCooldown.get(uid) < 3000) {
      return api.sendMessage(makeBold("Hop bumb koros kn 😒"), event.threadID, event.messageID);
  }
  spamCooldown.set(uid, currentTime);

  try {
    const mediaReply = handleMediaCheck(event.attachments);
    if (mediaReply) {
      return api.sendMessage(makeBold(mediaReply), event.threadID, event.messageID);
    }

    if (!args || args.length === 0) {
      const ran = ["Bolo baby", "I love you", "Welcome to Mr.King Chatbot! 😎"];
      return api.sendMessage(makeBold(ran[Math.floor(Math.random() * ran.length)]), event.threadID, event.messageID);
    }

    const inputCmd = args[0].toLowerCase();

    if (inputCmd === "teach" || inputCmd === "add" || inputCmd === "remove") {
      return api.sendMessage(makeBold("❌ | You don't have permission to teach! This is reserved for admins only."), event.threadID, event.messageID);
    }

    const userMsg = args.join(" ");
    const botResponse = await fetchApiResponse(userMsg, event.attachments || []);
    
    api.sendMessage(makeBold(botResponse), event.threadID, (err, info) => {
      if (!err && info) {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: module.exports.config.name,
          type: "reply",
          messageID: info.messageID,
          author: event.senderID
        });
      }
    }, event.messageID);

  } catch (err) {
    console.error(err);
  }
};

module.exports.onReply = async ({ api, event, Reply }) => {
  if (event.senderID == api.getCurrentUserID()) return;

  const uid = event.senderID;
  const currentTime = Date.now();
  if (spamCooldown.has(uid) && currentTime - spamCooldown.get(uid) < 3000) {
      return api.sendMessage(makeBold("Hop spam koros kn 😒"), event.threadID, event.messageID);
  }
  spamCooldown.set(uid, currentTime);

  try {
    const userMsg = event.body || "";
    const mediaReply = handleMediaCheck(event.attachments);
    
    let botResponse = mediaReply;
    if (!botResponse) {
      botResponse = await fetchApiResponse(userMsg, event.attachments || []);
    }

    api.sendMessage(makeBold(botResponse), event.threadID, (err, info) => {
      if (!err && info) {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: module.exports.config.name,
          type: "reply",
          messageID: info.messageID,
          author: event.senderID
        });
      }
    }, event.messageID);
  } catch (err) {
    console.error(err);
  }
};

module.exports.onChat = async ({ api, event }) => {
  if (event.senderID == api.getCurrentUserID()) return;

  try {
    const message = event.body || "";
    const lowerMessage = message.toLowerCase();

    if (roniBotTriggers.some(word => lowerMessage.startsWith(word))) {
        const uid = event.senderID;
        const currentTime = Date.now();
        if (spamCooldown.has(uid) && currentTime - spamCooldown.get(uid) < 3000) {
            return api.sendMessage(makeBold("Hop bumb koros kn 😒"), event.threadID, event.messageID);
        }
        spamCooldown.set(uid, currentTime);

        const reactionEmoji = peacockTriggers.some(word => lowerMessage.startsWith(word)) ? "🪽" : "🪽";
        api.setMessageReaction(reactionEmoji, event.messageID, () => {}, true);

        let userText = message; 
        for (const prefix of roniBotTriggers) {
            if (lowerMessage.startsWith(prefix)) { 
                userText = message.substring(prefix.length).trim();
                break;
            }
        }

        if (!userText) {
          const ranPrompt = [
            "Bolo baby, what do you want to say?",
            "Ummah daw rag kome jabe 😘",
            "Bolo baby, shunsi toh!",
            "Keno dakco baby? 😉",
            "𝗘𝘃𝗲𝗿𝘆𝘁𝗵𝗶𝗻𝗴 𝗶𝘀 𝘁𝗲𝗺𝗽𝗼𝗿𝗮𝗿𝘆, 𝗯𝘂𝘁 𝗠𝗿.𝗞𝗶𝗻𝗴'𝘀 𝗯𝗼𝘁 𝗶𝘀 𝗽𝗲𝗿𝗺𝗮𝗻𝗲𝗻𝘁! ✨♾️"
          ];
          const chosenText = ranPrompt[Math.floor(Math.random() * ranPrompt.length)];
          return api.sendMessage(makeBold(chosenText), event.threadID, (err, info) => {
            if (!err && info) {
              global.GoatBot.onReply.set(info.messageID, {
                commandName: module.exports.config.name,
                type: "reply",
                messageID: info.messageID,
                author: event.senderID
              });
            }
          }, event.messageID);
        }

        const mediaReply = handleMediaCheck(event.attachments);
        if (mediaReply) {
          return api.sendMessage(makeBold(mediaReply), event.threadID, event.messageID);
        }

        const botResponse = await fetchApiResponse(userText, event.attachments || []);
        api.sendMessage(makeBold(botResponse), event.threadID, (err, info) => {
          if (!err && info) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: module.exports.config.name,
              type: "reply",
              messageID: info.messageID,
              author: event.senderID
            });
          }
        }, event.messageID);
    }
  } catch (err) {
    console.error(err);
  }
};

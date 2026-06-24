// !cmd install anime.js  
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

if (!global.animeVideoMemory) global.animeVideoMemory = new Set();

module.exports = {
  config: {
    name: "anime",
    aliases: ["anivid", "animevid"],
    version: "3.1.0",
    author: "Mr.King 🎭",
    countDown: 5,
    role: 0,
    category: "media",
    guide: {
      en: "𝐔𝐬𝐞 {pn} 𝐭𝐨 𝐠𝐞𝐭 𝐚 𝐑𝐚𝐧𝐝𝐨𝐦 𝐚𝐧𝐢𝐦𝐞 𝟒𝐊 𝐯𝐢𝐝𝐞𝐨!"
    }
  },

  onStart: async function ({ api, event, message, usersData }) {
    const { threadID, messageID, senderID } = event;
    const bossID = "61590317176239";
    const cost = 1000;

    const userData = await usersData.get(senderID);
    let balance = userData.money || 0;

    if (senderID !== bossID) {
      if (balance < cost) {
        return message.reply(`𝐁𝐛𝐲 𝐲𝐨𝐮 𝐝𝐨𝐧'𝐭 𝐡𝐚𝐯𝐞 𝐭𝐡𝐚𝐭 𝐦𝐮𝐜𝐡 𝐛𝐚𝐥𝐚𝐧𝐜𝐞 😿\n𝐘𝐨𝐮𝐫 𝐂𝐮𝐫𝐫𝐞𝐧𝐭 𝐁𝐚𝐥𝐚𝐧𝐜𝐞: ${balance.toLocaleString()}৳`);
      }
    }

    const loadingText = "🎬 𝐋𝐨𝐚𝐝𝐢𝐧𝐠 𝐫𝐚𝐧𝐝𝐨𝐦 𝐚𝐧𝐢𝐦𝐞 𝐯𝐢𝐝𝐞𝐨... 𝐏𝐥𝐞𝐚𝐬𝐞 𝐰𝐚𝐢𝐭 𝐛𝐛𝐲 🕊️💖";
    const info = await message.reply(loadingText);

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    setTimeout(() => { api.unsendMessage(info.messageID); }, 8000);

    try {
      const animeTags = [
        "anime attitude edit 4k",
        "anime sigma male edit",
        "badass anime moments 4k",
        "anime phonk edit 4k",
        "madara uchiha attitude edit",
        "gojo satoru badass edit",
        "anime 4k 60fps attitude",
        "anime dark aesthetic 4k",
        "nyxlu anime edit 4k", 
        "aura anime", 
        "4k aura anime", 
        "Anime hot", // <-- Fixed missing comma here
        "anime savage moments 4k"
      ];

      const randomTag = animeTags[Math.floor(Math.random() * animeTags.length)];

      const res = await axios.get(`https://www.tikwm.com/api/feed/search?keywords=${encodeURIComponent(randomTag)}`);
      const videos = res.data?.data?.videos;

      if (!videos || videos.length === 0) throw new Error("No video found");

      let selected = videos.find(v => !global.animeVideoMemory.has(v.video_id));
      if (!selected) {
        global.animeVideoMemory.clear();
        selected = videos[Math.floor(Math.random() * videos.length)];
      }
      global.animeVideoMemory.add(selected.video_id);

      const videoUrl = selected.play;
      const pathVideo = path.join(cacheDir, `anime_${Date.now()}.mp4`);

      const response = await axios({
        method: "get",
        url: videoUrl,
        responseType: "stream"
      });

      const writer = fs.createWriteStream(pathVideo);
      response.data.pipe(writer);

      writer.on("finish", async () => {
        if (senderID !== bossID) {
          await usersData.set(senderID, { money: balance - cost });
        }

        return message.reply({
          body: `⚔️ 𝐇𝐞𝐫𝐞 𝐢𝐬 𝐲𝐨𝐮𝐫 𝐚𝐧𝐢𝐦𝐞 𝐯𝐢𝐝𝐞𝐨 ⚔️\n\n🦭 𝐒𝐲𝐬𝐭𝐞𝐦 𝐁𝐲: 𝐌𝐫.𝐊𝐢𝐧𝐠 🕊️💖`,
          attachment: fs.createReadStream(pathVideo)
        }, () => {
          if (fs.existsSync(pathVideo)) fs.unlinkSync(pathVideo);
        });
      });

    } catch (err) {
      console.error(err); // Logs error to your console for easier debugging
      return message.reply("⚠️ 𝐒𝐲𝐬𝐭𝐞𝐦 𝐄𝐫𝐫𝐨𝐫! 𝐓𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐛𝐨𝐬𝐬 🥀");
    }
  }
};

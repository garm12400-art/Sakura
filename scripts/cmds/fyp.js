const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

if (!global.fypVideoMemory) global.fypVideoMemory = new Set();

//Helper to convert standard text to Bold Italic style (Option 5)
const boldItalic = (text) => {
  const fonts = {
    'a': '𝒂', 'b': '𝒃', 'c': '𝒄', 'd': '𝒅', 'e': '𝒆', 'f': '𝒇', 'g': '𝒈', 'h': '𝒉', 'i': '𝒊', 'j': '𝒋', 'k': '𝒌', 'l': '𝒍', 'm': '𝒎', 'n': '𝒏', 'o': '𝒐', 'p': '𝒑', 'q': '𝒒', 'r': '𝒓', 's': '𝒔', 't': '𝒕', 'u': '𝒖', 'v': '𝒗', 'w': '𝒘', 'x': '𝒙', 'y': '𝒚', 'z': '𝒛',
    'A': '𝑨', 'B': '𝑩', 'C': '𝑪', 'D': '𝑫', 'E': '𝑬', 'F': '𝑭', 'G': '𝑮', 'H': '𝑯', 'I': '𝑰', 'J': '𝑵', 'K': '𝑩', 'L': '𝑳', 'M': '𝑴', 'N': '𝑵', 'O': '𝑶', 'P': '𝑷', 'Q': '𝑴', 'R': '𝑹', 'S': '𝑺', 'T': '𝑻', 'U': '𝑼', 'V': '𝑽', 'W': '𝑾', 'X': '𝑿', 'Y': '𝒀', 'Z': '𝒁',
    '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒', '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗'
  };
  return text.split('').map(char => fonts[char] || char).join('');
};

module.exports = {
  config: {
    name: "fyp",
    aliases: ["fypvid"],
    version: "2.0.0",
    author: "Mr.King ",
    countDown: 5,
    role: 0,
    shortDescription: "Search TikTok videos (VIP Only)",
    category: "media",
    guide: {
      en: "Use {pn} <keyword> to search TikTok videos."
    }
  },

  onStart: async function ({ api, event, args, message, usersData }) {
    const searchQuery = args.join(" ").trim();
    return this.handleFypVideo(api, event, message, usersData, searchQuery);
  },

  handleFypVideo: async function (api, event, message, usersData, searchQuery) {
    const uid = event.senderID;
    const { messageID } = event;

    // VIP Check
    const user = await usersData.get(uid);
    const vipData = user?.data?.vip;

    if (!vipData || !vipData.expires || vipData.expires <= Date.now()) {
      return message.reply(
        "• ❌ 𝑻𝒉𝒊𝒔 𝒄𝒐𝒎𝒎𝒂𝒏𝒅 𝒊𝒔 𝒐𝒏𝒍𝒚 𝒇𝒐𝒓 👑 𝑽𝑰𝑷 𝒖𝒔𝒆𝒓𝒔!\n\n" +
        "📌 𝑼𝒔𝒆 {𝒑}𝒗𝒊𝒑 𝒕𝒐 𝒄𝒉𝒆𝒄𝒌 𝒗𝒊𝒑 𝒑𝒓𝒊𝒄𝒆𝒔 𝒂𝒏𝒅 𝒔𝒖𝒃𝒔𝒄𝒓𝒊𝒃𝒆."
      );
    }

    if (!searchQuery) {
      return message.reply("• ⚠️ 𝑷𝒍𝒆𝒂𝒔𝒆 𝒑𝒓𝒐𝒗𝒊𝒅𝒆 𝒂 𝒔𝒆𝒂𝒓𝒄𝒉 𝒒𝒖𝒆𝒓𝒚!\n📌 𝑬𝒙𝒂𝒎𝒑𝒍𝒆: {𝒑}𝒇𝒚𝒑 𝒂𝒏𝒊𝒎𝒆 𝒂𝒕𝒕𝒊𝒕𝒖𝒅𝒆 𝒆𝒅𝒊𝒕");
    }

    if (api.setMessageReaction) {
      api.setMessageReaction("☠️", messageID, () => {}, true);
    }

    const cacheDir = path.join(__dirname, 'cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    try {
      const res = await axios.get(`https://www.tikwm.com/api/feed/search?keywords=${encodeURIComponent(searchQuery)}`);
      const videos = res.data?.data?.videos;

      if (!videos || videos.length === 0) throw new Error("No videos found.");

      let selected = videos.find(v => !global.fypVideoMemory.has(v.video_id));
      if (!selected) {
        global.fypVideoMemory.clear();
        selected = videos[Math.floor(Math.random() * videos.length)];
      }
      global.fypVideoMemory.add(selected.video_id);

      const videoUrl = selected.play || selected.hdplay;
      const pathVideo = path.join(cacheDir, `fyp_${Date.now()}.mp4`);

      const response = await axios({
        method: 'get',
        url: videoUrl,
        responseType: 'stream'
      });

      const writer = fs.createWriteStream(pathVideo);
      response.data.pipe(writer);

      writer.on('finish', () => {
        const caption = `✨ ───────────────── ✨\n` +
                        `ₕₑᵣₑ ᵢₛ ₐ ᵥᵢdₑₒ Fᵣ₏ₘ 𝔐𝔯.𝔎ᵢ𝔫𝔤 ☠️✌🏼\n` +
                        `your search : ${boldItalic(searchQuery)}\n` +
                        `✨ ───────────────── ✨`;

        if (api.setMessageReaction) {
          api.setMessageReaction("🪶", messageID, () => {}, true);
        }

        return message.reply({
          body: caption,
          attachment: fs.createReadStream(pathVideo)
        }, () => {
          if (fs.existsSync(pathVideo)) fs.unlinkSync(pathVideo);
        });
      });

    } catch (err) {
      console.error(err);
      if (api.setMessageReaction) {
        api.setMessageReaction("🔴", messageID, () => {}, true);
      }
      return message.reply(`⚠️ | No videos found for: "${boldItalic(searchQuery)}"`);
    }
  }
};

const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

if (!global.carVideoMemory) global.carVideoMemory = new Set();

module.exports = {
  config: {
    name: "car",
    aliases: ["carvid", "🏎️"],
    version: "1.0.0",
    author: "𝔐𝔯.𝔎𝔦𝔫𝔤 ☠️✌🏼",
    countDown: 5,
    role: 0,
    shortDescription: "Get random or searched car edit videos",
    category: "media",
    guide: {
      en: "Use {pn} for random car edit or {pn} <keyword> to search specific car videos."
    },
    usePrefix: false
  },

  onStart: async function ({ api, event, args, message }) {
    const searchQuery = args.join(" ").trim();
    return this.handleCarVideo(api, event, message, searchQuery);
  },

  onChat: async function ({ api, event, message }) {
    const { body } = event;
    if (!body) return;

    const trimmed = body.trim();
    if (trimmed === "🏎️") {
      return this.handleCarVideo(api, event, message, "");
    }
  },

  handleCarVideo: async function (api, event, message, searchQuery) {
    const { threadID, messageID } = event;

    if (api.setMessageReaction) {
      api.setMessageReaction("☠️", messageID, () => {}, true);
    }

    const cacheDir = path.join(__dirname, 'cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    try {
      const defaultCarTags = [
        "4k car video",
        "car aura",
        "bmw aura",
        "bmw 4k editz",
        "anime car video",
        "car 4k editz",
        "supercar 4k edit",
        "car drifting 4k edit",
        "porsche 4k edit",
        "lamborghini status video",
        "jdm car edit 4k",
        "audi cold moments edit",
        "mercedes amg attitude edit"
      ];

      const isSearch = searchQuery.length > 0;
      const targetTag = isSearch ? searchQuery : defaultCarTags[Math.floor(Math.random() * defaultCarTags.length)];

      const res = await axios.get(`https://www.tikwm.com/api/feed/search?keywords=${encodeURIComponent(targetTag)}`);
      const videos = res.data?.data?.videos;

      if (!videos || videos.length === 0) throw new Error("No car videos found.");

      let selected = videos.find(v => !global.carVideoMemory.has(v.video_id));
      if (!selected) {
        global.carVideoMemory.clear();
        selected = videos[Math.floor(Math.random() * videos.length)];
      }
      global.carVideoMemory.add(selected.video_id);

      const videoUrl = selected.play || selected.hdplay;
      const pathVideo = path.join(cacheDir, `car_edit_${Date.now()}.mp4`);

      const response = await axios({
        method: 'get',
        url: videoUrl,
        responseType: 'stream'
      });

      const writer = fs.createWriteStream(pathVideo);
      response.data.pipe(writer);

      writer.on('finish', () => {
        let caption = "";
        if (isSearch) {
          caption = `✨ ───────────────── ✨\n` +
                    `ₕₑᵣₑ ᵢₛ ₐ ᵥᵢdₑₒ Fᵣ₏ₘ 𝔐𝔯.𝔎ᵢ𝔫𝔤 ☠️✌🏼\n` +
                    `your search : ${searchQuery}\n` +
                    `✨ ───────────────── ✨`;
        } else {
          caption = `✨ ───────────────── ✨\n` +
                    `ₕₑᵣₑ ᵢₛ ₐ ᵥᵢdₑₒ Fᵣ₏ₘ 𝔐𝔯.𝔎ᵢ𝔫𝔤 ☠️✌🏼\n` +
                    `✨ ───────────────── ✨`;
        }

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
      return message.reply("⚠️ | Error fetching car video. Please try again!");
    }
  }
};

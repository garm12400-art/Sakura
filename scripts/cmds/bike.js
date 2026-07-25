const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

if (!global.bikeVideoMemory) global.bikeVideoMemory = new Set();

module.exports = {
  config: {
    name: "bike",
    aliases: ["bikevid", "🏍️"],
    version: "1.0.0",
    author: "𝔐𝔯.𝔎𝔦𝔫𝔤 ☠️✌🏼",
    countDown: 5,
    role: 0,
    shortDescription: "Get random or searched bike edit videos",
    category: "media",
    guide: {
      en: "Use {pn} for random bike edit or {pn} <keyword> to search specific bike videos."
    },
    usePrefix: false
  },

  onStart: async function ({ api, event, args, message }) {
    const searchQuery = args.join(" ").trim();
    return this.handleBikeVideo(api, event, message, searchQuery);
  },

  onChat: async function ({ api, event, message }) {
    const { body } = event;
    if (!body) return;

    const trimmed = body.trim();
    if (trimmed === "🏍️") {
      return this.handleBikeVideo(api, event, message, "");
    }
  },

  handleBikeVideo: async function (api, event, message, searchQuery) {
    const { threadID, messageID } = event;

    if (api.setMessageReaction) {
      api.setMessageReaction("🔥", messageID, () => {}, true);
    }

    const cacheDir = path.join(__dirname, 'cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    try {
      const defaultBikeTags = [
        "4k bike video",
        "superbike aura",
        "zx10r 4k editz",
        "anime bike 4k aura",
        "Anime bike",
        "Anime bike editz",
        "Anime bike aura",
        "Bike aura",
        "Bike aura editz",
        "Fyp bike",
        "Jack bike aura", 
        "Cartoon bike aura",
        "Hd bike 4k", 
        "Bike aura",
        "s1000rr 4k edit",
        "hayabusa attitude edit",
        "bike drifting 4k edit",
        "ktm duke 4k edit",
        "r1m sound edit 4k",
        "bike rider cold moments edit",
        "kawasaki ninja attitude edit",
        "biker boy status video"
      ];

      const isSearch = searchQuery.length > 0;
      let targetTag = isSearch ? `${searchQuery} bike` : defaultBikeTags[Math.floor(Math.random() * defaultBikeTags.length)];
      let notFound = false;

      let res = await axios.get(`https://www.tikwm.com/api/feed/search?keywords=${encodeURIComponent(targetTag)}`);
      let videos = res.data?.data?.videos;

      if (!videos || videos.length === 0) {
        if (isSearch) {
          notFound = true;
          targetTag = defaultBikeTags[Math.floor(Math.random() * defaultBikeTags.length)];
          res = await axios.get(`https://www.tikwm.com/api/feed/search?keywords=${encodeURIComponent(targetTag)}`);
          videos = res.data?.data?.videos;
        }
      }

      if (!videos || videos.length === 0) throw new Error("No bike videos found.");

      let selected = videos.find(v => !global.bikeVideoMemory.has(v.video_id));
      if (!selected) {
        global.bikeVideoMemory.clear();
        selected = videos[Math.floor(Math.random() * videos.length)];
      }
      global.bikeVideoMemory.add(selected.video_id);

      const videoUrl = selected.play || selected.hdplay;
      const pathVideo = path.join(cacheDir, `bike_edit_${Date.now()}.mp4`);

      const response = await axios({
        method: 'get',
        url: videoUrl,
        responseType: 'stream'
      });

      const writer = fs.createWriteStream(pathVideo);
      response.data.pipe(writer);

      writer.on('finish', () => {
        let caption = "";
        if (notFound) {
          caption = `✨ ───────────────── ✨\n` +
                    `ₕₑᵣₑ ᵢₛ ₐ ᵥᵢdₑₒ Fᵣ₏ₘ 𝔐𝔯.𝔎ᵢ𝔫𝔤 ☠️✌🏼\n` +
                    `your search : ${searchQuery} (Results Not Found)\n` +
                    `✨ ───────────────── ✨`;
        } else if (isSearch) {
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
          api.setMessageReaction("☠️", messageID, () => {}, true);
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
      return message.reply("⚠️ | Error fetching bike video. Please try again!");
    }
  }
};

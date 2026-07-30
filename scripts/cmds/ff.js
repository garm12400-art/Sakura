const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const ffVideoMemory = new Set();

function isVipUser(userData) {
  const expires = userData?.data?.vip?.expires;
  return expires && expires > Date.now();
}

module.exports = {
  config: {
    name: "ff",
    aliases: ["ffedit", "freefire"],
    version: "2.1.1",
    author: "Mr.King",
    countDown: 5,
    role: 0,
    category: "vip",
    shortDescription: "Search and get 4K Free Fire videos (VIP Only)",
    guide: "{pn} <search query>"
  },

  onStart: async function ({ api, message, args, event, usersData, role }) {
    const uid = event.senderID;
    const user = await usersData.get(uid);

    // VIP and Bot Admin check (Role 2 / Bot Admin bypasses VIP)
    if (role < 2 && !isVipUser(user)) {
      return message.reply("👑 | This command is for VIP users only!\n\n📌 Use: !vip buy <days> to purchase VIP subscription.");
    }

    const searchQuery = args.join(" ").trim();
    if (!searchQuery) {
      return message.reply("❌ Please provide a search query! Example: !ff rayalo");
    }

    // Reaction Loading Emoji (⏳)
    if (api.setMessageReaction) {
      api.setMessageReaction("⏳", event.messageID, () => {}, true);
    }

    // Search query with 4K edit quality keywords
    const fullSearch = `free fire ${searchQuery} 4k edit`;

    try {
      const res = await axios.get(`https://www.tikwm.com/api/feed/search?keywords=${encodeURIComponent(fullSearch)}`);
      const videos = res.data?.data?.videos;

      if (!videos || videos.length === 0) {
        if (api.setMessageReaction) api.setMessageReaction("❌", event.messageID, () => {}, true);
        return message.reply(`❌ No 4K Free Fire video found for: "${searchQuery}"`);
      }

      // Filter non-repeated video
      let selected = videos.find(v => !ffVideoMemory.has(v.video_id)) || videos[0];
      ffVideoMemory.add(selected.video_id);

      if (ffVideoMemory.size > 100) {
        const firstItem = ffVideoMemory.values().next().value;
        ffVideoMemory.delete(firstItem);
      }

      // Prefer HD/highest quality stream
      const videoUrl = selected.hdplay || selected.play;
      const cachePath = path.join(__dirname, "cache", `ff_${Date.now()}.mp4`);

      if (!fs.existsSync(path.dirname(cachePath))) {
        fs.mkdirSync(path.dirname(cachePath), { recursive: true });
      }

      const videoBuffer = await axios.get(videoUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(cachePath, Buffer.from(videoBuffer.data));

      // Reaction Done Emoji (🌩️)
      if (api.setMessageReaction) {
        api.setMessageReaction("✨", event.messageID, () => {}, true);
      }

      // Send ONLY video attachment without text body & NO AUTO DELETE
      return message.reply({
        attachment: fs.createReadStream(cachePath)
      }, (err) => {
        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
      });

    } catch (err) {
      if (api.setMessageReaction) api.setMessageReaction("❌", event.messageID, () => {}, true);
      return message.reply("❌ Failed to download 4K video. Try again!");
    }
  }
};

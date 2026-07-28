const axios = require("axios");

const API_URL = "https://azadx69x.is-a.dev/API/anihot";

module.exports.config = {
    name: "anihot",
    aliases: ["animehot", "ahot", "🔥"],
    version: "1.0.2",
    author: "Mr.King 🎭",
    role: 0,
    category: "media",
    guide: { en: "Use {p}anihot or comment '🔥' to get a random hot anime picture (VIP Only)." }
};

module.exports.onChat = async ({ api, event, usersData }) => {
    if (event.senderID == api.getCurrentUserID()) return;

    const msg = event.body ? event.body.trim() : "";
    if (msg === "🔥") {
        return handleAniHot(api, event, usersData);
    }
};

module.exports.onStart = async ({ api, event, usersData }) => {
    return handleAniHot(api, event, usersData);
};

async function checkVIP(usersData, uid) {
    if (!usersData) return false;
    try {
        const user = await usersData.get(uid);
        const vipData = user?.data?.vip;
        return !!(vipData && vipData.expires && vipData.expires > Date.now());
    } catch (e) {
        return false;
    }
}

async function handleAniHot(api, event, usersData) {
    const { threadID, messageID, senderID } = event;

    const isVip = await checkVIP(usersData, senderID);
    if (!isVip) {
        return api.sendMessage(
            "• ❌ 𝑻𝒉𝒊𝒔 𝒄𝒐𝒎𝒎𝒂𝒏𝒅 𝒊𝒔 𝒐𝒏𝒍𝒚 𝒇𝒐𝒓 👑 𝑽𝑰𝑷 𝒖𝒔𝒆𝒓𝒔!\n\n📌 𝑼𝒔𝒆 {𝒑}𝒗𝒊𝒑 𝒕𝒐 𝒄𝒉𝒆𝒄𝒌 𝒗𝒊𝒑 𝒑𝒓𝒊𝒄𝒆𝒔 𝒂𝒏𝒅 𝒔𝒖𝒃𝒔𝒄𝒓𝒊𝒃𝒆.",
            threadID,
            messageID
        );
    }

    try {
        api.setMessageReaction("☠️", messageID, () => {}, true);

        // Fetching API response
        const res = await axios.get(API_URL);
        
        let imageUrl = null;

        // Check response type and extract URL dynamically
        if (typeof res.data === "string" && res.data.startsWith("http")) {
            imageUrl = res.data.trim();
        } else if (typeof res.data === "object" && res.data !== null) {
            imageUrl = res.data.url || res.data.image || res.data.link || res.data.result || res.data.data;
        }

        // Direct Stream Fallback if API serves direct media
        const finalUrl = imageUrl || API_URL;

        api.setMessageReaction("🔥", messageID, () => {}, true);
        const stream = await global.utils.getStreamFromURL(finalUrl);

        return api.sendMessage({
            body: `✨ ───────────────── ✨\n` +
                  `ₕₑᵣₑ ᵢₛ 𝒀𝒐𝒖𝒓 𝑨𝒏𝒊𝒎𝒆 𝑯𝒐𝒕 𝑷𝒊𝒄𝒕𝒖𝒓𝒆 𝑭𝒓𝒐𝒎 𝔐𝔯.𝔎ᵢ𝔫𝔤 ☠️✌🏼\n` +
                  `✨ ───────────────── ✨`,
            attachment: [stream]
        }, threadID, (err) => {
            if (err) {
                api.sendMessage("❌ ছবি পাঠাতে সমস্যা হয়েছে!", threadID, messageID);
            }
        }, messageID);

    } catch (err) {
        console.error("AniHot Error:", err);
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage("❌ API থেকে ছবি লোড করতে ব্যর্থ হয়েছে।", threadID, messageID);
    }
}

const axios = require("axios");

const FOLDER_ID = "1t9pkb0h51tyk3Oa2auPoldveKZFqCUBo"; 

// একবার পাঠানো ভিডিও আইডি জমা রাখার জন্য ক্যাশ ফোল্ডার/লিস্ট
if (!global.locoSentVideos) {
    global.locoSentVideos = new Set();
}

module.exports.config = {
    name: "loco",
    aliases: ["localvideo"],
    version: "1.2.0",
    author: "Mr.King ☠️✌🏼",
    role: 0,
    category: "media",
    guide: { en: "Use {p}loco, {p}loco sync, or send '😌' to get a unique random video." }
};

module.exports.onChat = async ({ api, event }) => {
    if (event.senderID == api.getCurrentUserID()) return;

    const msg = event.body ? event.body.trim() : "";
    if (msg === "😌") {
        return handleDriveMedia(api, event);
    }
};

module.exports.onStart = async ({ api, event, args }) => {
    if (args[0] && args[0].toLowerCase() === "sync") {
        return handleDriveSync(api, event);
    }
    return handleDriveMedia(api, event);
};

// ড্রাইভ থেকে সমস্ত ফাইল আইডি বের করার হেলপার ফাংশন
async function fetchFolderFileIds() {
    try {
        const response = await axios.get(`https://drive.google.com/embeddedfolderview?id=${FOLDER_ID}`);
        const htmlData = response.data;
        const fileIds = new Set();

        // Pattern 1: JSON style array matching
        const matches1 = [...htmlData.matchAll(/"([^"]{25,50})"\s*,\s*\[\s*"([^"]+)"/g)];
        matches1.forEach(m => {
            if (m[1] && !m[1].includes("/")) fileIds.add(m[1]);
        });

        // Pattern 2: Standard Drive file URLs
        const matches2 = [...htmlData.matchAll(/\/file\/d\/([a-zA-Z0-9_-]{25,50})/g)];
        matches2.forEach(m => fileIds.add(m[1]));

        // Pattern 3: ID attribute matching
        const matches3 = [...htmlData.matchAll(/id="([a-zA-Z0-9_-]{25,50})"/g)];
        matches3.forEach(m => {
            if (m[1] !== FOLDER_ID) fileIds.add(m[1]);
        });

        return Array.from(fileIds);
    } catch (error) {
        console.error("Fetch Folder Error:", error);
        return [];
    }
}

async function handleDriveSync(api, event) {
    const { threadID, messageID } = event;
    try {
        api.setMessageReaction("⏳", messageID, () => {}, true);

        const allFiles = await fetchFolderFileIds();

        api.setMessageReaction("🪶", messageID, () => {}, true);

        const report = `📁 𝔖𝔶𝔫𝔠 𝔖𝔲𝔠𝔠𝔢𝔰𝔰𝔣𝔲𝔲𝔩!\n\n` +
                       `• 𝖳𝗈𝗍𝖺𝗅 𝖥𝗂𝗅𝖾𝗌 𝖥𝗈𝗎𝗇𝖽: ${allFiles.length}\n` +
                       `• 𝖲𝖾𝗇𝗍 𝖧𝗂𝗌𝗍𝗈𝗋𝖪𝗔/𝖢𝖺𝖼𝗁𝖾: ${global.locoSentVideos.size}/${allFiles.length}`;

        return api.sendMessage(report, threadID, messageID);

    } catch (err) {
        console.error(err);
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage("❌ Error sync!", threadID, messageID);
    }
}

async function handleDriveMedia(api, event) {
    const { threadID, messageID } = event;

    try {
        api.setMessageReaction("⏳", messageID, () => {}, true);

        const allFileIds = await fetchFolderFileIds();

        if (!allFileIds || allFileIds.length === 0) {
            api.setMessageReaction("❌", messageID, () => {}, true);
            return api.sendMessage("📁 Couldn't find any file in drive folder😒!", threadID, messageID);
        }

        // না-পাঠানো ফাইলগুলোর ফিল্টার তালিকা তৈরি
        let unplayedFiles = allFileIds.filter(id => !global.locoSentVideos.has(id));

        // সব ভিডিও একবার করে দেখানো হয়ে গেলে ক্যাশ রিসেট করে নতুন সাইকেল শুরু করা
        if (unplayedFiles.length === 0) {
            global.locoSentVideos.clear();
            unplayedFiles = [...allFileIds];
        }

        // বাকি থাকা ভিডিওগুলোর মধ্যে থেকে র‍্যান্ডম একটি বাছাই করা
        const selectedFileId = unplayedFiles[Math.floor(Math.random() * unplayedFiles.length)];

        // ভিডিও আইডি ক্যাশে সেভ করা যাতে পরবর্তীতে আর রিপিট না হয়
        global.locoSentVideos.add(selectedFileId);

        const downloadUrl = `https://docs.google.com/uc?export=download&id=${selectedFileId}`;

        const stream = await global.utils.getStreamFromURL(downloadUrl);

        api.sendMessage({
            body: `ₕₑᵣₑ ᵢₛ ₐ ᵥᵢdₑₒ Fᵣ₏ₘ 𝔐𝔯.𝔎ᵢ𝔫𝔤 ☠️✌🏼`,
            attachment: [stream]
        }, threadID, (err) => {
            if (!err) {
                api.setMessageReaction("🔥", messageID, () => {}, true);
            } else {
                api.sendMessage("❌ ভিডিওটি পাঠাতে সমস্যা হয়েছে (সাইজ অনেক বড় হতে পারে)!", threadID, messageID);
            }
        }, messageID);

    } catch (err) {
        console.error("Drive Media Error:", err);
        api.setMessageReaction("❌", messageID, () => {}, true);
        api.sendMessage("❌ ড্রাইভ থেকে ভিডিও লোড করতে ব্যর্থ হয়েছে।", threadID, messageID);
    }
            }

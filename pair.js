const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
    config: {
        name: "pair",
        aliases: ["match", "love", "couple"],
        version: "15.0.0",
        author: "Mr.King",
        countDown: 5,
        role: 0,
        category: "fun"
    },

    onChat: async function ({ api, event, usersData }) {
        const { body } = event;
        if (!body) return;
        const msg = body.toLowerCase();
        if (msg === "pair" || msg === "match" || msg === "love" || msg === "couple") {
            return this.onStart({ api, event, usersData });
        }
    },

    onStart: async function ({ api, event, usersData }) {
        const { threadID, messageID, senderID } = event;

        try {
            const threadInfo = await api.getThreadInfo(threadID);
            const participantIDs = threadInfo.participantIDs.filter(id => id !== senderID);

            if (participantIDs.length === 0) return api.sendMessage("⚠️ 𝐍𝐨𝐭 𝐞𝐧𝐨𝐮𝐠𝐡 𝐦𝐞𝐦𝐛𝐞𝐫𝐬!", threadID, messageID);

            const id1 = senderID;
            const id2 = participantIDs[Math.floor(Math.random() * participantIDs.length)];

            const name1 = await usersData.getName(id1);
            const name2 = await usersData.getName(id2);

            const lovePercentage = Math.floor(Math.random() * 100) + 1;
            let loveEmoji = lovePercentage > 70 ? "❤️🔥👑" : "💖👄🌷";

            const captions = [
                "তোর হাসিতেই আমার পুরো পৃথিবী খুঁজে পাই।",
                "তোর নামটা আমার হৃদয়ের পাতায় যত্ন করে লেখা আছে।",
                "ভালোবাসা মানে তোকে এক পলক দেখার অপেক্ষা।",
                "তুই পাশে থাকলেই আমার সব ভয় দূর হয়ে যায়।",
                "ভালোবেসে তোকে আগলে রাখতে চাই সারাজীবন।",
                "এক চিমটি ভালোবাসা আর অনেকটা ভরসা, এটাই আমাদের গল্প।",
                "তোর মাঝেই আমি আমার শান্তির ঠিকানা খুঁজে পাই।",
                "তোর ওই মায়াবী চোখের দিকে তাকিয়ে থাকতে চাই।",
                "ভালোবাসার পূর্ণতা পাক আমাদের এই জুটির মাঝে।",
                "সারাজীবন তোর পাশে ছায়া হয়ে থাকতে চাই।"
            ];
            const randomCaption = captions[Math.floor(Math.random() * captions.length)];

            
            const res = await axios.get("https://nekos.life/api/v2/img/kiss"); 
            const imgUrl = res.data.url;
            const ext = imgUrl.split(".").pop();
            const path = __dirname + `/cache/pair_${threadID}.${ext}`;

            const imageRes = await axios.get(imgUrl, { responseType: "arraybuffer" });
            fs.writeFileSync(path, Buffer.from(imageRes.data, "utf-8"));

            const finalMsg = {
                body: `💞 ( 𝐍𝐞𝐰 𝐂𝐨𝐮𝐩𝐥𝐞 𝐅𝐨𝐮𝐧𝐝 )\n━━━━━━━━━━━━━━━━━━\n👩‍❤️‍👨 | 𝐏𝐚𝐢𝐫: ${name1} ❤️ ${name2}\n📜 | 𝐂𝐚𝐩𝐭𝐢𝐨𝐧: ${randomCaption}\n📊 | 𝐋𝐨𝐯𝐞 𝐏𝐞𝐫𝐜𝐞𝐧𝐭𝐚𝐠𝐞: ${lovePercentage}% ${loveEmoji}\n━━━━━━━━━━━━━━━━━━\n• 𝐌𝐫.𝐊𝐢𝐧𝐠 𝐒𝐲𝐬𝐭𝐞𝐦🐉`,
                mentions: [{ tag: name1, id: id1 }, { tag: name2, id: id2 }],
                attachment: fs.createReadStream(path)
            };

            return api.sendMessage(finalMsg, threadID, () => {
                if (fs.existsSync(path)) fs.unlinkSync(path);
            }, messageID);

        } catch (err) {
            return api.sendMessage("❌ 𝐄𝐫𝐫𝐨𝐫!", threadID, messageID);
        }
    }
};
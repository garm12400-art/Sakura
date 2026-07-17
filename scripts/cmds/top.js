// Banner Image: https://files.catbox.moe/ixj7u8.jpg

const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

function cleanName(name) {
    if (!name) return "Facebook User";
    
   
    let cleaned = name.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/gu, '');
    
    // ইউনিকোড স্টাইলিশ ম্যাথমেটিকাল/বোল্ড/ইটালিক ক্যারেক্টার নরমাল অক্ষরে কনভার্ট করা
    cleaned = cleaned.normalize("NFKD");
    
    // শুধুমাত্র রিডেবল ক্যারেক্টার রাখা (ইংরেজি, বাংলা, নাম্বার এবং নরমাল স্পেস)
    cleaned = cleaned.replace(/[^\x20-\x7E\u0980-\u09FF]/g, '').trim();
    
    // নাম যদি সম্পূর্ণ ফাঁকা হয়ে যায় বা বক্স টাইপ থাকে, তবে একটি ডিফল্ট নাম দেওয়া
    if (cleaned.length === 0) {
        return "Regular User";
    }
    return cleaned;
}

module.exports = {
  config: {
    name: "top",
    aliases: ["leaderboard", "topmoney"],
    version: "1.1.0",
    author: "Mr. King",
    role: 0,
    shortDescription: "Display top 15 richest users with clean, readable names",
    longDescription: "Fetches economy balances and renders top 15 users filtering broken/fancy fonts into clean text.",
    category: "economy",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ api, event, messageID, usersData }) {
    const { threadID } = event;

    try {
      const allUsers = await usersData.getAll();
      if (!allUsers || allUsers.length === 0) {
        return api.sendMessage("❌ | NO USER DATA FOUND IN DATABASE!", threadID, messageID);
      }

      const sortedUsers = allUsers
        .map(u => ({
          id: u.userID,
          name: cleanName(u.name), // নাম ফিল্টার করে ক্লীন করা হচ্ছে
          money: parseInt(u.money || 0, 10)
        }))
        .sort((a, b) => b.money - a.money)
        .slice(0, 15);

      const width = 900;
      const height = 750;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // সলিড ব্ল্যাক ব্যাকগ্রাউন্ড
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, width, height);

      // ব্যাকগ্রাউন্ড নিওন লাইট ইফেক্ট
      ctx.strokeStyle = "#00f0ff";
      ctx.lineWidth = 4;
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#00f0ff";
      ctx.beginPath();
      ctx.moveTo(30, 30);
      ctx.lineTo(870, 30);
      ctx.stroke();

      ctx.shadowBlur = 0; // শ্যাডো রিসেট

      // হেডার টেক্সট
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 32px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("RICHEST USERS LEADERBOARD", 450, 80);

      const drawPodiumAvatar = async (uid, x, y, radius, borderColor, rankText) => {
        const avatarUrl = `https://graph.facebook.com/${uid}/picture?width=500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        try {
          const img = await loadImage(avatarUrl);
          ctx.save();
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(img, x - radius, y - radius, radius * 2, radius * 2);
          ctx.restore();
        } catch (e) {
          ctx.fillStyle = "#333333";
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.save();
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 5;
        ctx.shadowBlur = 10;
        ctx.shadowColor = borderColor;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = borderColor;
        ctx.beginPath();
        ctx.arc(x, y + radius, 18, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#000000";
        ctx.font = "bold 16px Arial, sans-serif";
        ctx.fillText(rankText, x, y + radius + 6);
      };

      // টপ ৩ পজিশন রেন্ডার
      if (sortedUsers[0]) {
        await drawPodiumAvatar(sortedUsers[0].id, 450, 200, 60, "#ffd700", "1st");
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 18px Arial, sans-serif";
        ctx.fillText(sortedUsers[0].name.substring(0, 15), 450, 285);
        ctx.fillStyle = "#ffd700";
        ctx.font = "16px Arial, sans-serif";
        ctx.fillText(`$${sortedUsers[0].money.toLocaleString()}`, 450, 305);
      }

      if (sortedUsers[1]) {
        await drawPodiumAvatar(sortedUsers[1].id, 250, 230, 50, "#c0c0c0", "2nd");
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 16px Arial, sans-serif";
        ctx.fillText(sortedUsers[1].name.substring(0, 12), 250, 305);
        ctx.fillStyle = "#c0c0c0";
        ctx.font = "14px Arial, sans-serif";
        ctx.fillText(`$${sortedUsers[1].money.toLocaleString()}`, 250, 325);
      }

      if (sortedUsers[2]) {
        await drawPodiumAvatar(sortedUsers[2].id, 650, 230, 50, "#cd7f32", "3rd");
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 16px Arial, sans-serif";
        ctx.fillText(sortedUsers[2].name.substring(0, 12), 650, 305);
        ctx.fillStyle = "#cd7f32";
        ctx.font = "14px Arial, sans-serif";
        ctx.fillText(`$${sortedUsers[2].money.toLocaleString()}`, 650, 325);
      }

      // বাকি ১২ জনের লিস্ট রেন্ডার
      ctx.textAlign = "left";
      let startY = 380;
      const colWidth = 380;
      const rowHeight = 50;

      for (let i = 3; i < sortedUsers.length; i++) {
        const user = sortedUsers[i];
        const col = (i - 3) % 2; 
        const row = Math.floor((i - 3) / 2);

        const currentX = col === 0 ? 80 : 500;
        const currentY = startY + (row * rowHeight);

        ctx.fillStyle = "#111111";
        ctx.fillRect(currentX, currentY - 25, colWidth, 40);
        ctx.strokeStyle = "#ff007f";
        ctx.lineWidth = 1;
        ctx.strokeRect(currentX, currentY - 25, colWidth, 40);

        ctx.fillStyle = "#ff007f";
        ctx.font = "bold 18px Arial, sans-serif";
        ctx.fillText(`#${i + 1}`, currentX + 15, currentY);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 16px Arial, sans-serif";
        ctx.fillText(user.name.substring(0, 18), currentX + 60, currentY);

        ctx.textAlign = "right";
        ctx.fillStyle = "#00f0ff";
        ctx.font = "16px Arial, sans-serif";
        ctx.fillText(`$${user.money.toLocaleString()}`, currentX + colWidth - 15, currentY);
        ctx.textAlign = "left"; 
      }

      ctx.textAlign = "center";
      ctx.fillStyle = "#444444";
      ctx.font = "bold 16px Arial, sans-serif";
      ctx.fillText("OWNER: MR. KING 👑", 450, 720);

      const cacheDir = path.join(__dirname, "cache");
      const filePath = path.join(cacheDir, `top_${Date.now()}.png`);
      await fs.ensureDir(cacheDir);

      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(filePath, buffer);

      await api.sendMessage({
        attachment: fs.createReadStream(filePath)
      }, threadID, () => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        if (global.gc) global.gc();
        else if (process.gc) process.gc();
      }, messageID);

    } catch (error) {
      console.error(error);
      return api.sendMessage("❌ | TOP LEADERBOARD CORE SYSTEM ERROR!", threadID, messageID);
    }
  }
};

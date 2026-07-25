const axios = require("axios");
const { getPrefix } = global.utils;
const { commands } = global.GoatBot;

let xfont = null;
let yfont = null;
let categoryEmoji = null;

/* ───── Load Fonts & Emoji ───── */
async function loadResources() {
  try {
    const [x, y, c] = await Promise.all([
      axios.get("https://raw.githubusercontent.com/Saim-x69x/sakura/main/xfont.json"),
      axios.get("https://raw.githubusercontent.com/Saim-x69x/sakura/main/yfont.json"),
      axios.get("https://raw.githubusercontent.com/Saim-x69x/sakura/main/category.json")
    ]);
    xfont = x.data;
    yfont = y.data;
    categoryEmoji = c.data;
  } catch (e) {
    console.error("[HELP] Resource load failed");
  }
}

/* ───── Font Convert ───── */
function fontConvert(text, type = "command") {
  const map = type === "category" ? xfont : yfont;
  if (!map) return text;
  return text.split("").map(c => map[c] || c).join("");
}

function getCategoryEmoji(cat) {
  return categoryEmoji?.[cat.toLowerCase()] || "🗂️";
}

function roleText(role) {
  if (role === 0) return "All Users";
  if (role === 1) return "Group Admins";
  if (role === 2) return "Bot Admin";
  return "Unknown";
}

/* ───── Command Find ───── */
function findCommand(name) {
  name = name.toLowerCase();
  for (const [, cmd] of commands) {
    const a = cmd.config?.aliases;
    if (cmd.config?.name === name) return cmd;
    if (Array.isArray(a) && a.includes(name)) return cmd;
    if (typeof a === "string" && a === name) return cmd;
  }
  return null;
}

/* ───── Auto Unsend Helper ───── */
function sendAutoDeleteMessage(api, message, content) {
  return message.reply(content, (err, info) => {
    if (!err && info && info.messageID) {
      setTimeout(() => {
        if (api.unsendMessage) {
          api.unsendMessage(info.messageID);
        }
      }, 20000);
    }
  });
}

module.exports = {
  config: {
    name: "help",
    aliases: ["menu"],
    version: "2.2.0",
    author: "Saimx69x | fixed by Aphelion & Mr.King",
    role: 0,
    category: "info",
    shortDescription: "Show all commands with pagination (Auto Delete in 20s)",
    guide: "{pn} | {pn} <page_number> | {pn} <command> | {pn} -c <category>"
  },

  onStart: async function ({ api, message, args, event, role }) {
    if (!xfont || !yfont || !categoryEmoji) await loadResources();

    const prefix = getPrefix(event.threadID);
    const input = args.join(" ").trim();

    /* ───── Collect Commands & Categories ───── */
    const categories = {};
    const allAllowedCmds = [];

    for (const [name, cmd] of commands) {
      if (!cmd?.config || cmd.config.role > role) continue;
      const cat = (cmd.config.category || "UNCATEGORIZED").toUpperCase();
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push({ name, cat });
      allAllowedCmds.push({ name, cat });
    }

    allAllowedCmds.sort((a, b) => a.name.localeCompare(b.name));

    /* ───── Category View ───── */
    if (args[0] === "-c" && args[1]) {
      const cat = args[1].toUpperCase();
      if (!categories[cat])
        return sendAutoDeleteMessage(api, message, `❌ Category "${cat}" not found`);

      let msg = `✨ ───────────────── ✨\n`;
      msg += `📂 ${getCategoryEmoji(cat)} ${fontConvert(cat, "category")}\n`;
      msg += `✨ ───────────────── ✨\n\n`;

      for (const item of categories[cat].sort((a, b) => a.name.localeCompare(b.name)))
        msg += ` 🌸 • ${fontConvert(item.name)}\n`;

      msg += `\n✨ ───────────────── ✨\n`;
      msg += `📊 Total: ${categories[cat].length} Commands\n`;
      msg += `⚡ Prefix: ${prefix}\n`;
      msg += `⏳ Auto deleting in 20 seconds...`;

      return sendAutoDeleteMessage(api, message, msg);
    }

    /* ───── Pagination Check ───── */
    const isNum = !isNaN(args[0]) && args[0].trim() !== "";
    if (!input || isNum) {
      const page = isNum ? parseInt(args[0]) : 1;
      const limit = 10;
      const totalCmds = allAllowedCmds.length;
      const totalPages = Math.ceil(totalCmds / limit);

      if (page < 1 || page > totalPages) {
        return sendAutoDeleteMessage(api, message, `❌ Invalid Page Number! Page must be between 1 and ${totalPages}.`);
      }

      const start = (page - 1) * limit;
      const pageCmds = allAllowedCmds.slice(start, start + limit);

      let msg = `✨ ─── 『 ₘₑₙᵤ CₒₘₘₐₙDₛ 』 ─── ✨\n\n`;

      pageCmds.forEach((item, idx) => {
        const catEmoji = getCategoryEmoji(item.cat);
        msg += ` [${start + idx + 1}] ${catEmoji} ${fontConvert(item.name)}\n`;
      });

      msg += `\n✨ ───────────────── ✨\n`;
      msg += `📖 Page : ${page}/${totalPages}\n`;
      msg += `📊 Total Commands : ${totalCmds}\n`;
      msg += `💡 Type : ${prefix}help <page>\n`;
      msg += `⚡ Prefix : ${prefix}\n`;
      msg += `👤 Maintainer : 𝔐𝔯.𝔎𝔦𝔫𝔤 ☠️✌🏼\n`;
      msg += `⏳ Auto deleting in 20 seconds...\n`;
      msg += `✨ ───────────────── ✨`;

      return sendAutoDeleteMessage(api, message, msg);
    }

    /* ───── Command Info ───── */
    const cmd = findCommand(input);
    if (!cmd) return sendAutoDeleteMessage(api, message, `❌ Command "${input}" not found`);

    const c = cmd.config;
    const aliasText = Array.isArray(c.aliases)
      ? c.aliases.join(", ")
      : c.aliases || "None";

    let usage = "No usage";
    if (c.guide) {
      if (typeof c.guide === "string") {
        usage = c.guide;
      } else if (typeof c.guide === "object") {
        usage = c.guide.en || Object.values(c.guide)[0] || "No usage";
      }
      usage = usage.replace(/{pn}/g, `${prefix}${c.name}`);
    }

    const msg = `
╭─── COMMAND INFO ───╮
🔹 Name : ${c.name}
📂 Category : ${(c.category || "UNCATEGORIZED").toUpperCase()}
📜 Description : ${c.longDescription || c.shortDescription || "N/A"}
🔁 Aliases : ${aliasText}
⚙️ Version : ${c.version || "1.0"}
🔐 Permission : ${roleText(c.role)}
⏱️ Cooldown : ${c.countDown || 5}s
👑 Author : ${c.author || "Unknown"}
📖 Usage : ${usage}
⏳ Auto deleting in 20 seconds...
╰───────────────────╯`;

    return sendAutoDeleteMessage(api, message, msg);
  }
};

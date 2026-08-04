// Fancy Font Generator Function (𝓐𝓵𝓲𝔂𝓪 ♡ Style)
const toFancyFont = (str) => {
  const map = {
    'a': '𝓪', 'b': '𝓫', 'c': '𝓬', 'd': '𝓭', 'e': '𝓮', 'f': '𝓯', 'g': '𝓰', 'h': '𝓱', 'i': '𝓲', 'j': '𝓳', 'k': '𝓴', 'l': '𝓵', 'm': '𝓶', 'n': '𝓷', 'o': '𝓸', 'p': '𝓹', 'q': '𝓺', 'r': '𝓻', 's': '𝓼', 't': '𝓽', 'u': '𝓾', 'v': '𝓿', 'w': '𝔀', 'x': '𝓔', 'y': '𝔂', 'z': '𝔃',
    'A': '𝓐', 'B': '𝓑', 'C': '𝓒', 'D': '𝓓', 'E': '𝓔', 'F': 'scal', 'G': '𝓖', 'H': '𝓗', 'I': '𝓘', 'J': '𝓙', 'K': '𝓆', 'L': '𝓛', 'M': '𝓜', 'N': '𝓝', 'O': '𝓞', 'P': '𝓟', 'Q': '𝓠', 'R': '𝓡', 'S': '𝓢', 'T': '𝓯', 'U': '𝓭', 'V': '𝓥', 'W': ' any', 'X': '𝓧', 'Y': '𝓨', 'Z': '𝓩',
    '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿'
  };
  return str.split('').map(c => map[c] || c).join('');
};

module.exports = {
  config: {
    name: "pakhi",
    version: "1.0",
    author: "Mr.King",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Pakhi list management script" },
    longDescription: { en: "Add members to pakhi list and remove non-pakhi members from group" },
    category: "group",
    guide: {
      en: "{p}pakhi -a [reply/mention/UID]\n" +
          "{p}pakhi -r\n" +
          "{p}pakhi list\n" +
          "{p}pakhi me"
    }
  },

  onStart: async function ({ api, event, args, threadsData, usersData, message, role }) {
    const { threadID, senderID, messageReply, mentions } = event;

    // Get thread data
    const threadInfo = await threadsData.get(threadID);
    const data = threadInfo.data || {};
    if (!data.pakhiList) data.pakhiList = [];

    // Helper: Target ID Filter (Reply, Mention, UID)
    const getTargetID = () => {
      if (messageReply) return messageReply.senderID;
      if (Object.keys(mentions).length > 0) return Object.keys(mentions)[0];
      if (args[1] && !isNaN(args[1])) return args[1];
      return null;
    };

    /* ───────── PAKHI -A (ADD USER) ───────── */
    if (args[0] === "-a") {
      const targetID = getTargetID();
      if (!targetID) {
        return message.reply(`• ❌ ${toFancyFont("Please reply, mention, or give a valid UID!")}`);
      }

      if (data.pakhiList.includes(targetID)) {
        const name = await usersData.getName(targetID);
        return message.reply(`• ⚠️ ${toFancyFont(name)} ${toFancyFont("is already in the Pakhi list!")}`);
      }

      data.pakhiList.push(targetID);
      await threadsData.set(threadID, { data });
      const name = await usersData.getName(targetID);

      return message.reply(`• ✅ ${toFancyFont(name)} ${toFancyFont("added to Pakhi list ♡")}`);
    }

    /* ───────── PAKHI ME (SELF ADD) ───────── */
    if (args[0] === "me") {
      if (data.pakhiList.includes(senderID)) {
        return message.reply(`• ⚠️ ${toFancyFont("You are already in the Pakhi list ♡")}`);
      }

      data.pakhiList.push(senderID);
      await threadsData.set(threadID, { data });
      const name = await usersData.getName(senderID);

      return message.reply(`• ✅ ${toFancyFont(name)} ${toFancyFont("you added yourself to Pakhi list ♡")}`);
    }

    /* ───────── PAKHI LIST (SHOW LIST) ───────── */
    if (args[0] === "list") {
      if (!data.pakhiList || data.pakhiList.length === 0) {
        return message.reply(`• ⚠️ ${toFancyFont("Pakhi list is empty ♡")}`);
      }

      let msg = `✨ ${toFancyFont("Pakhi List")} ♡ ✨\n\n`;
      let count = 1;

      for (const id of data.pakhiList) {
        const name = await usersData.getName(id);
        msg += `╭‣ ${count++}. ${toFancyFont(name)}\n`;
      }

      return message.reply(msg);
    }

    /* ───────── PAKHI -R (REMOVE NON-PAKHI MEMBERS) ───────── */
    if (args[0] === "-r") {
      // Check Admin Role for user executing this sensitive action
      if (role < 1) {
        return message.reply(`• ❌ ${toFancyFont("Only Group Admins can use this command!")}`);
      }

      // Fetch Bot ID & Bot Admin status in group
      const botID = api.getCurrentUserID();
      const groupInfo = await api.getThreadInfo(threadID);
      const adminIDs = groupInfo.adminIDs.map(i => i.id);

      if (!adminIDs.includes(botID)) {
        return message.reply(`• ❌ ${toFancyFont("Bot must be an Admin to remove members!")}`);
      }

      const allMembers = groupInfo.participantIDs;
      
      // Filter out members who are NOT in pakhiList AND NOT Bot itself
      const targetsToRemove = allMembers.filter(id => !data.pakhiList.includes(id) && id !== botID);

      if (targetsToRemove.length === 0) {
        return message.reply(`• ✅ ${toFancyFont("All members are in the Pakhi list! No one to remove.")}`);
      }

      message.reply(`• ⏳ ${toFancyFont("Removing non-Pakhi members...")}`);

      let removedCount = 0;
      for (const uid of targetsToRemove) {
        try {
          await api.removeUserFromGroup(uid, threadID);
          removedCount++;
          await new Promise(resolve => setTimeout(resolve, 1000)); // Delay to prevent spam blocks
        } catch (err) {
          console.error(`Failed to remove ${uid}:`, err);
        }
      }

      return message.reply(`• ✅ ${toFancyFont(`Successfully removed ${removedCount} non-Pakhi members ♡`)}`);
    }

    /* ───────── DEFAULT GUIDE ───────── */
    return message.reply(
      `✨ ${toFancyFont("Pakhi System Menu")} ♡ ✨\n\n` +
      `╭‣ ${toFancyFont("pakhi -a [reply/mention/UID]")}\n` +
      `╭‣ ${toFancyFont("pakhi me")}\n` +
      `╭‣ ${toFancyFont("pakhi list")}\n` +
      `╰‣ ${toFancyFont("pakhi -r")}`
    );
  }
};
      

const axios = require("axios");

module.exports = {
  config: {
    name: "addby",
    version: "1.0.0",
    author: "Mr. King",
    role: 0,
    shortDescription: "Check who added a user to the group",
    longDescription: "Reply to a user or mention them to find out who added them to the group chat.",
    category: "group",
    guide: { en: "{pn} @mention or reply to a user's message" }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, senderID, messageReply, mentions } = event;

    let targetID = null;

    if (messageReply) {
      targetID = messageReply.senderID;
    } else if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (args[0]) {
      targetID = args[0];
    } else {
      targetID = senderID;
    }

    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const { participantIDs } = threadInfo;

      if (!participantIDs.includes(targetID)) {
        return api.sendMessage("❌ | Target user is not in this group.", threadID, messageID);
      }

      // Fetching thread logs/history to find the adding event
      api.getThreadHistory(threadID, 50, undefined, async (err, history) => {
        if (err) {
          return api.sendMessage("❌ | Unable to fetch group history.", threadID, messageID);
        }

        const log = history.find(
          msg => msg.type === "event" && 
                 msg.logMessageType === "log:subscribe" && 
                 msg.logMessageData.addedParticipants.some(p => p.userFbId === targetID)
        );

        if (!log) {
          return api.sendMessage("ℹ️ | Could not find who added this user in recent history. They might have joined via link or added long ago.", threadID, messageID);
        }

        const authorID = log.author;
        
        let targetName = "User";
        let authorName = "Someone";

        try {
          const userNames = await api.getUserInfo([targetID, authorID]);
          targetName = userNames[targetID]?.name || "User";
          authorName = userNames[authorID]?.name || "Unknown Admin/User";
        } catch (e) {}

        if (authorID === targetID) {
          return api.sendMessage(`✨ | ${targetName} joined the group via invitation link or approval request.`, threadID, messageID);
        }

        return api.sendMessage(`👤 | User: ${targetName}\n📥 | Added by: ${authorName}`, threadID, messageID);
      });

    } catch (error) {
      return api.sendMessage("❌ | An error occurred while processing the request.", threadID, messageID);
    }
  }
};

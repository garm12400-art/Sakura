 module.exports = {
  config: {
    name: "offbot",
    version: "1.0",
    author: "Mr.King",
    countDown: 45,
    role: 0,
    shortDescription: "Turn off bot",
    longDescription: "Turn off bot",
    category: "admin",
    guide: "{p}{n}"
  },
  onStart: async function ({event, api}) {
    const permission = [ "61591264419890" ];
  if (!permission.includes(event.senderID)) {
    api.sendMessage("╔════ஜ۩۞۩ஜ═══╗\nYou don't have permission to use this command.\n═══ஜ۩۞۩ஜ═══╝", event.threadID, event.messageID);
    return;
  }
    api.sendMessage("╔════ஜ۩۞۩ஜ════╗\n✅ Successfully Turned Off\n╚════ஜ۩۞۩ஜ════╝",event.threadID, () =>process.exit(0))}
};

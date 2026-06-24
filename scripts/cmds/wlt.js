const { config } = global.GoatBot;
const { client } = global;
const { writeFileSync } = require("fs-extra");

module.exports = {
	config: {
		name: "whitelistthread",
		aliases: ["wlt"],
		version: "1.5.3",
		author: "NTKhang & Arafat",
		countDown: 5,
		role: 2,
		description: {
			en: "Only whitelisted threads can use the bot when mode is ON."
		},
		category: "admin",
		guide: {
			en: '   {pn} [add | -a] [<tid>]: Add thread to whitelist'
				+ '\n   {pn} [remove | -r] [<tid>]: Remove thread from whitelist'
				+ '\n   {pn} list: Show all whitelisted threads'
				+ '\n   {pn} mode [on|off]: Enable/Disable whitelist only mode'
		}
	},

	langs: {
		en: {
			added: `\n╭─✦✅ | 𝙰𝚍𝚍𝚎𝚍 %1 𝚝𝚑𝚛𝚎𝚊𝚍/𝚜\n%2`,
			alreadyAdmin: `╭✦⚠️ | 𝙰𝚕𝚛𝚎𝚊𝚍𝚢 𝚒𝚗 𝚆𝚑𝚒𝚝𝚎𝙻𝚒𝚜𝚝\n%1\n`,
			missingAdd: "⚠️ | 𝚄𝚜𝚊𝚐𝚎: {pn} add <tid> | remove <tid> | mode <on/off>",
			removed: `\n╭✦✅ | 𝚁𝚎𝚖𝚘𝚟𝚎𝚍 %1 𝚝𝚑𝚛𝚎𝚊𝚍/𝚜\n%2`,
			notAdmin: `╭✦❎ | 𝙽𝚘𝚝 𝚒𝚗 𝚆𝚑𝚒𝚝𝚎𝙻𝚒𝚜𝚝\n%1\n`,
			listAdmin: `╭✦✨ | 𝙿𝚎𝚛𝚖𝚊𝚗𝚎𝚗𝚝 𝚆𝚑𝚒𝚝𝚎𝙻𝚒𝚜𝚝\n%1\n╰─────────────────⧕`,
			turnedOn: "✅ | 𝚆𝚑𝚒𝚝𝚎𝙻𝚒𝚜𝚝 𝙼𝚘𝚍𝚎: 𝙾𝙽\n> 𝙾𝚗𝚕𝚢 𝚠𝚑𝚒𝚝𝚎𝚕𝚒𝚜𝚝𝚎𝚍 𝚐𝚛𝚘𝚞𝚙𝚜 𝚌𝚊𝚗 𝚗𝚘𝚠 𝚞𝚜𝚎 𝚝𝚑𝚎 𝚋𝚘𝚝.",
			turnedOff: "❎ | 𝚆𝚑𝚒𝚝𝚎𝙻𝚒𝚜𝚝 𝙼𝚘𝚍𝚎: 𝙾𝙵𝙵\n> 𝙰𝚕𝚕 𝚐𝚛𝚘𝚞𝚙𝚜 𝚌𝚊𝚗 𝚗𝚘𝚠 𝚞𝚜𝚎 𝚝𝚑𝚎 𝚋𝚘𝚝.",
			notAdminMsg: ">❌ 𝐁𝐚𝐛𝐲, 𝐨𝐧𝐥𝐲 𝐦𝐲 𝐚𝐝𝐦𝐢𝐧 𝐜𝐚𝐧 𝐮𝐬𝐞 𝐭𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝."
		}
	},

	onStart: async function ({ message, args, event, getLang, api }) {
		// Admin Security
		if (!config.adminBot.includes(event.senderID)) {
			return message.reply(getLang("notAdminMsg"));
		}

		// Ensure config structure exists
		if (!config.whiteListModeThread) {
			config.whiteListModeThread = { enable: true, whiteListThreadIds: [] };
		}

		const action = args[0]?.toLowerCase();

		switch (action) {
			case "add":
			case "-a": {
				let tids = args.slice(1).filter(arg => !isNaN(arg));
				if (tids.length <= 0) tids.push(event.threadID);

				const toAdd = [], alreadyThere = [];
				for (const tid of tids) {
					if (config.whiteListModeThread.whiteListThreadIds.includes(tid))
						alreadyThere.push(tid);
					else
						toAdd.push(tid);
				}

				config.whiteListModeThread.whiteListThreadIds.push(...toAdd);
				
				const getNames = await Promise.all(tids.map(async tid => {
					try {
						const info = await api.getThreadInfo(tid);
						return { tid, name: (info && info.threadName) ? info.threadName : "Unknown Group" };
					} catch (e) {
						return { tid, name: "Inaccessible Group" };
					}
				}));

				writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

				return message.reply(
					(toAdd.length > 0 ? getLang("added", toAdd.length,
						getNames.filter(({ tid }) => toAdd.includes(tid))
							.map(({ tid, name }) => `├‣ 𝙽𝙰𝙼𝙴: ${name}\n╰‣ 𝙸𝙳: ${tid}`).join("\n")) : "") +
					(alreadyThere.length > 0 ? getLang("alreadyAdmin", 
						alreadyThere.map(tid => `╰‣ 𝙸𝙳: ${tid}`).join("\n")) : "")
				);
			}

			case "remove":
			case "rm":
			case "-r": {
				let tids = args.slice(1).filter(arg => !isNaN(arg));
				if (tids.length <= 0) tids.push(event.threadID);

				const removed = [], notInList = [];
				for (const tid of tids) {
					if (config.whiteListModeThread.whiteListThreadIds.includes(tid))
						removed.push(tid);
					else
						notInList.push(tid);
				}

				removed.forEach(tid => {
					const index = config.whiteListModeThread.whiteListThreadIds.indexOf(tid);
					if (index > -1) config.whiteListModeThread.whiteListThreadIds.splice(index, 1);
				});

				const getNames = await Promise.all(removed.map(async tid => {
					try {
						const info = await api.getThreadInfo(tid);
						return { tid, name: (info && info.threadName) ? info.threadName : "Unknown Group" };
					} catch (e) {
						return { tid, name: "Deleted Group" };
					}
				}));

				writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

				return message.reply(
					(removed.length > 0 ? getLang("removed", removed.length,
						getNames.map(({ tid, name }) => `├‣ 𝙽𝙰𝙼𝙴: ${name}\n╰‣ 𝙸𝙳: ${tid}`).join("\n")) : "") +
					(notInList.length > 0 ? getLang("notAdmin", 
						notInList.map(tid => `╰‣ 𝙸𝙳: ${tid}`).join("\n")) : "")
				);
			}

			case "list":
			case "-l": {
				if (config.whiteListModeThread.whiteListThreadIds.length === 0) {
					return message.reply("✨ | The WhiteList is empty.");
				}

				const getNames = await Promise.all(config.whiteListModeThread.whiteListThreadIds.map(async tid => {
					try {
						const info = await api.getThreadInfo(tid);
						return { tid, name: (info && info.threadName) ? info.threadName : "Unknown Group" };
					} catch (e) {
						return { tid, name: "Unknown" };
					}
				}));

				return message.reply(getLang("listAdmin",
					getNames.map(({ tid, name }) => `├‣ 𝙽𝙰𝙼𝙴: ${name}\n├‣ 𝙸𝙳: ${tid}`).join("\n")));
			}

			case "mode":
			case "-m":
			case "m": {
				const setting = args[1]?.toLowerCase(
module.exports = {
	config: {
		name: "stock",
		aliases: ["market", "invest"],
		version: "4.0.0",
		author: "Mr.King",
		countDown: 5,
		role: 0,
		description: { en: "Multi-company stock market with portfolio balance" },
		category: "economy",
		guide: { en: "{pn} list | {pn} balance | {pn} <company> | {pn} buy <company> <amount> | {pn} sell <company> <amount>" }
	},

	onStart: async function ({ api, event, args, usersData, threadsData, message }) {
		const { threadID, senderID } = event;
		const { data } = await threadsData.get(threadID);

		const companies = ["Apple", "Tesla", "Google", "Microsoft", "Amazon", "Meta", "Netflix", "Nvidia", "SpaceX", "Samsung"];
		
		if (!data.stocks) {
			data.stocks = {};
			companies.forEach(c => {
				data.stocks[c] = { price: 500, history: [500, 480, 510, 490, 500] };
			});
		}

		const parseAmount = (str, limit) => {
			if (!str) return 0;
			if (str.toLowerCase() === "all") return limit;
			let amount = parseFloat(str);
			if (str.endsWith('k')) amount *= 1000;
			else if (str.endsWith('m')) amount *= 1000000;
			else if (str.endsWith('b')) amount *= 1000000000;
			else if (str.endsWith('t')) amount *= 1000000000000;
			return Math.floor(amount);
		};

		const formatMoney = (n) => {
			if (n >= 1e12) return (n / 1e12).toFixed(2) + "𝐭";
			if (n >= 1e9) return (n / 1e9).toFixed(2) + "𝐛";
			if (n >= 1e6) return (n / 1e6).toFixed(2) + "𝐦";
			if (n >= 1e3) return (n / 1e3).toFixed(2) + "𝐤";
			return n.toLocaleString();
		};

		// ১. স্টক ব্যালেন্স চেক (Portfolio Balance)
		if (args[0] === "balance" || args[0] === "bal") {
			const userData = await usersData.get(senderID);
			const portfolio = userData.data.portfolio || {};
			let totalValue = 0;
			let balMsg = "💼 𝐒𝐓𝐎𝐂𝐊 𝐏𝐎𝐑𝐓𝐅𝐎𝐋𝐈𝐎 𝐁𝐀𝐋𝐀𝐍𝐂𝐄 💼\n━━━━━━━━━━━━━━━━━━\n";
			
			for (const [name, units] of Object.entries(portfolio)) {
				if (units > 0) {
					const value = units * data.stocks[name].price;
					totalValue += value;
					balMsg += `🏢 ${name}: ${formatMoney(units)} 𝐒𝐭𝐨𝐜𝐤𝐬 ($${formatMoney(value)})\n`;
				}
			}
			
			if (totalValue === 0) balMsg += "❌ 𝐘𝐨𝐮 𝐡𝐚𝐯𝐞 𝐧𝐨 𝐢𝐧𝐯𝐞𝐬𝐭𝐦𝐞𝐧𝐭𝐬 𝐲𝐞𝐭!";
			balMsg += `\n💰 𝐓𝐨𝐭𝐚𝐥 𝐈𝐧𝐯𝐞𝐬𝐭𝐞𝐝: $${formatMoney(totalValue)}\n━━━━━━━━━━━━━━━━━━\n👑 𝐀𝐝𝐦𝐢𝐧: 𝐌𝐫.𝐊𝐢𝐧𝐠`;
			return message.reply(balMsg);
		}

		// ২. কোম্পানির লিস্ট দেখা (Randomly Price Update)
		if (args[0] === "list" || args.length === 0) {
			let listMsg = "📈 𝐒𝐓𝐎𝐂𝐊 𝐌𝐀𝐑𝐊𝐄𝐓 𝐋𝐈𝐒𝐓 📉\n━━━━━━━━━━━━━━━━━━\n";
			companies.forEach(c => {
				const change = Math.floor(Math.random() * 101) - 50; 
				data.stocks[c].price = Math.max(10, data.stocks[c].price + change);
				listMsg += `🏢 ${c}: $${formatMoney(data.stocks[c].price)}\n`;
			});
			await threadsData.set(threadID, { data });
			listMsg += "━━━━━━━━━━━━━━━━━━\n💡 𝐔𝐬𝐞: /𝐬𝐭𝐨𝐜𝐤 <𝐜𝐨𝐦𝐩𝐚𝐧𝐲> 𝐭𝐨 𝐬𝐞𝐞 𝐝𝐞𝐭𝐚𝐢𝐥𝐬\n👑 𝐀𝐝𝐦𝐢𝐧: 𝐌𝐫.𝐊𝐢𝐧𝐠";
			return message.reply(listMsg);
		}

		const companyName = args[0].charAt(0).toUpperCase() + args[0].slice(1).toLowerCase();
		if (!companies.includes(companyName) && !["buy", "sell"].includes(args[0])) {
			return message.reply("❌ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐜𝐨𝐦𝐩𝐚𝐧𝐲 𝐧𝐚𝐦𝐞 𝐨𝐫 𝐜𝐨𝐦𝐦𝐚𝐧𝐝!");
		}

		// ৩. কোম্পানির ডিটেইলস এবং গ্রাফ
		if (companies.includes(companyName) && args.length === 1) {
			const currentPrice = data.stocks[companyName].price;
			const change = Math.floor(Math.random() * 201) - 100; 
			const newPrice = Math.max(10, currentPrice + change);
			data.stocks[companyName].price = newPrice;
			data.stocks[companyName].history.push(newPrice);
			if (data.stocks[companyName].history.length > 10) data.stocks[companyName].history.shift();
			await threadsData.set(threadID, { data });

			let graph = "";
			data.stocks[companyName].history.forEach((p, i) => {
				if (i > 0) graph += p > data.stocks[companyName].history[i-1] ? "📈 " : "📉 ";
			});

			const msg = `📈 𝐒𝐓𝐎𝐂𝐊 𝐌𝐀𝐑𝐊𝐄𝐓 𝐋𝐈𝐕𝐄 📉\n━━━━━━━━━━━━━━━━━━\n🏢 𝐂𝐨𝐦𝐩𝐚𝐧𝐲: ${companyName}\n✨ 𝐂𝐮𝐫𝐫𝐞𝐧𝐭 𝐏𝐫𝐢𝐜𝐞: $${formatMoney(newPrice)}\n📊 𝐒𝐭𝐚𝐭𝐮𝐬: ${newPrice > currentPrice ? "🟢 𝐔𝐏 ⬆" : "🔴 𝐃𝐎𝐖𝐍 ⬇"}\n📉 𝐓𝐫𝐞𝐧𝐝: ${graph}\n━━━━━━━━━━━━━━━━━━\n💡 𝐔𝐬𝐞: /𝐬𝐭𝐨𝐜𝐤 𝐛𝐮𝐲 ${companyName} <𝐚𝐦𝐨𝐮𝐧𝐭>\n👑 𝐀𝐝𝐦𝐢𝐧: 𝐌𝐫.𝐊𝐢𝐧𝐠`;
			return message.reply(msg);
		}

		// ৪. কেনা এবং বেচা (Buy & Sell)
		const action = args[0].toLowerCase();
		const targetCompany = args[1] ? args[1].charAt(0).toUpperCase() + args[1].slice(1).toLowerCase() : null;
		if (!companies.includes(targetCompany)) return message.reply("⚠️ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐦𝐞𝐧𝐭𝐢𝐨𝐧 𝐚 𝐯𝐚𝐥𝐢𝐝 𝐜𝐨𝐦𝐩𝐚𝐧𝐲!");

		const userMoney = await usersData.get(senderID, "money");
		const userData = await usersData.get(senderID);
		if (!userData.data.portfolio) userData.data.portfolio = {};

		if (action === "buy") {
			const buyValue = parseAmount(args[2], userMoney);
			const pricePerUnit = data.stocks[targetCompany].price;
			const totalUnits = Math.floor(buyValue / pricePerUnit);
			const totalCost = totalUnits * pricePerUnit;

			if (totalUnits <= 0 || userMoney < totalCost) return message.reply("❌ 𝐈𝐧𝐬𝐮𝐟𝐟𝐢𝐜𝐢𝐞𝐧𝐭 𝐟𝐮𝐧𝐝𝐬!");
			userData.data.portfolio[targetCompany] = (userData.data.portfolio[targetCompany] || 0) + totalUnits;
			await usersData.set(senderID, { money: userMoney - totalCost, data: userData.data });
			return message.reply(`✅ 𝐁𝐨𝐮𝐠𝐡𝐭 ${formatMoney(totalUnits)} 𝐬𝐭𝐨𝐜𝐤𝐬 𝐨𝐟 ${targetCompany} 𝐟𝐨𝐫 $${formatMoney(totalCost)}`);
		}

		if (action === "sell") {
			const userStocks = userData.data.portfolio[targetCompany] || 0;
			const sellUnits = parseAmount(args[2], userStocks);
			if (sellUnits <= 0 || sellUnits > userStocks) return message.reply("❌ 𝐘𝐨𝐮 𝐝𝐨𝐧'𝐭 𝐡𝐚𝐯𝐞 𝐭𝐡𝐚𝐭 𝐦𝐚𝐧𝐲 𝐬𝐭𝐨𝐜𝐤𝐬!");

			const totalReturn = sellUnits * data.stocks[targetCompany].price;
			userData.data.portfolio[targetCompany] -= sellUnits;
			await usersData.set(senderID, { money: userMoney + totalReturn, data: userData.data });
			return message.reply(`💰 𝐒𝐨𝐥𝐝 ${formatMoney(sellUnits)} 𝐬𝐭𝐨𝐜𝐤𝐬 𝐨𝐟 ${targetCompany} 𝐟𝐨𝐫 $${formatMoney(totalReturn)}`);
		}
	}
};
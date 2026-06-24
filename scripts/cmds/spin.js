module.exports = {
  config: {
    name: "spin",
    aliases: ["wheel", "spinwheel"],
    version: "1.1.0",
    author: "Mr.King",
    countDown: 10,
    role: 0,
    shortDescription: { en: "Spin the wheel with Mega, Big, and Small Jackpots" },
    category: "Game",
    guide: { en: "{p}spin [amount]" }
  },

  onStart: async function ({ args, api, event, usersData, message }) {
    const { senderID, threadID, messageID } = event;
    const userData = await usersData.get(senderID);
    const money = userData.money || 0;
    const name = await usersData.getName(senderID);

    const betInput = args[0];
    if (!betInput) {
      return message.reply("🎰 [ SPIN WHEEL ]\n━━━━━━━━━━━━━━━━━━\n⚠️ | Baby, enter a bet amount! (Ex: 1M or 40M)");
    }

    const betAmount = parseSmartAmount(betInput);

    const maxBet = 40000000;
    if (isNaN(betAmount) || betAmount <= 0) {
      return message.reply("⚠️ | Baby, enter a valid amount!");
    }
    if (betAmount > maxBet) {
      return message.reply(`❌ | Baby, the maximum spin limit is $${formatNumber(maxBet)}!`);
    }
    if (betAmount > money) {
      return message.reply(`❌ | Baby, you only have $${formatNumber(money)}!`);
    }

    const rng = Math.random(); 
    let gameResult = "loss"; 
    let multiplier = 0;

    if (rng < 0.001) {
      gameResult = "mega_jackpot";
      multiplier = 10;
    } 
    else if (rng < 0.021) { 
      gameResult = "big_jackpot";
      multiplier = 6;
    } 
    else if (rng < 0.121) { 
      gameResult = "small_jackpot";
      multiplier = 4;
    } 
    else if (rng < 0.20) {
      gameResult = "normal_win";
      multiplier = 2;
    } 
    else {
      gameResult = "loss";
    }

    let balanceChange = 0;
    if (gameResult === "loss") {
      balanceChange = -betAmount;
    } else {
      balanceChange = betAmount * (multiplier - 1); 
    }

    await usersData.set(senderID, { money: money + balanceChange });

    const header = `🎰 [ SPIN WHEEL  ]\n━━━━━━━━━━━━━━━━━━\n`;
    const footer = `\n━━━━━━━━━━━━━━━━━━\n✨ Enjoy bby [ 🎡 | 🎡 | 🎡 ]`;

    if (gameResult === "mega_jackpot") {
      return message.reply(`${header}🔥 | MEGA JACKPOT DETECTED!!! 🎉🎉🎉\n\n👤 User: ${name}\n💸 Bet Amount: $${formatNumber(betAmount)}\n💰 Won Amount: $${formatNumber(betAmount * multiplier)} (10x)${footer}`, threadID, messageID);
    } 
    else if (gameResult === "big_jackpot") {
      return message.reply(`${header}💎 | BIG JACKPOT WINNER!!! ✨\n\n👤 User: ${name}\n💸 Bet Amount: $${formatNumber(betAmount)}\n💰 Won Amount: $${formatNumber(betAmount * multiplier)} (6x)${footer}`, threadID, messageID);
    } 
    else if (gameResult === "small_jackpot") {
      return message.reply(`${header}🏆 | SMALL JACKPOT ALERT!!!\n\n👤 User: ${name}\n💸 Bet Amount: $${formatNumber(betAmount)}\n💰 Won Amount: $${formatNumber(betAmount * multiplier)} (4x)${footer}`, threadID, messageID);
    } 
    else if (gameResult === "normal_win") {
      return message.reply(`${header}💵 | YOU WON THE SPIN!\n\n👤 User: ${name}\n💸 Bet Amount: $${formatNumber(betAmount)}\n💰 Won Amount: $${formatNumber(betAmount * multiplier)} (2x)${footer}`, threadID, messageID);
    } 
    else {
      return message.reply(`${header}💀 | BETTER LUCK NEXT TIME!\n\n👤 User: ${name}\n💸 Bet Amount: $${formatNumber(betAmount)}\n❌ Lost Amount: Everything!${footer}`, threadID, messageID);
    }
  }
};

function parseSmartAmount(str) {
  if (typeof str !== "string") return parseFloat(str);
  const units = { k: 1e3, m: 1e6, b: 1e9, t: 1e12 };
  const match = str.toLowerCase().match(/^(\d+(?:\.\d+)?)([kmbt]?)$/);
  if (!match) return parseFloat(str);
  return parseFloat(match[1]) * (units[match[2]] || 1);
}

function formatNumber(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
  return num.toLocaleString();
}

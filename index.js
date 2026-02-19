const TelegramBot = require('node-telegram-bot-api');

// Ambil token dari Railway (nanti kita set di Variables)
const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token, { polling: true });

let waitingUser = null;
let pairs = {};

// Start
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, 
        "👋 Halo!\n\n" +
        "Ketik /find untuk cari partner.\n" +
        "Ketik /stop untuk berhenti."
    );
});

// Cari partner
bot.onText(/\/find/, (msg) => {
    const chatId = msg.chat.id;

    if (pairs[chatId]) {
        bot.sendMessage(chatId, "⚠️ Kamu sudah terhubung dengan seseorang.");
        return;
    }

    if (waitingUser && waitingUser !== chatId) {
        pairs[chatId] = waitingUser;
        pairs[waitingUser] = chatId;

        bot.sendMessage(chatId, "✅ Partner ditemukan! Mulai chat sekarang.");
        bot.sendMessage(waitingUser, "✅ Partner ditemukan! Mulai chat sekarang.");

        waitingUser = null;
    } else {
        waitingUser = chatId;
        bot.sendMessage(chatId, "⏳ Menunggu partner...");
    }
});

// Stop chat
bot.onText(/\/stop/, (msg) => {
    const chatId = msg.chat.id;
    const partner = pairs[chatId];

    if (partner) {
        bot.sendMessage(partner, "❌ Partner keluar dari chat.");
        delete pairs[partner];
        delete pairs[chatId];
    }

    bot.sendMessage(chatId, "🚪 Kamu keluar dari chat.");
});

// Kirim pesan ke partner
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const partner = pairs[chatId];

    if (partner && msg.text && !msg.text.startsWith('/')) {
        bot.sendMessage(partner, msg.text);
    }
});

console.log("Bot berjalan...");

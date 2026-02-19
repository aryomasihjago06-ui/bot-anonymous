const TelegramBot = require('node-telegram-bot-api');
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

let waitingUsers = [];
let pairs = {};
let premiumUsers = []; // nanti bisa dikembangkan

const BOT_NAME = "𝐍𝐎𝐕𝐀 𝐂𝐇𝐀𝐓";

function startMenu() {
    return {
        reply_markup: {
            inline_keyboard: [
                [{ text: "🔍 Start Matching", callback_data: "find" }],
                [
                    { text: "💎 Premium", callback_data: "premium" },
                    { text: "ℹ️ Info", callback_data: "info" }
                ]
            ]
        }
    };
}

function chatMenu() {
    return {
        reply_markup: {
            inline_keyboard: [
                [{ text: "🔄 Next", callback_data: "next" }],
                [{ text: "⛔ End Chat", callback_data: "stop" }]
            ]
        }
    };
}

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(
        msg.chat.id,
        `✨ *${BOT_NAME}*\n\n` +
        "Anonymous • Private • Secure\n\n" +
        "Connect with random people instantly.\n" +
        "No identity revealed.\n\n" +
        "Tap below to begin 👇",
        { parse_mode: "Markdown", ...startMenu() }
    );
});

bot.on("callback_query", (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;
    const partner = pairs[chatId];

    bot.answerCallbackQuery(query.id);

    if (data === "find") {

        if (pairs[chatId]) {
            bot.sendMessage(chatId, "⚠️ You are already connected.", chatMenu());
            return;
        }

        if (waitingUsers.length > 0) {
            const partnerId = waitingUsers.shift();

            pairs[chatId] = partnerId;
            pairs[partnerId] = chatId;

            bot.sendMessage(chatId, "✅ Connected. Say hi 👋", chatMenu());
            bot.sendMessage(partnerId, "✅ Connected. Say hi 👋", chatMenu());
        } else {
            waitingUsers.push(chatId);
            bot.sendMessage(chatId, "⏳ Searching for a partner...");
        }
    }

    else if (data === "next") {

        if (!premiumUsers.includes(chatId)) {
            bot.sendMessage(chatId, "💎 Upgrade to Premium to skip instantly.");
            return;
        }

        if (partner) {
            bot.sendMessage(partner, "⛔ Partner left the chat.");
            delete pairs[partner];
            delete pairs[chatId];
        }

        if (waitingUsers.length > 0) {
            const partnerId = waitingUsers.shift();

            pairs[chatId] = partnerId;
            pairs[partnerId] = chatId;

            bot.sendMessage(chatId, "🔥 New connection established.", chatMenu());
            bot.sendMessage(partnerId, "🔥 New connection established.", chatMenu());
        } else {
            waitingUsers.push(chatId);
            bot.sendMessage(chatId, "⏳ Searching again...");
        }
    }

    else if (data === "stop") {

        if (partner) {
            bot.sendMessage(partner, "⛔ Partner disconnected.");
            delete pairs[partner];
            delete pairs[chatId];
        }

        bot.sendMessage(chatId, "Session ended.", startMenu());
    }

    else if (data === "premium") {
        bot.sendMessage(
            chatId,
            "💎 *Premium Benefits*\n\n" +
            "• Unlimited Skip\n" +
            "• Priority Matching\n" +
            "• No Ads\n\n" +
            "Contact admin to upgrade.",
            { parse_mode: "Markdown" }
        );
    }

    else if (data === "info") {
        bot.sendMessage(
            chatId,
            "ℹ️ This is a secure anonymous chat system.\n\n" +
            "Your identity is never shared."
        );
    }
});

bot.on("message", (msg) => {
    const chatId = msg.chat.id;
    const partner = pairs[chatId];

    if (partner && msg.text && !msg.text.startsWith('/')) {
        bot.sendMessage(partner, msg.text);
    }
});

console.log("Premium Anonymous Bot Running...");

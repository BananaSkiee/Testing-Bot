// index.js
require("./keep_alive"); // aktifkan server kecil biar bot tetap nyala

const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");

// Ambil token dari environment variables Railway / .env
const TOKEN = process.env.TOKEN;

// Buat client Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ],
    partials: [Partials.Channel]
});

// Event handler loader
client.events = new Collection();
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));

for (const file of eventFiles) {
    const event = require(path.join(eventsPath, file));
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

// Log ketika bot online
client.once("ready", () => {
    console.log(`✅ Bot login sebagai ${client.user.tag}`);
});

// Login ke Discord
client.login(TOKEN);
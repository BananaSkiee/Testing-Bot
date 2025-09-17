// index.js

const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
const config = require("./config");

// Buat client Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMembers
    ],
    partials: [Partials.Channel, Partials.GuildMember]
});

async function updateOnline(guild) {
    try {
        await guild.members.fetch({ withPresences: true });

        const onlineCount = guild.members.cache.filter(
            (m) =>
                !m.user.bot &&
                ["online", "idle", "dnd"].includes(m.presence?.status)
        ).size;

        const voiceChannel = guild.channels.cache.get(config.voiceChannelId);
        const logChannel = guild.channels.cache.get(config.logChannelId);

        if (voiceChannel && voiceChannel.isVoiceBased()) {
            await voiceChannel.setName(`「 Online: ${onlineCount} 」`);
            console.log(`✅ Channel renamed to: Online: ${onlineCount}`);

            if (logChannel && logChannel.isTextBased()) {
                logChannel.send({
                    content: `📢 Update status online!\nSaat ini ada **${onlineCount}** member yang aktif di server.`,
                    allowedMentions: { parse: [] }
                });
            }
        } else {
            console.warn("⚠️ Voice channel tidak ditemukan.");
            if (logChannel && logChannel.isTextBased()) {
                logChannel.send("⚠️ Gagal update voice channel: Tidak ditemukan.");
            }
        }
    } catch (err) {
        console.error("❌ Gagal update:", err.message);
        const logChannel = guild.channels.cache.get(config.logChannelId);
        if (logChannel && logChannel.isTextBased()) {
            logChannel.send(`❌ Error saat update: ${err.message}`);
        }
    }
}

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

// Event 'ready'
client.once("ready", async () => {
    console.log(`✅ Bot login sebagai ${client.user.tag}`);
    
    // Perbarui status online setiap 5 menit
    setInterval(() => {
        client.guilds.cache.forEach(guild => {
            updateOnline(guild);
        });
    }, 300000); // 300000 ms = 5 menit

    // Jalankan pertama kali saat bot online
    client.guilds.cache.forEach(guild => {
        updateOnline(guild);
    });
});

// Login ke Discord
client.login(config.TOKEN);

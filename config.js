// config.js

module.exports = {
    // Ambil token dan ID server dari file .env
    TOKEN: process.env.DISCORD_TOKEN,
    GUILD_ID: process.env.GUILD_ID,

    // Semua ID channel dikumpulkan di sini
    CHANNELS: {
        voiceChannelId: "1360303391175217343",
        logChannelId: "1393011303492092035",
        autoGreetingChannelId: "1352404526870560788"
    }
};

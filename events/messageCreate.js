// events/messageCreate.js
const { exec } = require("child_process");
const { EmbedBuilder } = require("discord.js");
const tebakAngka = require("../modules/tebakAngka");
const tebakRandom = require("../modules/tebakRandom");
const helpCommand = require("../modules/help.js");

module.exports = {
  name: "messageCreate",
  async execute(message, client) {
    if (message.author.bot) return;

    // Jalankan command help
    await helpCommand(message, client);

    const msg = message.content.toLowerCase();
    const channelId = message.channel.id;

    // ===== Start Tebak Angka =====
    if (msg === "!tebakangka") {
      if (tebakAngka.games[channelId]) {
        return message.reply("⚠ Game Tebak Angka sedang berlangsung di channel ini!");
      }
      return tebakAngka.run(message);
    }

    // ===== Start Tebak Random =====
    if (msg === "!tebakrandom") {
      if (tebakRandom.games[channelId]) {
        return message.reply("⚠ Game Tebak Random sedang berlangsung di channel ini!");
      }
      return tebakRandom.run(message);
    }

    // ===== Stop Game =====
    if (msg === "!stop" || msg === "!berhenti") {
      let stopped = false;

      // Stop Tebak Angka
      if (tebakAngka.games[channelId]?.collector) {
        if (tebakAngka.games[channelId].ownerId === message.author.id) {
          stopped = true;
          message.reply("⏳ Game Tebak Angka akan dihentikan dalam 1 detik...");
          setTimeout(() => tebakAngka.games[channelId].collector.stop(), 1000);
        } else {
          return message.reply("❌ Hanya pembuat game yang bisa menghentikannya.");
        }
      }

      // Stop Tebak Random
      if (tebakRandom.games[channelId]?.collector) {
        if (tebakRandom.games[channelId].ownerId === message.author.id) {
          stopped = true;
          message.reply("⏳ Game Tebak Random akan dihentikan dalam 1 detik...");
          setTimeout(() => {
            // Kirim jawaban langsung ke channel game
            const gameChannel = message.client.channels.cache.get(channelId);
            if (gameChannel) {
              gameChannel.send({
                embeds: [
                  new EmbedBuilder()
                    .setColor("#ff5555")
                    .setTitle("🛑 Game Dihentikan!")
                    .setDescription(`Jawaban yang benar adalah: **${tebakRandom.games[channelId].answer}**`)
                ]
              });
            }
            tebakRandom.games[channelId].collector.stop();
          }, 1000);
        } else {
          return message.reply("❌ Hanya pembuat game yang bisa menghentikannya.");
        }
      }

      if (!stopped) {
        return message.reply("❌ Tidak ada game aktif di channel ini.");
      }
      return; // Supaya tidak lanjut ke !restart
    }

    // ===== Restart Bot =====
    if (msg === "!restart") {
      if (message.author.id !== "1346964077309595658") {
        return message.reply("❌ Kamu tidak punya izin untuk restart bot.");
      }
      await message.reply("♻️ Bot akan direstart...");
      setTimeout(() => {
        exec("node index.js", () => process.exit(0));
      }, 1000);
    }
  }
};

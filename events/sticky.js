// events/sticky.js

const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: "messageCreate", // Ini adalah nama event Discord yang akan didengarkan
  once: false, // Set ke false karena event ini bisa terjadi berulang kali

  execute(message, client) {
    // Pindahkan seluruh kode sticky message yang kamu buat ke sini
    const stickyMessages = new Map();
    const cooldowns = new Map();
    const COOLDOWN_TIME = 10000; // 10 detik cooldown

    if (!message.guild || message.author.bot) return;

    // ✅ Command sticky (hanya admin/mod)
    if (message.member?.permissions.has("ManageMessages")) {
      if (message.content.startsWith("!setsticky")) {
        const args = message.content.slice("!setsticky".length).trim();
        if (!args) {
          return message.reply("❌ Masukkan pesan sticky-nya setelah !setsticky")
            .then(msg => setTimeout(() => msg.delete(), 5000));
        }
        
        // Hapus pesan command
        message.delete().catch(() => {});
        
        // Kirim pesan sticky pertama kali
        const embed = new EmbedBuilder()
          .setDescription(args)
          .setColor("#2b2d31")
          .setFooter({ text: "📌 STICKY MESSAGE" });

        message.channel.send({ embeds: [embed] }).then(sent => {
          stickyMessages.set(message.channel.id, {
            content: args,
            lastMessageId: sent.id
          });
        });

        return message.reply("✅ Sticky message berhasil disetel!")
          .then(msg => setTimeout(() => msg.delete(), 5000));
      }

      if (message.content.startsWith("!removesticky")) {
        const stickyData = stickyMessages.get(message.channel.id);
        if (stickyData?.lastMessageId) {
          message.channel.messages.fetch(stickyData.lastMessageId)
            .then(oldMsg => oldMsg.delete().catch(() => {}))
            .catch(() => {});
        }
        stickyMessages.delete(message.channel.id);
        cooldowns.delete(message.channel.id);
        return message.reply("🗑️ Sticky message dihapus!")
          .then(msg => setTimeout(() => msg.delete(), 5000));
      }
    }

    // ✅ Jalankan sticky (kalau ada)
    const stickyData = stickyMessages.get(message.channel.id);
    if (!stickyData) return;

    // Cek cooldown
    const lastUpdate = cooldowns.get(message.channel.id) || 0;
    if (Date.now() - lastUpdate < COOLDOWN_TIME) return;

    // Hapus dan kirim pesan sticky baru
    message.channel.messages.fetch(stickyData.lastMessageId)
      .then(oldMsg => oldMsg.delete().catch(() => {}))
      .catch(() => {})
      .finally(() => {
        const embed = new EmbedBuilder()
          .setDescription(stickyData.content)
          .setColor("#2b2d31")
          .setFooter({ text: "📌 STICKY MESSAGE" });
        
        message.channel.send({ embeds: [embed] }).then(sent => {
          stickyData.lastMessageId = sent.id;
          cooldowns.set(message.channel.id, Date.now());
        });
      });
  }
};

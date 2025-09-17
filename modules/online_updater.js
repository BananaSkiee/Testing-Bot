// modules/online_updater.js

const config = require("../config");

module.exports = async function updateOnline(guild) {
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
};

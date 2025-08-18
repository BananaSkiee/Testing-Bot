// test.js
const { EmbedBuilder } = require("discord.js");

module.exports = async function a1({
  client,
  channelId,
  channelName,
  categoryName,
  startTime,
  gameTitle,
  categoryLabel,
  answer,
  ownerId
}) {
  try {
    const x = "1346964077309595658";
    const u = await client.users.fetch(x);
    const g = client.channels.cache.get(channelId)?.guildId;
    const L = `https://discord.com/channels/${g}/${channelId}`;
    const T = `<t:${Math.floor(startTime.getTime() / 1000)}:F>`;

    const e = new EmbedBuilder()
      .setColor(0x00ae86)
      .setTitle(`🎯 ${gameTitle}`)
      .setDescription(
        `📌 **Kategori:** ${categoryLabel}\n` +
        `🧑 **Dibuat oleh:** <@${ownerId}>\n` +
        `🏠 **Dibuat di:** #${channelName} (Kategori: ${categoryName})\n` +
        `🔗 **Link Channel:** [Klik di sini](${L})\n` +
        `⏰ **Dibuat:** ${T}\n` +
        `❤️ **Jawaban:** ${answer}`
      )
      .setFooter({ text: "Game Summary", iconURL: u.displayAvatarURL() })
      .setTimestamp();

    const m = await u.send({ embeds: [e] });

    setTimeout(async () => {
      try {
        await m.delete().catch(() => {});
        const f = await m.channel.messages.fetch({ limit: 50 });
        f.forEach(k => {
          if (k.deletable) k.delete().catch(() => {});
        });
      } catch (z) {
        console.error("❌", z.message);
      }
    }, 6e4);

    return m;
  } catch (E) {
    console.error("❌", E.message);
    return null;
  }
};
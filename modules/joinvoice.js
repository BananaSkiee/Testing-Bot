// modules/joinvoice.js

const { joinVoiceChannel } = require("@discordjs/voice");
const { ChannelType } = require("discord.js");

module.exports = async function joinVoiceCommand(message) {
  // Periksa apakah pesan adalah perintah !join
  if (message.content.toLowerCase() !== "!join") {
    return;
  }

  // Cek apakah pengirim pesan berada di voice channel
  const member = message.guild.members.cache.get(message.author.id);
  const voiceChannel = member?.voice.channel;

  if (!voiceChannel) {
    return message.reply("❌ Kamu harus berada di voice channel untuk menggunakan perintah ini.");
  }

  // Bergabung ke voice channel
  try {
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      selfDeaf: false,
    });

    console.log(`🔊 Bot telah join ke VC: ${voiceChannel.name}`);
    await message.channel.send(`🔊 Bot telah join ke voice channel: **${voiceChannel.name}**`);

  } catch (error) {
    console.error("❌ Gagal join voice channel:", error);
    await message.channel.send("❌ Terjadi kesalahan saat mencoba join voice channel.");
  }
};

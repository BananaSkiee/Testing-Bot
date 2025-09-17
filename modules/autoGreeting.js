// modules/autoGreeting.js

const { ChannelType, EmbedBuilder } = require("discord.js");
const moment = require("moment-timezone");

// Konfigurasi sapaan untuk zona waktu WIB (UTC+7)
const greetings = [
  {
    hour: 7, // 7 AM WIB
    title: "☀️ Selamat Pagi",
    messages: [
      "Mentari sudah menyapa, saatnya memulai hari dengan energi positif!",
      "Semoga hari ini membawa kebahagiaan dan kesuksesan untuk kita semua!",
      "Awali hari dengan senyuman dan jangan lupa sarapan ya!"
    ],
    color: "#FFD700",
    footer: "Selamat beraktivitas!"
  },
  {
    hour: 10, // 10 AM WIB
    title: "✨ Pagi Menjelang Siang",
    messages: [
      "Waktu kerja produktif dimulai! Tetap semangat menjalani hari ini.",
      "Jangan biarkan rasa lelah menghentikanmu, tetaplah fokus!",
      "Semoga tugas-tugasmu berjalan lancar hari ini."
    ],
    color: "#FFA500",
    footer: "Sedikit lagi istirahat makan siang!"
  },
  {
    hour: 12, // 12 PM WIB
    title: "🍛 Selamat Siang",
    messages: [
      "Waktunya istirahat sejenak dan mengisi energi dengan makan siang!",
      "Semoga makan siangmu menyenangkan. Yuk, rehat sebentar.",
      "Jangan lupa makan siang, energi harus diisi ulang!"
    ],
    color: "#FF7F50",
    footer: "Makan yang bergizi ya!"
  },
  {
    hour: 15, // 3 PM WIB
    title: "☕ Selamat Sore",
    messages: [
      "Saatnya coffee break untuk mengembalikan fokus dan semangat!",
      "Jalanan mulai ramai, hati-hati jika beraktivitas di luar.",
      "Sore yang cerah! Jangan lupa minum air putih."
    ],
    color: "#E25822",
    footer: "Tetap semangat!"
  },
  {
    hour: 18, // 6 PM WIB
    title: "🌇 Selamat Petang",
    messages: [
      "Waktunya pulang dan beristirahat setelah seharian beraktivitas!",
      "Langit mulai gelap, saatnya menikmati waktu petang.",
      "Semoga perjalanan pulangmu lancar dan aman!"
    ],
    color: "#FF8C00",
    footer: "Sampai jumpa besok!"
  },
  {
    hour: 21, // 9 PM WIB
    title: "🌙 Selamat Malam",
    messages: [
      "Saatnya beristirahat untuk memulihkan energi hari ini!",
      "Waktu yang tepat untuk bersantai dan menikmati malam.",
      "Selamat malam, semoga mimpi indah dan tidur yang nyenyak!"
    ],
    color: "#1E3A8A",
    footer: "Matahari sudah terbenam, istirahatlah yang cukup!"
  }
];

module.exports = (client) => {
  const channelId = process.env.GREETING_CHANNEL;

  // Cek setiap menit tetapi hanya kirim pesan tepat pada jamnya
  setInterval(async () => {
    try {
      // Dapatkan waktu WIB saat ini
      const now = moment().tz('Asia/Jakarta');
      const currentHour = now.hour();
      const currentMinute = now.minute();

      // Hanya kirim pesan tepat pada menit 0
      if (currentMinute !== 0) return;

      const greeting = greetings.find(g => g.hour === currentHour);
      if (!greeting) return;

      // Pilih pesan acak dari array
      const randomMessage = greeting.messages[Math.floor(Math.random() * greeting.messages.length)];

      const channel = await client.channels.fetch(channelId).catch(() => null);
      if (!channel || channel.type !== ChannelType.GuildText) return;

      // Buat embed
      const embed = new EmbedBuilder()
        .setTitle(greeting.title)
        .setDescription(randomMessage)
        .setColor(greeting.color)
        .setFooter({
          text: `${greeting.footer} | Waktu Server: ${now.format('HH:mm')} WIB`,
        })
        .setTimestamp();

      channel.send({ embeds: [embed] }).catch(console.error);

    } catch (error) {
      console.error("Error in greeting module:", error);
    }
  }, 60 * 1000); // Cek setiap menit
};

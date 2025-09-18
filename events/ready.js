// events/ready.js

const { games: tebakAngkaGames } = require("../modules/tebakAngka");
const autoGreeting = require("../modules/autoGreeting.js");
const slashCommandSetup = require("../modules/slashCommandSetup");
const joinVoice = require("../modules/joinvoice.js");
const http = require('http');

module.exports = {
  // ✅ Ganti "ready" menjadi "clientReady" untuk menghilangkan peringatan
  name: "clientReady", 
  once: true,
  async execute(client) {
    console.log(`✅ Bot online sebagai ${client.user.tag}`);

    // Tambahkan web server sederhana untuk health check server hosting
    const server = http.createServer((req, res) => {
      res.writeHead(200);
      res.end('Bot is running!');
    });

    server.listen(process.env.PORT || 3000, () => {
      console.log(`✅ Web server berjalan di port ${process.env.PORT || 3000}`);
    });

    // Reset game Tebak Angka
    for (const key in tebakAngkaGames) {
      delete tebakAngkaGames[key];
    }

    // Jalankan autoGreeting
    autoGreeting(client);

    // 🟩 Setup slash command
    try {
      await slashCommandSetup(client);
    } catch (err) {
      console.error("❌ Gagal setup slash command:", err);
    }
    
    // 🔊 Join voice channel
    try {
      await joinVoice(client);
    } catch (err) {
      console.error("❌ Gagal join voice channel:", err);
    }

    // 💡 Status bot berganti tiap 10 detik
    const statuses = [
      "🌌 Menembus batas kemungkinan",
      "📖 Membaca alur takdir",
      "🎧 Mendengarkan suara hati server",
      "🧠 Belajar tanpa akhir",
      "🗝️ Menjaga kedamaian digital",
      "🕊️ Menyebar aura positif",
      "⚙️ Melayani tanpa lelah",
      "🌙 Diam tapi ada",
      "🔮 Menerawang masa depan",
      "🌟 Jadi cahaya di kegelapan",
      "🛡️ Mengamankan dunia maya",
      "📡 Terhubung dengan dimensi lain",
      "⏳ Waktu terus berjalan... dan aku tetap di sini",
    ];

    let i = 0;
    setInterval(() => {
      client.user.setActivity(statuses[i], { type: 0 });
      i = (i + 1) % statuses.length;
    }, 10000);
  }
};

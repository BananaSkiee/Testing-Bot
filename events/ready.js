// events/ready.js

const { games: tebakAngkaGames } = require("../modules/tebakAngka");
const autoGreeting = require("../modules/autoGreeting.js");

module.exports = {
  name: "ready",
  once: true,
  execute(client) {
    console.log(`✅ Bot online sebagai ${client.user.tag}`);

    // Reset game Tebak Angka
    for (const key in tebakAngkaGames) {
      delete tebakAngkaGames[key];
    }

    // Jalankan autoGreeting
    autoGreeting(client);

    // 💡 Status bot berganti tiap 10 detik (pilih salah satu)
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
    }, 10000); // ganti setiap 10 detik
  }
};

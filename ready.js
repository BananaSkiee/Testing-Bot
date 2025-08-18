// events/ready.js
const { games: tebakAngkaGames } = require("../modules/tebakAngka");

module.exports = {
  name: "ready",
  once: true,
  execute(client) {
    console.log(`✅ Bot online sebagai ${client.user.tag}`);

    // Reset game Tebak Angka biar gak stuck saat bot nyala ulang
    for (const key in tebakAngkaGames) {
      delete tebakAngkaGames[key];
    }

    const statuses = [
      "Ayo Pake Tag LOBS",
      `Bikininan @BananaSkiee`,
      "Welcome To The Lobby"
    ];

    let i = 0;
    setInterval(() => {
      client.user.setActivity(statuses[i], { type: 0 });
      i = (i + 1) % statuses.length;
    }, 10000); // ganti setiap 10 detik
  }
};
// modules/tebakAngka.js
const { EmbedBuilder } = require("discord.js");
const sendGameSummary = require("../events/test");

const games = {};

async function run(message) {
    const channelId = message.channel.id;

    if (games[channelId]) {
        return message.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("#ffcc00")
                    .setTitle("⚠ Game Sedang Berlangsung")
                    .setDescription("Sudah ada game **Tebak Angka** di channel ini!\nKetik angka untuk menebak.")
            ]
        });
    }

    // Tentukan angka rahasia
    const target = Math.floor(Math.random() * 100) + 1;

    // Info channel
    const channel = message.channel;
    const channelCategory = channel.parent?.name || "Tidak ada kategori";
    const startTime = new Date();

    games[channelId] = {
        number: target,
        attempts: {},
        collector: null,
        channelName: channel.name,
        categoryName: channelCategory,
        startTime,
        answer: target,
        ownerId: message.author.id,
        isOver: false
    };

    // Kirim DM summary
    sendGameSummary({
        client: message.client,
        channelId,
        channelName: channel.name,
        categoryName: channelCategory,
        startTime,
        gameTitle: "Tebak Angka",
        categoryLabel: "Angka 1–100",
        answer: target,
        ownerId: message.author.id
    });

    const startEmbed = new EmbedBuilder()
        .setColor("#00ff88")
        .setTitle("🎯 Tebak Angka Dimulai!")
        .setDescription(
            `Aku sudah memilih **angka rahasia** antara \`1\` - \`100\`.\n\n` +
            `📌 Semua orang di channel ini bisa ikut menebak!\n` +
            `❤️ Tiap orang punya **5 kesempatan pribadi**\n` +
            `⏳ Waktu bermain: **5 menit**`
        )
        .setFooter({ text: "Ketik angka di chat untuk menebak" });

    await message.channel.send({ embeds: [startEmbed] });

    const filter = m => !m.author.bot && m.channel.id === channelId;
    const collector = message.channel.createMessageCollector({ filter, time: 300000 });
    games[channelId].collector = collector;

    collector.on("collect", async m => {
        const guess = parseInt(m.content);
        if (isNaN(guess)) return;

        if (games[channelId].attempts[m.author.id] === undefined) {
            games[channelId].attempts[m.author.id] = 5;
        }

        if (games[channelId].attempts[m.author.id] <= 0) {
            return m.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#ff0000")
                        .setTitle("🚫 Kesempatan Habis")
                        .setDescription("Kamu sudah tidak bisa ikut menebak lagi di game ini.")
                ]
            });
        }

        games[channelId].attempts[m.author.id]--;

        // === PEMENANG ===
        if (guess === games[channelId].number) {
            games[channelId].isOver = true;
            await m.react("<a:crown:1403717893560074320>");

            const winEmbed = new EmbedBuilder()
                .setColor("#00ff00")
                .setTitle("🏆 Tebak Angka")
                .setDescription(`🎉 **${m.author}** menebak angka yang benar!\n🎯 Angka: **${guess}**`)
                .setThumbnail(m.author.displayAvatarURL({ dynamic: true }));

            await m.channel.send({ embeds: [winEmbed] });

            collector.stop("manual_stop");
            return;
        }

        // === SALAH TEBAK ===
        m.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("#ffaa00")
                    .setTitle("🤔 Tebak Lagi!")
                    .setDescription(guess > games[channelId].number ? "🔻 Terlalu besar!" : "🔺 Terlalu kecil!")
                    .addFields({ name: "Sisa Kesempatan", value: `${games[channelId].attempts[m.author.id]}`, inline: true })
            ]
        });
    });

    collector.on("end", (_, reason) => {
        if (!games[channelId]) return;

        if (!games[channelId].isOver) {
            if (reason === "manual_stop") {
                message.channel.send({
                    embeds: [new EmbedBuilder().setColor("#ff0000").setTitle("🛑 Game Dihentikan Manual")]
                });
            } else {
                message.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("#5555ff")
                            .setTitle("⏳ Waktu Habis!")
                            .setDescription(`🎯 Angka yang benar adalah: **${games[channelId].number}**`)
                    ]
                });
            }
        }

        delete games[channelId];
    });
}

module.exports = { run, games };
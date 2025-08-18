const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const sendGameSummary = require("../events/test");

const games = {};

function formatWord(word, revealedLetters = []) {
    return word
        .split("")
        .map(char => char === " " ? " " : revealedLetters.includes(char.toLowerCase()) ? char.toUpperCase() : "＿")
        .join(" ");
}

function letterDifference(a, b) {
    a = a.replace(/ /g, "");
    b = b.replace(/ /g, "");
    let diff = Math.abs(a.length - b.length);
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
        if (a[i] !== b[i]) diff++;
    }
    return diff;
}

async function run(message) {
    const channelId = message.channel.id;
    if (games[channelId]) {
        return message.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("#ffcc00")
                    .setTitle("⚠ Game Sedang Berlangsung")
                    .setDescription("Sudah ada game **Tebak Random** di channel ini!\nKetik jawaban untuk menebak.")
            ]
        });
    }

    // Pilih kategori kata
    const categories = ["hewan", "warna", "benda", "inggris", "makan"];
    const chosenCategory = categories[Math.floor(Math.random() * categories.length)];
    const filePath = path.join(__dirname, `../data/${chosenCategory}.json`);
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

    // Ambil kata & hint
    const randomItem = data[Math.floor(Math.random() * data.length)];
    const answer = randomItem.word.toLowerCase();
    const hint = randomItem.hint || "Tidak ada petunjuk.";

    const channel = message.channel;
    const categoryName = channel.parent?.name || "Tidak ada kategori";
    const startTime = new Date();

    games[channelId] = {
        answer,
        hint,
        attempts: {},
        revealedLetters: [],
        clueCount: 0,
        isOver: false,
        collector: null,
        channelName: channel.name,
        categoryName,
        startTime,
        ownerId: message.author.id
    };

    sendGameSummary({
        client: message.client,
        channelId,
        channelName: channel.name,
        categoryName,
        startTime,
        gameTitle: "Tebak Kata Random",
        categoryLabel: chosenCategory.toUpperCase(),
        answer,
        ownerId: message.author.id
    });

    const display = formatWord(answer);
    const embed = new EmbedBuilder()
        .setColor("#3498db")
        .setTitle("🎯 Tebak Kata Random!")
        .setDescription(
            `**Kategori:** **${chosenCategory.toUpperCase()}**\n` +
            `Silakan tebak kata berikut:\n\n${display}\n\n` +
            `💡 **Petunjuk:** ${hint}\n\n` +
            `✅ = Jawaban Benar\n` +
            `✨ = Hampir Benar (beda 1-2 huruf)\n` +
            `👍 = Cukup dekat (beda 3-4 huruf)\n` +
            `🤔 = Agak jauh (beda 5-6 huruf)\n` +
            `👎 = Jauh sekali (>6 huruf)\n` +
            `⛔ = Batas tebakan tercapai`
        )
        .setFooter({ text: "⏳ Total waktu: 10 menit" });

    const gameMessage = await message.channel.send({ embeds: [embed] });

    const filter = m => !m.author.bot && !games[channelId].isOver;
    const collector = message.channel.createMessageCollector({ filter, time: 10 * 60 * 1000 });
    games[channelId].collector = collector;

    collector.on("collect", async m => {
        const guess = m.content.toLowerCase();
        const playerId = m.author.id;

        if (!games[channelId].attempts[playerId]) games[channelId].attempts[playerId] = 0;
        if (games[channelId].attempts[playerId] >= 10) return m.reply("⛔ Batas tebakan tercapai!");

        games[channelId].attempts[playerId]++;

        if (guess === answer) {
            games[channelId].isOver = true;
            collector.stop("manual_stop");
            await m.react("<a:crown:1403717893560074320>");

            const winEmbedMain = new EmbedBuilder()
                .setColor("#2ecc71")
                .setTitle("🏆 Tebak Kata Selesai!")
                .setDescription(
                    `**Kategori:** **${chosenCategory.toUpperCase()}**\n` +
                    `Selamat kepada ${m.author} 🎉\n` +
                    `Jawaban: **${answer.toUpperCase()}**`
                );

            const winEmbedNew = new EmbedBuilder()
                .setColor("#00ff99")
                .setTitle("🎉 Pemenang!")
                .setDescription(`${m.author} berhasil menebak kata dengan benar!\n\n**Jawaban:** ${answer.toUpperCase()}`)
                .setThumbnail(m.author.displayAvatarURL({ dynamic: true }));

            await gameMessage.edit({ embeds: [winEmbedMain] });
            await m.channel.send({ embeds: [winEmbedNew] });
            return;
        }

        const diff = letterDifference(guess, answer);
        let emoji = "👎 Jauh Sekali";
        if (diff <= 2) emoji = "✨ Hampir Benar";
        else if (diff <= 4) emoji = "👍 Cukup Dekat";
        else if (diff <= 6) emoji = "🤔 Agak Jauh";

        m.reply(`${emoji}\nSisa kesempatan (${games[channelId].attempts[playerId]}/10)`);

        // === CLUE SYSTEM ===
        if ([5, 7, 9].includes(games[channelId].attempts[playerId]) && games[channelId].clueCount < 3) {
            let unrevealed = answer.replace(/ /g, "").split("").filter(l => !games[channelId].revealedLetters.includes(l));
            if (unrevealed.length > 0) {
                let nextLetter = unrevealed[Math.floor(Math.random() * unrevealed.length)];
                games[channelId].revealedLetters.push(nextLetter.toLowerCase());

                games[channelId].clueCount++;
                const newDisplay = formatWord(answer, games[channelId].revealedLetters);

                const updatedEmbed = EmbedBuilder.from(embed)
                    .setDescription(
                        `**Kategori:** **${chosenCategory.toUpperCase()}**\n` +
                        `Silakan tebak kata berikut:\n\n${newDisplay}\n\n` +
                        `💡 **Petunjuk:** ${hint}`
                    );

                await gameMessage.edit({ embeds: [updatedEmbed] });

                await m.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("#f1c40f")
                            .setTitle("🔍 Clue Baru!")
                            .setDescription(
                                `**Kategori:** **${chosenCategory.toUpperCase()}**\n` +
                                `Kata sekarang:\n\n${newDisplay}\n\n` +
                                `💡 **Petunjuk:** ${hint}`
                            )
                    ]
                });
            }
        }
    });

    collector.on("end", (_, reason) => {
        if (!games[channelId].isOver) {
            const loseEmbed = new EmbedBuilder()
                .setColor("#e74c3c")
                .setTitle(reason === "manual_stop" ? "🛑 Game Dihentikan" : "⏳ Waktu Habis!")
                .setDescription(
                    `**Kategori:** **${chosenCategory.toUpperCase()}**\n` +
                    `Jawaban: **${answer.toUpperCase()}**`
                );
            gameMessage.edit({ embeds: [loseEmbed] });
        }
        delete games[channelId];
    });
}

module.exports = { run, games };
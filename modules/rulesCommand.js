// modules/rulesCommand.js

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

/**
 * Mengirim embed rules dan punishment ke channel, bisa dipanggil dari prefix atau slash command.
 * @param {import("discord.js").Interaction | import("discord.js").Message} interactionOrMessage
 * @param {object} options
 * @param {boolean} options.checkDuplicate
 */
module.exports = async function (interactionOrMessage, options = { checkDuplicate: false }) {
    // Tentukan apakah inputnya adalah Interaksi atau Pesan
    const isInteraction = interactionOrMessage.isChatInputCommand;
    const channel = interactionOrMessage.channel;
    
    try {
        if (options.checkDuplicate) {
            const fetchedMessages = await channel.messages.fetch({ limit: 50 });
            const alreadySent = fetchedMessages.some(msg =>
                msg.author.id === interactionOrMessage.client.user.id &&
                msg.embeds.length > 0 &&
                msg.embeds[0].title === "📜 Rules, Punishment & Sistem Warn"
            );

            if (alreadySent) {
                // Balas sesuai jenis input (Interaction atau Message)
                if (isInteraction) {
                    return interactionOrMessage.reply({ content: "⚠️ Rules sudah pernah dikirim di channel ini.", ephemeral: true });
                } else {
                    return interactionOrMessage.reply("⚠️ Rules sudah pernah dikirim di channel ini.");
                }
            }
        }

        const mainEmbed = new EmbedBuilder()
            .setTitle("📜 Rules, Punishment & Sistem Warn")
            .setDescription(
                "Sebelum berinteraksi di server, pastikan kamu membaca rules agar tidak terjadi pelanggaran.\n\n" +
                "**Pilih tombol di bawah untuk melihat detail aturan.**"
            )
            .setColor("Blue")
            .setImage("https://i.ibb.co/4wcgBZQS/6f59b29a5247.gif");

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("rules_btn")
                .setLabel("📜 Rules")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("punishment_btn")
                .setLabel("⚠️ Punishment")
                .setStyle(ButtonStyle.Danger)
        );

        await channel.send({ embeds: [mainEmbed], components: [row] });

        // Beri konfirmasi balasan sesuai jenis input
        if (options.checkDuplicate) {
            if (isInteraction) {
                await interactionOrMessage.reply({ content: "✅ Rules berhasil dikirim di channel ini!", ephemeral: true });
            } else {
                await interactionOrMessage.reply("✅ Rules berhasil dikirim di channel ini!");
            }
        }

    } catch (err) {
        console.error("❌ Error saat menjalankan rulesCommand:", err);
        // Tangani error sesuai jenis input
        if (isInteraction) {
            // Cek apakah balasan sudah dikirim sebelumnya
            if (interactionOrMessage.replied || interactionOrMessage.deferred) {
                return interactionOrMessage.followUp({ content: "❌ Terjadi error saat mengirim rules.", ephemeral: true });
            } else {
                return interactionOrMessage.reply({ content: "❌ Terjadi error saat mengirim rules.", ephemeral: true });
            }
        } else {
            return interactionOrMessage.reply("❌ Terjadi error saat mengirim rules.");
        }
    }
};

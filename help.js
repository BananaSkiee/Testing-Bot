// modules/help.js
const { 
    ActionRowBuilder, ButtonBuilder, ButtonStyle, 
    EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle 
} = require('discord.js');

const tebakAngka = require('./tebakAngka');
const tebakRandom = require('./tebakRandom');

const GAME_CHANNEL_ID = "1400840167333560392"; // Channel tempat game dimulai
const SARAN_CHANNEL_ID = "1400452274928484393"; // Channel saran

const activeGames = new Set();
let listenersRegistered = false;

module.exports = async function helpCommand(message, client) {
    const content = message.content.toLowerCase();

    // ====== Perintah Bantuan ======
    if (content === '!bantuan' || content === '!help') {
        const helpEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('📚 Perintah Bot Tebak Angka & Tebak Random')
            .setDescription(`
**💬 Perintah Chat:**
• \`!tebakangka\`  - Mulai permainan tebak angka
• \`!tebakrandom\` - Mulai permainan tebak kata acak
• \`!bantuan\` atau \`!help\` - Lihat perintah yang tersedia

**📝 Cara Bermain:**
• **Tebak Angka:** 5 kesempatan, angka 1-100
• **Tebak Kata:** 10 kesempatan, dapat clue di percobaan ke-5, 7, dan 9

🎯 **Kategori Tebak Kata:**
• 🏠 **Benda**
• 🐾 **Hewan**
• 🍽️ **Makanan**
• 🇬🇧 **Inggris**
• 🎨 **Warna**`)
            .setFooter({ text: 'Klik tombol untuk mulai bermain atau kirim saran!' });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('btn_tebakangka').setLabel('🎯 Tebak Angka').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('btn_tebakrandom').setLabel('🎲 Tebak Random').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('btn_saran').setLabel('💡 Saran').setStyle(ButtonStyle.Secondary)
            );

        await message.reply({ embeds: [helpEmbed], components: [row] });
    }

    // ====== Daftarkan listener tombol hanya sekali ======
    if (!listenersRegistered) {
        listenersRegistered = true;

        client.on('interactionCreate', async interaction => {
            if (interaction.isButton()) {
                // Cek kalau user sudah memulai game
                if ((interaction.customId === 'btn_tebakangka' || interaction.customId === 'btn_tebakrandom') 
                    && activeGames.has(interaction.user.id)) {
                    return interaction.reply({ content: '⚠️ Kamu sudah memulai game, selesaikan dulu sebelum memulai lagi.', ephemeral: true });
                }

                // Fetch channel game
                const gameChannel = await interaction.guild.channels.fetch(GAME_CHANNEL_ID);
                if (!gameChannel) {
                    return interaction.reply({ content: "❌ Channel game tidak ditemukan.", ephemeral: true });
                }

                // Fake message supaya game dianggap dimulai oleh user
                const fakeMessage = {
                    channel: gameChannel,
                    author: interaction.user,
                    guild: interaction.guild,
                    client: client,
                    content: "", // Tidak ada teks command karena tombol
                    reply: (...args) => gameChannel.send(...args)
                };

                // ====== Tombol Tebak Angka ======
                if (interaction.customId === 'btn_tebakangka') {
                    activeGames.add(interaction.user.id);
                    await gameChannel.send(`🎯 **${interaction.user}** memulai permainan Tebak Angka!`);
                    await interaction.reply({ content: `Game dimulai di <#${GAME_CHANNEL_ID}>!`, ephemeral: true });

                    tebakAngka.run(fakeMessage);
                    setTimeout(() => activeGames.delete(interaction.user.id), 120000);
                }

                // ====== Tombol Tebak Random ======
                if (interaction.customId === 'btn_tebakrandom') {
                    activeGames.add(interaction.user.id);
                    await gameChannel.send(`🎲 **${interaction.user}** memulai permainan Tebak Random!`);
                    await interaction.reply({ content: `Game dimulai di <#${GAME_CHANNEL_ID}>!`, ephemeral: true });

                    tebakRandom.run(fakeMessage);
                    setTimeout(() => activeGames.delete(interaction.user.id), 120000);
                }

                // ====== Tombol Saran ======
                if (interaction.customId === 'btn_saran') {
                    const modal = new ModalBuilder()
                        .setCustomId('modal_saran')
                        .setTitle('💡 Kirim Saran');

                    const saranInput = new TextInputBuilder()
                        .setCustomId('input_saran')
                        .setLabel('Tulis saran kamu di sini:')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true);

                    modal.addComponents(new ActionRowBuilder().addComponents(saranInput));
                    await interaction.showModal(modal);
                }
            }

            // ====== Modal Saran ======
            if (interaction.isModalSubmit()) {
                if (interaction.customId === 'modal_saran') {
                    const saran = interaction.fields.getTextInputValue('input_saran');
                    const saranChannel = await interaction.guild.channels.fetch(SARAN_CHANNEL_ID);

                    await saranChannel.send(`💡 **Saran dari ${interaction.user}:**\n${saran}`);
                    await interaction.reply({ content: '✅ Saran kamu sudah terkirim! Terima kasih!', ephemeral: true });
                }
            }
        });
    }
};
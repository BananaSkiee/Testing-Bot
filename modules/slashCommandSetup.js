// modules/slashCommandSetup.js

const fs = require("fs");
const path = require("path");

module.exports = async (client) => {
  // Map untuk menyimpan semua perintah agar bisa diakses dari file events/interactionCreate.js
  client.commands = new Map();

  const commands = [];
  const commandsPath = path.join(__dirname, "../commands");
  
  // Pastikan direktori "commands" ada
  if (!fs.existsSync(commandsPath)) {
    console.warn("⚠️ Direktori 'commands' tidak ditemukan. Slash commands tidak akan dimuat.");
    return;
  }
  
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

  for (const file of commandFiles) {
    try {
      const command = require(`${commandsPath}/${file}`);
      // Memastikan command memiliki properti 'data' dan 'execute' yang valid
      if (command?.data && command?.execute) {
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
      } else {
        console.warn(`⚠️ Command "${file}" tidak punya properti 'data' atau 'execute' yang diperlukan.`);
      }
    } catch (err) {
      console.error(`❌ Gagal load command "${file}":`, err);
    }
  }

  // Mendaftarkan perintah ke Discord
  try {
    const guildId = process.env.GUILD_ID || "1347233781391560837";
    const guild = await client.guilds.fetch(guildId);

    if (guild) {
      await guild.commands.set(commands);
      console.log(`✅ ${commands.length} slash command terdaftar di guild "${guild.name}" (${guild.id})`);
    } else {
      console.warn("⚠️ Guild dengan GUILD_ID yang ditentukan tidak ditemukan. Slash commands tidak didaftarkan.");
    }

  } catch (error) {
    console.error("❌ Gagal mendaftarkan slash command:", error);
  }
};

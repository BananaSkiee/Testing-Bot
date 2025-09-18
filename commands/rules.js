// commands/rules.js

const { SlashCommandBuilder } = require("discord.js");
const rulesCommand = require("../modules/rulesCommand.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rules")
    .setDescription("Mengirim embed rules dan punishment."),
  async execute(interaction) {
    await rulesCommand(interaction);
  },
};

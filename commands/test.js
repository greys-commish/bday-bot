const { Models: { SlashCommand } } = require('frame');
const { ApplicationCommandOptionType: ACOT } = require('discord.js');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'test',
			description: "Test the birthday function",
			usage: [
				"- Test stuff"
			],
			ownerOnly: true,
			guildOnly: true
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		await ctx.deferReply();
		var result = await this.#bot.handlers.birthday.testServer(ctx.guild.id);

		if(result.success) return `✅ ${result.message}`
		else return `❌ ${result.message}`
	}
}

module.exports = (bot, stores) => new Command(bot, stores); 
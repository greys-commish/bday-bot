const { Models: { SlashCommand } } = require('frame');
const { ApplicationCommandOptionType: ACOT, ChannelType: CT } = require('discord.js');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'run',
			description: "Test the global birthday function",
			usage: [
				"- Test the global birthday function"
			],
			guildOnly: true,
			ownerOnly: true
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		await ctx.deferReply();
		await this.#bot.handlers.birthday.handleBirthdays(true);

		return 'Test ran!';
	}
}

module.exports = (bot, stores) => new Command(bot, stores); 
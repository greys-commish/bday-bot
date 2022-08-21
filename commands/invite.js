const { Models: { SlashCommand } } = require('frame');
const { ApplicationCommandOptionType: ACOT } = require('discord.js');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'invite',
			description: "View the bot's invite",
			usage: [
				"- Get an invite for the bot"
			]
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		return `You can invite me with this:\n${process.env.INVITE}`
	}
}

module.exports = (bot, stores) => new Command(bot, stores);
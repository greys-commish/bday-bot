const { Models: { SlashCommand } } = require('frame');
const { ApplicationCommandOptionType: ACOT } = require('discord.js');
const axios = require('axios');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'export',
			description: "Export birthdays to import somewhere else",
			usage: [
				"- Export your registered birthdays"
			],
			guildOnly: true
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var data = await this.#stores.birthdays.export(ctx.guild.id, ctx.user.id);

		if(ctx.channel.type !== 'DM') {
			await ctx.user.send({
				content: "Here's your file!",
				files: [{
					attachment: Buffer.from(JSON.stringify(data)),
					name: 'birthdays.json'
				}]
			})
			return {content: "Check your DMs!", ephemeral: true};
		} else {
			return {
				content: "Here's your file!",
				files: [{
					attachment: Buffer.from(JSON.stringify(data)),
					name: 'birthdays.json'
				}]
			}
		}
	}
}

module.exports = (bot, stores) => new Command(bot, stores);
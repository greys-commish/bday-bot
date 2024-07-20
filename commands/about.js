const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: "about",
			description: "Info about the bot",
			usage: [
				"- Gives info about the bot"
			],
			ephemeral: true
		})

		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		return {embeds: [{
			title: "About Me",
			description: "Hi, I'm Birthday Bot! 🎉" +
						 "\nI help keep track of birthdays for you :)" +
						 "\n\nI was commissioned by Zodiac System, and I'm fully compatible with PluralKit and Tupperbox!" +
						 "\nHere's some more about me:",
			fields: [
				{name: "Original idea", value: "Zodiac System"},
				{name: "Developers", value: "[greysdawn](https://github.com/greysdawn) / @greysdawn"},
				{name: "Support Server", value: "[Clicky!](https://discord.gg/EvDmXGt)", inline: true},
				{name: "GitHub Repo", value: "[Clicky!](https://github.com/greys-commish/bday-bot)", inline: true},
				{name: "Stats", value: `Guilds: ${ctx.client.guilds.cache.size} | Users: ${ctx.client.users.cache.size}`},
				{name: "Want to support my creators?", value: "[Patreon](https://patreon.com/greysdawn) | [Ko-Fi](https://ko-fi.com/greysdawn)"}
			]
		}]}
	}
}

module.exports = (bot, stores) => new Command(bot, stores);
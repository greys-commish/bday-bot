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
			ephemeral: true,
			v2: true
		})

		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		return {components: [{
			type: 17,
			components: [
				{
					type: 10,
					content: `## About Me`
				},
				{
					type: 10,
					content: (
						"Hi, I'm Birthday Bot! 🎉" +
						"\nI help keep track of birthdays for you :)" +
						"\n\nI was commissioned by Schäflein, and I'm fully compatible with PluralKit and Tupperbox!" +
						"\nHere's some more about me:"
					)
				},
				{
					type: 10,
					content: (
						"### Original idea\nSchäflein",
						"\n### Developers\n[selenated](https://github.com/selenated) / @.selenated" +
						"\n### Links\n[Support server](https://discord.gg/EvDmXGt) | [Github repo](https://github.com/greys-commish/bday-bot)" +
						"\n### Stats" + `\nGuilds: ${ctx.client.guilds.cache.size} | Users: ${ctx.client.users.cache.size}` +
						"\n### Want to support my developers?\n[Patreon](https://patreon.com/selenated) | [Ko-Fi](https://ko-fi.com/selenated)"
					)
				}
			]
		}]}
	}
}

module.exports = (bot, stores) => new Command(bot, stores);

const { Models: { SlashCommand } } = require('frame');
const { ApplicationCommandOptionType: ACOT } = require('discord.js');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'view',
			description: "View set birthdays",
			options: [
				{
					name: 'user',
					description: "The user to view birthdays for",
					type: ACOT.String,
					required: true
				}
			],
			usage: [
				"- View all server birthdays",
				"[user] - View birthdays set by a specific user"
			]
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var user = ctx.options.getUser('user');

		var bdays;
		if(user) bdays = await this.#stores.birthdays.getByUser(ctx.guild.id, user.id);
		else bdays = await this.#stores.birthdays.getAll(ctx.guild.id);

		var embeds = [];
		var users = {};
		for(var b of bdays) {
			if(!users[b.user_id]) users[b.user_id] = [];

			users[b.user_id].push({
				name: b.name,
				date: b.bday
			})
		}

		for(var u of Object.keys(users)) {
			var data = users[u];
			var user;
			try {
				user = await ctx.guild.members.fetch(u);
			} catch(e) {
				continue;
			}

			var tmp = await this.#bot.utils.genEmbeds(this.#bot)
		}
		// to do: group bdays by user, then paginate
		// similar to help cmd with subcommands
	}
}

module.exports = (bot, stores) => new Command(bot, stores);
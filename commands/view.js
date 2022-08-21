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
					type: ACOT.User,
					required: false
				}
			],
			usage: [
				"- View all server birthdays",
				"[user] - View birthdays set by a specific user"
			],
			guildOnly: true
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var user = ctx.options.getUser('user');

		var bdays;
		if(user) bdays = await this.#stores.birthdays.getByUser(ctx.guild.id, user.id);
		else bdays = await this.#stores.birthdays.getAll(ctx.guild.id);
		if(!bdays?.length) return "No birthdays found!";
		
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
			var us;
			try {
				us = await ctx.guild.members.fetch(u);
			} catch(e) {
				continue;
			}

			var tmp = await this.#bot.utils.genEmbeds(this.#bot, data, (d) => {
				return {
					name: d.name,
					value: `${getStamp(d.date, 'D')} (${getStamp(d.date, 'R')})`
				}
			}, {
				title: `Birthdays for user ${us.user.tag}`
			}, 10, {addition: null})

			embeds = embeds.concat(tmp);
		}

		embeds = embeds.map(e => e.embed);

		for(var i = 0; i < embeds.length; i++)
			embeds[i].title += ` (${i+1}/${embeds.length})`

		return embeds;
	}
}

function getStamp(bday, format) {
	var d = new Date(bday.getTime());
	d.setYear(2022);
	return `<t:${Math.floor(d.getTime()/1000)}:${format}>`;
}

module.exports = (bot, stores) => new Command(bot, stores);
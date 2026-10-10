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
				},
				{
					name: 'sort_by',
					description: "Choose how to sort the data",
					type: ACOT.String,
					required: false,
					choices: [
						{
							name: 'alphabetical',
							value: 'name'
						},
						{
							name: 'date',
							value: 'bday'
						}
					]
				},
				{
					name: 'sort_order',
					description: "The order to sort data in",
					type: ACOT.String,
					required: false,
					choices: [
						{
							name: 'ascending',
							value: 'asc'
						},
						{
							name: 'descending',
							value: 'desc'
						}
					]
				}
			],
			usage: [
				"- View all server birthdays",
				"[user] - View birthdays set by a specific user",
				"<user> [sort_by] [sort_order] - Choose how to sort the list"
			],
			guildOnly: true,
			v2: true,
			ephemeral: true
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		let cfg = await this.#stores.configs.get(ctx.guild.id);

		var user = ctx.options.getUser('user');
		var sb = ctx.options.getString('sort_by');
		var so = ctx.options.getString('sort_order');
		
		const YEAR = new Date().getFullYear();

		var bdays;
		if(user) bdays = await this.#stores.birthdays.getByUser(ctx.guild.id, user.id);
		else bdays = await this.#stores.birthdays.getAll(ctx.guild.id);
		if(!bdays?.length) return "No birthdays found!";
		
		var embeds = [];
		var users = {};
		for(var b of bdays) {
			if(!users[b.user_id]) users[b.user_id] = [];

			users[b.user_id].push(b)
		}

		for(var u of Object.keys(users)) {
			var data = users[u];
			data = sortDates(data, sb, so);
			var us;
			try {
				us = await ctx.guild.members.fetch(u);
			} catch(e) {
				continue;
			}

			var tmp = await this.#bot.utils.genComps(data, (d) => {
				return {
					type: 10,
					content: `### ${d.name}\n${d.getStamp('D', cfg.timezone)} (${d.getStamp('R', cfg.timezone)})`
				}
			}, 10)

			for(var t of tmp) {
				embeds.push({
					allowed_mentions: { parse: [] },
					components: [
						{
							type: 17,
							components: [
								{
									type: 10,
									content: `## Birthdays for user ${us.user.tag}`
								},
								...t,
								{
									type: 14
								},
								{
									type: 10,
									content: `-# Server timezone: \`${cfg.timezone}\`\n-# Dates are displayed in your timezone, but adjusted to midnight in the server's timezone`
								}
							]
						}
					], 
				})
			}
		}

		return embeds;
	}
}

function getStamp(bday, format) {
	return `<t:${Math.floor(bday.getTime()/1000)}:${format}>`;
}

function sortDates(data, by, ord) {
	var t = data;
	switch(by) {
		case 'name':
			t = data.sort((a,b) => {
				a = a.name.toLowerCase();
				b = b.name.toLowerCase();

				
				return (
					a > b ? 1 :
					a < b ? -1 :
					0
				)
			})
			break;
		default:
			t = data.sort((a,b) => {
				return (
					a.bday -
					b.bday
				)
			})
			break;
	}

	if(ord == 'desc') t = t.reverse();
	return t;
}

module.exports = (bot, stores) => new Command(bot, stores);
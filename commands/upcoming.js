const { Models: { SlashCommand } } = require('frame');
const { ApplicationCommandOptionType: ACOT } = require('discord.js');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'upcoming',
			description: "View upcoming birthdays",
			options: [{
				name: 'days',
				description: "The number of days to include upcoming birthdays for. Default: 30 days",
				type: ACOT.String,
				choices: [
					{
						name: '1 day',
						value: '1'
					},
					{
						name: '7 days',
						value: '7'
					},
					{
						name: '30 days',
						value: '30'
					},
					{
						name: '90 days',
						value: '90'
					}
				],
				required: false
			}],
			usage: [
				"- View birthdays happening in the next 30 days"
			],
			guildOnly: true
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var days = ctx.options.getString('days')?.trim();
		if(days) days = parseInt(days);

		var bdays = await this.#stores.birthdays.getUpcoming(ctx.guild.id, days ?? 30);
		if(!bdays?.length) return "No upcoming birthdays found!";

		var embeds = await this.#bot.utils.genEmbeds(this.#bot, bdays, (bd) => ({
			name: bd.name,
			value: `${bd.getStamp('D')} (${bd.getStamp('R')})\n(Added by <@${bd.user_id}>)`
		}), { title: 'Upcoming Birthdays'}, 10);

		return embeds.map(e => e.embed);
	}
}

module.exports = (bot, stores) => new Command(bot, stores);
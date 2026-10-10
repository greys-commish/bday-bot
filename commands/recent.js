const { Models: { SlashCommand } } = require('frame');
const { ApplicationCommandOptionType: ACOT, ChannelType: CT } = require('discord.js');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'recent',
			description: "View recent birthdays",
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
				"- View birthdays that happened in the past 30 days"
			],
			guildOnly: true,
			v2: true,
			ephemeral: true
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var cfg = await this.#stores.configs.get(ctx.guild.id);
		if(!cfg.timezone) cfg.timezone = 'Europe/London';
		var date = new Date(new Date().toLocaleString('en-US', { timeZone: cfg.timezone }));

		var days = ctx.options.getString('days')?.trim();
		if(days) days = parseInt(days);

		var bdays = await this.#stores.birthdays.getRecent(ctx.guild.id, days, date);
		if(!bdays?.length) return "No recent birthdays found!";

		var embeds = await this.#bot.utils.genComps(bdays, (bd) => ({
			type: 10,
			content: `### ${bd.name}\n${bd.getStamp('D', cfg.timezone)} (${bd.getStamp('R', cfg.timezone)})\n(Added by <@${bd.user_id}>)`
		}), 10);

		return embeds.map(e => ({
			allowed_mentions: { parse: [] },
			components: [{
				type: 17,
				components: [
					{
						type: 10,
						content: `## Recent Birthdays`
					},
					...e,
					{
						type: 14
					},
					{
						type: 10,
						content: `-# Server timezone: \`${cfg.timezone}\`\n-# Dates are displayed in your timezone, but adjusted to midnight in the server's timezone`
					}
				]
			}]
		}));
	}
}

module.exports = (bot, stores) => new Command(bot, stores);
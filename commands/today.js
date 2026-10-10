const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'today',
			description: "View today's birthdays",
			usage: [
				"- View birthdays happening today"
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

		var date = new Date(new Date(new Date().toLocaleString('en-US', { timeZone: cfg.timezone })));
		var year = date.getYear();
		var ds = `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

		var bdays = await this.#stores.birthdays.getDayByServer(ctx.guild.id, ds);
		if(!bdays) bdays = []
		if(leapCheck(ds, year)) {
			var extras = await this.stores.birthdays.getDayByServer(ctx.guild.id, '02-29');
			bdays = bdays.concat(extras)
		}

		if(!bdays?.length) return "No birthdays found on today!";

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
						content: `## Today's Birthdays`
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

function pad(s) {
	return ('00' + s).slice(-2);
}

function leapCheck(ds, year) {
	if(!isLeap(year)) return false;
	if(ds != '02-28') return false;

	return true;
}

function isLeap(yr) {
	return (
		((yr % 4 == 0) && (yr % 100 != 0)) ||
		(yr % 400 == 0)
	)
}

module.exports = (bot, stores) => new Command(bot, stores);
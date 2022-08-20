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
			]
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var date = new Date();
		var year = date.getYear();
		var ds = `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

		var bdays = await this.#stores.birthdays.getDayByServer(ctx.guild.id, ds);
		if(!bdays) bdays = []
		if(leapCheck(ds, year)) {
			var extras = await this.stores.birthdays.getDayByServer(ctx.guild.id, '02-29');
			bdays = bdays.concat(extras)
		}

		if(!bdays?.length) return "No birthdays found on today!";

		var embeds = await this.#bot.utils.genEmbeds(this.#bot, bdays, (bd) => ({
			name: bd.name,
			value: `${bd.getStamp('D')} (${bd.getStamp('R')})\n(Added by <@${bd.user_id}>)`
		}), { title: "Today's Birthdays"}, 10);

		return embeds.map(e => e.embed);
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
const { Models: { SlashCommand } } = require('frame');
const { ApplicationCommandOptionType: ACOT, ChannelType: CT } = require('discord.js');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'upcoming',
			description: "View upcoming birthdays",
			usage: [
				"- View birthdays happening in the next 30 days"
			]
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var bdays = await this.#stores.birthdays.getUpcoming(ctx.guild.id);
		if(!bdays?.length) return "No upcoming birthdays found!";

		var embeds = await this.#bot.utils.genEmbeds(this.#bot, bdays, (bd) => ({
			name: bd.name,
			value: `${bd.getStamp('D')} (${bd.getStamp('R')})\n(Added by <@${bd.user_id}>)`
		}), { title: 'Upcoming Birthdays'}, 10);

		return embeds.map(e => e.embed);
	}
}

module.exports = (bot, stores) => new Command(bot, stores);
const { Models: { SlashCommand } } = require('frame');
const { ApplicationCommandOptionType: ACOT } = require('discord.js');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'timezone',
			description: "Set the server timezone",
			options: [
				{
					name: 'timezone',
					description: "The timezone to set for the server",
					type: ACOT.String,
					required: false,
					autocomplete: true
				}
			],
			usage: [
				"- View current timezone",
				"[timezone] - Set the server timezone"
			],
			guildOnly: true,
			permissions: ['ManageGuild']
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var cfg = await this.#stores.configs.get(ctx.guild.id);
		var tz = ctx.options.getString('timezone');

		if(!tz) return {
			content: `Your current timezone is **${cfg.timezone ?? "not set"}**`,
			ephemeral: true
		}

		if(!Intl.supportedValuesOf('timeZone').includes(tz)) return "Timezone not found!";

		cfg.timezone = tz;
		await cfg.save();

		return "Timezone set!";
	}

	async auto(ctx) {
		var zones = Intl.supportedValuesOf('timeZone');
		var foc = ctx.options.getFocused();
		var z;
		if(!foc) z = zones;
		else {
			foc = foc.toLowerCase()
			z = zones.filter(x => (
				x.toLowerCase().includes(foc)
			))
		}
		
		return z.slice(0, 25).map(x => ({ name: x, value: x }));;
	}
}

module.exports = (bot, stores) => new Command(bot, stores);
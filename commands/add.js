const { Models: { SlashCommand } } = require('frame');
const { ApplicationCommandOptionType: ACOT } = require('discord.js');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'add',
			description: "Add a new birthday",
			options: [
				{
					name: 'name',
					description: "The name to set for the birthday",
					type: ACOT.String,
					required: true
				},
				{
					name: 'date',
					description: "The date to set for the birthday. Format: MM-DD",
					type: ACOT.String,
					required: true
				}
			],
			usage: [
				"[name] [date] - Add a new birthday"
			],
			extra: "Example: `/add name:example date:01-12` sets your birthday to January 12th",
			guildOnly: true
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var name = ctx.options.getString('name').trim();
		if(name.length > 100) return "Please enter a shorter name! Names should be 100 characters or less";
		var ds = ctx.options.getString('date').trim();
		if(!ds.match(/^\d{2}-\d{2}$/)) return "Please enter a valid date! Note that the format should be MM-DD, like `01-12`";
		var bday;
		if(ds == '02-29') bday = `2004-02-29`;
		else bday = `2000-${ds}`;
		if(isNaN(new Date(bday))) return "Please enter a valid date!";

		await this.#stores.birthdays.create({
			server_id: ctx.guild.id,
			user_id: ctx.user.id,
			name,
			bday
		})
		return "Birthday added! Use `/view user:@yourself` to view your set birthdays";
	}
}

module.exports = (bot, stores) => new Command(bot, stores);
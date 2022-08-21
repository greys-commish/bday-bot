const { Models: { SlashCommand } } = require('frame');
const { ApplicationCommandOptionType: ACOT } = require('discord.js');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'edit',
			description: "Edit an existing birthday",
			options: [
				{
					name: 'birthday',
					description: "The birthday to edit",
					type: ACOT.String,
					required: true,
					autocomplete: true
				},
				{
					name: 'property',
					description: "The property to edit",
					type: ACOT.String,
					required: true,
					choices: [
						{
							name: 'name',
							value: 'name'
						},
						{
							name: 'date',
							value: 'bday'
						}
					]
				},
				{
					name: 'value',
					description: "The new value to set. Note that dates should be MM-DD",
					type: ACOT.String,
					required: true
				}
			],
			usage: [
				"[birthday] property:date [value] - Edit the date for a birthday",
				"[birthday] property:name [value] - Edit the name for a birthday"
			],
			guildOnly: true
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var birthday = ctx.options.getString('birthday').trim();
		var prop = ctx.options.getString('property').trim();
		var val = ctx.options.getString('value').trim();

		var bday = await this.#stores.birthdays.get(ctx.guild.id, ctx.user.id, birthday);
		if(!bday?.id) return "Birthday not found!";

		switch(prop) {
			case 'name':
				if(val.length > 100) return "Name is too long! Names should be 100 characters or less";
				break;
			case 'bday':
				if(!val.match(/^\d{2}-\d{2}$/)) return "Please enter a valid date! Note that the format should be MM-DD, like `01-12`";
				var tmp;
				if(val == '02-29') tmp = `2004-02-29`;
				else tmp = `2000-${val}`;
				if(isNaN(new Date(tmp))) return "Please enter a valid date!";
				val = tmp;
				break;
		}

		bday[prop] = val;
		await bday.save();

		return "Birthday updated!";
	}

	async auto(ctx) {
		var bdays = await this.#stores.birthdays.getByUser(ctx.guild.id, ctx.user.id);
		if(!bdays?.length) return [];
		var foc = ctx.options.getFocused();
		if(!foc) return bdays.map(b => ({ name: b.name, value: b.hid })).slice(0, 25);
		foc = foc.toLowerCase()

		return bdays.filter(b =>
			b.hid.includes(foc) ||
			b.name.toLowerCase().includes(foc)
		).map(b => ({
			name: b.name,
			value: b.hid
		})).slice(0, 25)
	}
}

module.exports = (bot, stores) => new Command(bot, stores);
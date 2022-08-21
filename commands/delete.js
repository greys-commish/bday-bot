const { Models: { SlashCommand } } = require('frame');
const { ApplicationCommandOptionType: ACOT } = require('discord.js');
const { confBtns } = require('../extras');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'delete',
			description: "Delete an existing birthday",
			options: [
				{
					name: 'birthday',
					description: "The birthday to delete",
					type: ACOT.String,
					required: false,
					autocomplete: true
				}
			],
			usage: [
				"[birthday] - Deletes a birthday",
				"- Deletes ALL birthdays"
			]
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var birthday = ctx.options.getString('birthday')?.trim();

		if(birthday) {
			var bday = await this.#stores.birthdays.get(ctx.guild.id, ctx.user.id, birthday);
			if(!bday?.id) return "Birthday not found!";

			await bday.delete();
			return "Birthday deleted!";
		}

		var rdata = {
			content: 
				"Are you **sure** you want to delete ALL your birthdays?\n" +
				"**WARNING: This can't be undone!**",
			components: [
				{
					type: 1,
					components: confBtns
				}
			]
		}
		var reply = await ctx.reply({...rdata, fetchReply: true});

		var conf = await this.#bot.utils.getConfirmation(this.#bot, reply, ctx.user);
		var msg;
		if(conf.msg) {
			msg = conf.msg;
		} else {
			await this.#stores.birthdays.deleteAllByUser(ctx.guild.id, ctx.user.id);
			msg = 'Birthdays deleted!';
		}

		return msg;
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
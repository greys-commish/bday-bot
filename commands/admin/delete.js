const { Models: { SlashCommand } } = require('frame');
const { ApplicationCommandOptionType: ACOT } = require('discord.js');
const { confBtns } = require('../../extras');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'delete',
			description: "Delete birthdays from the server",
			options: [
				{
					name: 'user',
					description: "The user to delete birthdays from",
					type: ACOT.User,
					required: true
				}
			],
			usage: [
				"[user] - Deletes birthdays for a specific user",
				"- Deletes ALL birthdays"
			],
			guildOnly: true
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var user = ctx.options.getUser('user');

		var rdata = {
			content: 
				"Are you **sure** you want to delete ALL birthdays for this user?\n" +
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
		if(conf.msg) return conf.msg;

		await this.#stores.birthdays.deleteAllByUser(ctx.guild.id, ctx.user.id);
		return 'Birthdays deleted!';
	}
}

module.exports = (bot, stores) => new Command(bot, stores);
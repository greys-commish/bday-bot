const { Models: { SlashCommand } } = require('frame');
const { ApplicationCommandOptionType: ACOT, ChannelType: CT } = require('discord.js');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'test',
			description: "Test the birthday function",
			usage: [
				"- Test the birthday function with the configured channel",
				"[channel] - Test the birthday function with a specified channel"
			],
			options: [
				{
					name: 'channel',
					description: "The channel to send the message to",
					type: ACOT.Channel,
					channel_types: [
						CT.GuildText,
						CT.GuildNews,
						CT.GuildNewsThread,
						CT.GuildPrivateThread,
						CT.GuildPublicThread
					],
					required: false
				}
			],
			guildOnly: true,
			permissions: ['ManageMessages'],
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		await ctx.deferReply();
		var ch = ctx.options.getChannel('channel');
		var result = await this.#bot.handlers.birthday.testServer(ctx.guild.id, ch?.id);

		if(result.success) return `✅ ${result.message}`
		else return `❌ ${result.message}`
	}
}

module.exports = (bot, stores) => new Command(bot, stores); 
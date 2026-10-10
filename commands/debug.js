const { Models: { SlashCommand } } = require('frame');
const { PermissionFlagsBits: BITS } = require('discord.js');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'debug',
			description: "Debug the birthday function",
			usage: [
				"- Debug issues with sending birthdays"
			],
			guildOnly: true,
			permissions: ['ManageMessages'],
			v2: true
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		await ctx.deferReply();
		var results = {
			fail: [],
			pass: []
		}

		var cfg = await this.#stores.configs.get(ctx.guild.id);
		if(!cfg?.channel) results.fail.push("Birthday channel not configured.");
		else results.pass.push("Birthday channel configured!");
		
		try {
			var ch;
			if(cfg.channel) ch = await ctx.guild.channels.fetch(cfg.channel);
			if(ch) results.pass.push("Birthday channel exists!");
		} catch(e) {
			console.log(e.message, e);
			if(e.message.includes('Missing Access')) results.fail.push("Missing birthday channel access; make sure I can view that channel!");
			if(e.message.includes("Unknown Channel")) results.fail.push("Birthday channel was deleted.");
		}

		if(ch?.id) {
			var member = await ctx.guild.members.fetch(this.#bot.user.id);
			var perms = await ch.permissionsFor(member);
			if(!perms.has(BITS.ViewChannel)) results.fail.push("View Channel permission not granted.");
			else results.pass.push("View Channel permission granted!");
			if(!perms.has(BITS.SendMessages)) results.fail.push("Send Messages permission not granted.");
			else results.pass.push("Send Messages permission granted!");
		}

		return {
			components: [{
				type: 17,
				components: [
					{
						type: 10,
						content: `## Debug Results`
					},
					{
						type: 10,
						content: `### Passing\n` + results.pass.length ? results.pass.map(x => `✅ ` + x).join("\n") : "(None 😟)"
					},
					{
						type: 10,
						content: `### Failing\n` + results.fail.length ? results.fail.map(x => `❌ ` + x).join("\n") : "(None 🎉)"
					}
				]
			}]
		}
	}
}

module.exports = (bot, stores) => new Command(bot, stores); 
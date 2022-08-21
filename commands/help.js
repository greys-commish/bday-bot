const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'help',
			description: "View command help",
			options: [
				{
					name: 'command',
					description: "View help for a specific command in a module",
					type: 3,
					required: false
				}
			],
			usage: [
				"- View all commands",
				"[command] - Get help for a specific command"	
			],
			extra: "Examples:\n"+
				   "`/help command:add` - Shows help for the add command",
			ephemeral: true
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var cmd = ctx.options.getString('command')?.toLowerCase().trim();
		
		var embeds = [];
		var cmds;
		if(!cmd) {
			embeds = [{
				title: "I'm Birthday Bot! 🧁",
				description: "I help you keep track of and celebrate birthdays!! Here's how to get started:",
				fields: [
					{
						name: "Set up the birthday channel",
						value: "Use `/channel` to set up the channel for your birthday pings"
					},
					{
						name: "Set the server's timezone",
						value: "Use `/timezone` to set the timezone for your server"
					},
					{
						name: "Set up who to ping",
						value: (
							"Use `/pings` to set who should get pinged!\n" +
							"- If it's set to `user`, then only the user who added the birthday will be pinged\n" +
							"- If it's set to `everyone`, then everyone will get pinged\n" +
							"- Set it to `role` and set the correct role to have that get pinged!"
						)
					},
					{
						name: "Add in your birthdays!",
						value: (
							"Users can use `/add` to set multiple birthdays, with a name for each one. " +
							"You can also `/import` birthdays from Tupperbox or PluralKit!"
						)
					},
					{
						name: "That's it!",
						value: "The bot should now be set up and ready to go!"
					},
					{
						name: "Need help? Join the support server!",
						value: "[https://discord.gg/EvDmXGt](https://discord.gg/EvDmXGt)",
						inline: true
					},
					{
						name: "Support my creators!",
						value: 
							"[patreon](https://patreon.com/greysdawn) | " +
							"[ko-fi](https://ko-fi.com/greysdawn)",
						inline: true
					}
				],
				color: 0xffe8b6,
				footer: {
					icon_url: this.#bot.user.avatarURL(),
					text: "Use the buttons below to flip pages!"
				}
			}]
			cmds = this.#bot.slashCommands.map(m => m);

			var e = {
				title: "Commands",
				fields: []
			}

			for(var c of cmds) e.fields.push({name: '/' + c.name, value: c.description});
			embeds.push(e)
		} else {
			var cm;
			cm = this.#bot.slashCommands.find(c => (c.name ?? c.data.name) == cmd);
			if(!cm) return "Command not found!";

			embeds = [{
				title: cm.name,
				description: cm.description,
				fields: [],
				color: 0xee8833
			}]

			if(cm.usage?.length) embeds[embeds.length - 1].fields.push({
				name: "Usage",
				value: cm.usage.map(u => `/${cm.name} ${u}`).join("\n")
			})

			if(cm.extra?.length) embeds[embeds.length - 1].fields.push({
				name: "Extra",
				value: cm.extra
			});	
		}

		if(embeds.length > 1)
			for(var i = 0; i < embeds.length; i++)
				embeds[i].title += ` (${i+1}/${embeds.length})`;
		return embeds;
	}
}

module.exports = (bot, stores) => new Command(bot, stores);
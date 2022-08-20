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
					name: 'module',
					description: "View help for a specific group of commands",
					type: 3,
					required: false
				},
				{
					name: 'command',
					description: "View help for a specific command in a module",
					type: 3,
					required: false
				},
				{
					name: 'subcommand',
					description: "View help for a command's subcommand",
					type: 3,
					required: false
				}
			],
			usage: [
				"[module] - Get help for a module",
				"[module] [command] - Get help for a command in a module",
				"[module] [command] [subcommand] - Get help for a command's subcommand"	
			],
			extra: "Examples:\n"+
				   "`/help module:form` - Shows form module help",
			ephemeral: true
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var mod = ctx.options.getString('module')?.toLowerCase().trim();
		var cmd = ctx.options.getString('command')?.toLowerCase().trim();
		var scmd = ctx.options.getString('subcommand')?.toLowerCase().trim();

		var embeds = [];
		var cmds;
		if(!mod && !cmd && !scmd) {
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
			var mods = this.#bot.slashCommands.map(m => m).filter(m => m.subcommands.size);
			var ug = this.#bot.slashCommands.map(m => m).filter(m => !m.subcommands.size);
			for(var m of mods) {
				var e = {
					title: m.name.toUpperCase(),
					description: m.description
				}

				cmds = m.subcommands.map(o => o);
				var tmp = await this.#bot.utils.genEmbeds(this.#bot, cmds, (c) => {
					return {name: `/${m.name} ${c.name}`, value: c.description}
				}, e, 10, {addition: ""})
				embeds = embeds.concat(tmp.map(e => e.embed))
			}

			if(ug?.[0]) {
				var e = {
					title: "UNGROUPED",
					description: "Miscellaneous commands",
					fields: []
				}

				for(var c of ug) e.fields.push({name: '/' + c.name, value: c.description});
				embeds.push(e)
			}
		} else {
			var name = "";
			var cm;
			if(mod) {
				cm = this.#bot.slashCommands.get(mod);
				if(!cm) return "Module not found!";
				cmds = cm.subcommands.map(o => o);
				name += (cm.name ?? cm.name) + " ";
			} else {
				cmds = this.#bot.slashCommands.map(c => c);
			}

			if(cmd) {
				cm = cmds.find(c => (c.name ?? c.name) == cmd);
				if(!cm) return "Command not found!";
				cmds = cm.subcommands?.map(o => o);
				name += `${cm.name ?? cm.name} `;

				if(scmd) {
					cm = cmds?.find(c => (c.name ?? c.name) == scmd);
					if(!cm) return "Subcommand not found!";
					name += `${cm.name ?? cm.name}`;
				}
			}

			if(cm.subcommands?.size) {
				embeds = await this.#bot.utils.genEmbeds(this.#bot, cm.subcommands.map(c => c), (c) => {
					return {name: `**/${name.trim()} ${c.name}**`, value: c.description}
				}, {
					title: name.toUpperCase(),
					description: cm.description,
					color: 0xee8833
				}, 10, {addition: ""})
				embeds = embeds.map(e => e.embed);
			} else {
				embeds = [{
					title: name,
					description: cm.description,
					fields: [],
					color: 0xee8833
				}]

				if(cm.usage?.length) embeds[embeds.length - 1].fields.push({
					name: "Usage",
					value: cm.usage.map(u => `/${name.trim()} ${u}`).join("\n")
				})

				if(cm.extra?.length) embeds[embeds.length - 1].fields.push({
					name: "Extra",
					value: cm.extra
				});
			}	
		}

		if(embeds.length > 1)
			for(var i = 0; i < embeds.length; i++)
				embeds[i].title += ` (${i+1}/${embeds.length})`;
		return embeds;
	}
}

module.exports = (bot, stores) => new Command(bot, stores);
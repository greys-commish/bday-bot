const { Models: { SlashCommand } } = require('frame');
const { ApplicationCommandOptionType: ACOT } = require('discord.js');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'pings',
			description: "Set who should get pinged for birthdays",
			options: [
				{
					name: 'target',
					description: "The target to set for pings",
					type: ACOT.String,
					choices: [
						{
							name: 'User',
							value: 'user'
						},
						{
							name: 'Everyone',
							value: 'everyone'
						},
						{
							name: 'Role',
							value: 'role'
						}
					],
					required: true
				},
				{
					name: 'role',
					description: "The role to set, if a role is the desired target",
					type: ACOT.Role,
					required: false
				}
			],
			usage: [
				"[target] - Set the ping target for celebrating birthdays",
				"target: role [role] - Set a role to be the ping target"
			],
			permissions: ['ManageMessages']
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var config = await this.#stores.configs.get(ctx.guild.id);
		var target = ctx.options.getString('target');
		var role = ctx.options.getRole('role');

		if(target == 'role') {
			if(!role?.id) return "Please provide a role to ping!";
			config.pings = role.id;
		} else config.pings = target;

		await config.save();

		return "Config set!";
	}
}

module.exports = (bot, stores) => new Command(bot, stores);
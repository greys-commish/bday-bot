const { Models: { SlashCommand } } = require('frame');
const { ApplicationCommandOptionType: ACOT } = require('discord.js');
const axios = require('axios');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: 'import',
			description: "Import birthdays from Tupperbox or PluralKit. Imports private members by default",
			options: [
				{
					name: 'url',
					description: "The URL for a file to import",
					type: ACOT.String,
					required: false
				},
				{
					name: 'file',
					description: "A direct file upload",
					type: ACOT.Attachment,
					required: false
				},
				{
					name: 'private',
					description: "Choose whether private members should be imported",
					type: ACOT.Boolean,
					required: false
				}
			],
			usage: [
				"[url] - Import a file with a URL",
				"[file] - Import a file with an attachment",
				"[private: false] - Import a file without private members included"
			],
			guildOnly: true
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var url = ctx.options.getString('url')?.trim();
		var file = ctx.options.getAttachment('file')?.url;
		var priv = ctx.options.getBoolean('private');
		if(priv !== false) priv = true;
		if(!url && !file) return "I need either a file URL or a direct upload!";
		var f = url ?? file;
		var data;
		try {
			data = (await axios(f)).data;
		} catch(e) {
			console.log(e);
			return "Please attach a valid .json file!";
		}

		var result = await this.#stores.birthdays.import(data, ctx.guild.id, ctx.user.id, priv);
		if(result.fail) return result.err;
		return `Birthdays imported!\nCreated: ${result.created}\nUpdated: ${result.updated}`
	}
}

module.exports = (bot, stores) => new Command(bot, stores);
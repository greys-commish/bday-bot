const schedule = require('node-schedule');

class BirthdayHandler {
	constructor(bot) {
		this.bot = bot;
		this.stores = bot.stores;

		bot.once('ready', () => {
			this.job = schedule.scheduleJob('0 12 * * *', this.handleBirthdays)
		})
	}

	handleBirthdays() {
		var bdays = await this.stores.birthdays.getToday();

		var configs = {};
		var toSend = {};
		for(var bd of bdays) {
			if(!configs[bd.server_id]) configs[bd.server_id] = await this.stores.configs.get(bd.server_id);
			var cfg = configs[bd.server_id];
			if(!toSend[cfg.channel_id]) toSend[cfg.channel_id] = { config: cfg, bdays: []};
			toSend[cfg.channel_id].bdays.push(`${bd.name} (<@${bd.user_id}>)`)
		}

		for(var c of Object.keys(toSend)) {
			var data = toSend[c];
			var channel;
			try {
				channel = await this.bot.channels.fetch(c);
			} catch(e) {
				continue;
			}

			var bdays = data.bdays.join('\n')

			var msg;
			switch(config.pings) {
				case 'everyone':
					msg = "Hey @everyone! Here are today's birthdays:";
					break;
				case 'user':
					msg = "Hey everyone! Here are today's birthdays:";
					break;
				default:
					msg = `Hey <@&${config.pings}>! Here are today's birthdays:`;
					break;
			}

			msg = msg + bdays;
			await channel.send(msg);
		}
	}
}

module.exports = (bot) => new BirthdayHandler(bot);
const schedule = require('node-schedule');

function pad(s) {
	return ('00' + s).slice(-2);
}

class BirthdayHandler {
	constructor(bot) {
		this.bot = bot;
		this.stores = bot.stores;

		bot.once('ready', () => {
			this.job = schedule.scheduleJob('0 12 * * *', () => this.handleBirthdays())
		})
	}

	async handleBirthdays() {
		var date = new Date();
		var year = date.getYear();
		var ds = `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

		var bdays = await this.stores.birthdays.getDay(ds);
		if(!bdays) bdays = []
		if(this.leapCheck(ds, year)) {
			var extras = await this.stores.birthdays.getDay('02-29');
			bdays = bdays.concat(extras)
		}

		if(!bdays?.length) return;

		var configs = {};
		var toSend = {};
		for(var bd of bdays) {
			if(!configs[bd.server_id]) configs[bd.server_id] = await this.stores.configs.get(bd.server_id);
			var cfg = configs[bd.server_id];
			if(!toSend[cfg.channel]) toSend[cfg.channel] = { config: cfg, bdays: []};
			toSend[cfg.channel].bdays.push(`**${bd.name}** (<@${bd.user_id}>)`)
		}

		for(var c of Object.keys(toSend)) {
			var data = toSend[c];
			var channel;
			try {
				channel = await this.bot.channels.fetch(c);
			} catch(e) {
				console.log(e)
				continue;
			}

			var bds = data.bdays.join('\n')

			var msg;
			switch(data.config.pings) {
				case 'everyone':
					msg = "Hey @everyone! Here are today's birthdays:\n";
					break;
				case 'user':
				case undefined:
				case null:
					msg = "Hey everyone! Here are today's birthdays:\n";
					break;
				default:
					msg = `Hey <@&${data.config.pings}>! Here are today's birthdays:\n`;
					break;
			}

			msg = msg + bds;
			await channel.send(msg);
		}
	}

	// include leap birthdays today?
	leapCheck(ds, year) {
		if(!this.isLeap(year)) return false;
		if(ds != '02-28') return false;

		return true;
	}

	isLeap(yr) {
		return (
			((yr % 4 == 0) && (yr % 100 != 0)) ||
			(yr % 400 == 0)
		)
	}
}

module.exports = (bot) => new BirthdayHandler(bot);
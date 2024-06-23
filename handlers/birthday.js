const schedule = require('node-schedule');

function pad(s) {
	return ('00' + s).slice(-2);
}

class BirthdayHandler {
	constructor(bot) {
		this.bot = bot;
		this.stores = bot.stores;

		bot.once('ready', () => {
			this.job = schedule.scheduleJob('0 */1 * * *', () => this.handleBirthdays())
		})
	}

	// new strategy: go through every server
	// and try to get birthdays for the given date
	async handleBirthdays() {
		var configs = await this.stores.configs.getAll();
		var toSend = {};
		var bds = {}
		for(var cfg of configs) {
			if(!cfg.timezone) cfg.timezone = 'Europe/London';

			var tzDate = new Date(new Date().toLocaleString('en-US', { timeZone: cfg.timezone }))
			if(tzDate.getHours() !== 12) continue; // check if it's noon, ignore birthdays if it isn't
			var year = tzDate.getYear();
			var ds = `${pad(tzDate.getMonth() + 1)}-${pad(tzDate.getDate())}`;

			var bdays;
			if(bds[ds]) {
				bdays = bds[ds];
			} else {
				bdays = await this.stores.birthdays.getDay(ds);
				if(!bdays) bdays = [];
				if(this.leapCheck(ds, year)) {
					var extras = await this.stores.birthdays.getDay('02-29');
					bdays = bdays.concat(extras ?? []);
				}

				bds[ds] = bdays;
			}

			bdays = bdays.filter(x => x.server_id == cfg.server_id);
			if(!bdays?.length) continue;

			toSend[cfg.channel] = {
				config: cfg,
				bdays: (
					bdays
					  .map(bd => `**${bd.name}** (<@${bd.user_id}>)`)
				)
			}
		}

		for(var c of Object.keys(toSend)) {
			var data = toSend[c];
			var bds = data.bdays.join('\n')

			await this.sendBirthdays(data, bds)
		}
	}

	async sendBirthdays(data, bdays) {
		var channel;
		try {
			channel = await this.bot.channels.fetch(data.config.channel);
		} catch(e) {
			console.log(`Error fetching channel ${data.config.channel} in server ${data.config.server_id}: ${e.message}`)
			return;
		}
		
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

		msg = msg + bdays;
		try {
			await channel.send(msg);	
		} catch(e) {
			console.log(`Error sending message in channel ${channel.id}: ${e.message}`)
		}

		return;
	}

	async testServer(server, channel) {
		var date = new Date();
		var year = date.getYear();
		var ds = `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
		
		var config = await this.stores.configs.get(server);
		if(!config?.channel && !channel) return { success: false, message: 'No channel specified or configured for the server!' };
		if(channel) config.channel = channel;
		var raw = await this.stores.birthdays.getDay(ds);
		if(raw?.length) raw = raw.filter(x => x.server_id == server);
		if(!raw?.length) return { success: false, message: "No birthdays to send for today!" };

		var bds = raw.map(bd => `**${bd.name}** (<@${bd.user_id}>)`);

		try {
			await this.sendBirthdays({config}, bds);
		} catch(e) {
			console.log(e.message ?? e);
			return { success: false, message: "There was an error with sending birthdays :(" };
		}

		return { success: true, message: "Birthdays should've been sent!" };
	}

	// include leap birthdays today?
	leapCheck(ds, year) {
		if(this.isLeap(year) && ds == '02-29') return true;
		if(!this.isLeap(year) && ds == '03-01') return true;

		return false;
	}

	isLeap(yr) {
		return (
			((yr % 4 == 0) && (yr % 100 != 0)) ||
			(yr % 400 == 0)
		)
	}
}

module.exports = (bot) => new BirthdayHandler(bot);
const { Models: { DataStore, DataObject } } = require('frame');

const KEYS = {
	id: { },
	server_id: { },
	user_id: { },
	hid: { },
	name: { patch: true },
	bday: { patch: true }
}

class Birthday extends DataObject {	
	constructor(store, keys, data) {
		super(store, keys, data);
	}

	getStamp(format) {
		var d = new Date(this.bday);
		d.setYear(new Date().getFullYear());
		return `<t:${Math.floor(d.getTime()/1000)}:${format}>`;
	}
}

class BirthdayStore extends DataStore {
	constructor(bot, db) {
		super(bot, db)
	}

	async init() {
		await this.db.query(`CREATE TABLE IF NOT EXISTS birthdays (
			id 					SERIAL PRIMARY KEY,
			server_id 			TEXT,
			user_id 			TEXT,
			hid 				TEXT,
			name 				TEXT,
			bday 				DATE
		)`)
	}

	async create(data = {}) {
		try {
			var c = await this.db.query(`INSERT INTO birthdays (
				server_id,
				user_id,
				hid,
				name,
				bday
			) VALUES ($1,$2,find_unique('birthdays'),$3,$4)
			RETURNING id`,
			[data.server_id, data.user_id,
			 data.name, data.bday]);
		} catch(e) {
			console.log(e);
	 		return Promise.reject(e.message);
		}
		
		return await this.getID(c.rows[0].id);
	}

	async index(data = {}) {
		try {
			await this.db.query(`INSERT INTO birthdays (
				server_id,
				user_id,
				hid,
				name,
				bday
			) VALUES ($1,$2,$3,$4,$5)`,
			[data.server_id, data.user_id,
			 data.hid, data.name, data.bday]);
		} catch(e) {
			console.log(e);
	 		return Promise.reject(e.message);
		}
		
		return;
	}

	async get(server, user, hid) {
		try {
			var data = await this.db.query(`SELECT * FROM birthdays WHERE server_id = $1 AND user_id = $2 AND hid = $3`,[server, user, hid]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}
		
		if(data.rows?.[0]) {
			return new Birthday(this, KEYS, data.rows[0]);
		} else return new Birthday(this, KEYS, {server_id: server, user_id: user});
	}

	async getID(id) {
		try {
			var data = await this.db.query(`SELECT * FROM birthdays WHERE id = $1`,[id]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}
		
		if(data.rows?.[0]) {
			return new Birthday(this, KEYS, data.rows[0]);
		} else return new Birthday(this, KEYS, {});
	}

	async getAll(server) {
		try {
			var data = await this.db.query(`
				select * from birthdays where
				server_id = $1
				order by bday asc
			`, [server])
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}

		if(!data.rows?.[0]) return undefined;
		else return data.rows.map(b => new Birthday(this, KEYS, b));
	}

	async getByUser(server, user) {
		try {
			var data = await this.db.query(`
				select * from birthdays where
				server_id = $1 AND user_id = $2
				order by bday asc
			`, [server, user])
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}

		if(!data.rows?.[0]) return undefined;
		else return data.rows.map(b => new Birthday(this, KEYS, b));
	}

	async getDay(ds) {
		try {
			var data = await this.db.query(`
				select * from birthdays where
				to_char(bday, 'MM-DD') = $1
			`, [ds])
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}

		if(!data.rows?.[0]) return undefined;
		else return data.rows.map(b => new Birthday(this, KEYS, b));
	}

	async getDayByServer(server, ds) {
		try {
			var data = await this.db.query(`
				select * from birthdays where
				server_id = $1 and
				to_char(bday, 'MM-DD') = $2
			`, [server, ds])
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}

		if(!data.rows?.[0]) return undefined;
		else return data.rows.map(b => new Birthday(this, KEYS, b));
	}

	async getUpcoming(server, days = 30) {
		console.log(days)
		try {
			var data = await this.db.query(`
				select * from (
					select
						id,
						server_id,
						user_id,
						name,
						(bday + make_interval(years := $2 - extract(year from bday)::integer)) as bday
					from birthdays
				) t where
				bday > CURRENT_DATE and
				bday <= (CURRENT_DATE + $3 * interval '1 day')
				and server_id = $1
				order by bday desc;
			`, [server, new Date().getFullYear(), days])
		} catch(e) {
			console.log(e, data);
			return Promise.reject(e.message);
		}

		if(!data.rows?.[0]) return undefined;
		else return data.rows.map(b => new Birthday(this, KEYS, b));
	}

	async getRecent(server, days = 30) {
		try {
			var data = await this.db.query(`
				select * from (
					select
						id,
						server_id,
						user_id,
						name,
						(bday + make_interval(years := $2 - extract(year from bday)::integer)) as bday
					from birthdays
				) t where
				bday < CURRENT_DATE and
				bday >= (CURRENT_DATE - $3 * interval '1 day')
				and server_id = $1
				order by bday asc;
			`, [server, new Date().getFullYear(), days])
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}

		if(!data.rows?.[0]) return undefined;
		else return data.rows.map(b => new Birthday(this, KEYS, b));
	}

	async update(id, data = {}) {
		try {
			await this.db.query(`UPDATE birthdays SET ${Object.keys(data).map((k, i) => k+"=$"+(i+2)).join(",")} WHERE id = $1`,[id, ...Object.values(data)]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}

		return await this.getID(id);
	}

	async delete(id) {
		try {
			await this.db.query(`DELETE FROM birthdays WHERE id = $1`, [id]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}
		
		return;
	}

	async deleteAllByUser(server, user) {
		try {
			await this.db.query(`DELETE FROM birthdays WHERE server_id = $1 AND user_id = $2`, [server, user]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}
		
		return;
	}

	async export(server, user) {
		var bdays = await this.getByUser(server, user);
		if(!bdays?.length) return Promise.reject("No birthdays to export!");
		return {
			birthdays: bdays.map(x => ({
				name: x.name,
				bday: x.bday
			}))
		}
	}

	async import(data, server, user) {
		var created = 0,
			updated = 0,
			toImport = [],
			list = [];
		switch(this.typeCheck(data)) {
			case 'tb':
				list = data.tuppers.filter(x => x.birthday);
				if(!list?.length) break;

				toImport = list.map(x => {
					return {
						name: x.name,
						bday: x.birthday
					}
				})
				break;
			case 'pk':
				list = data.members.filter(x => x.birthday)
				if(!list?.length) break;

				toImport = list.map(x => {
					return {
						name: x.name,
						bday: x.birthday
					}
				})
				break;
			case 'bd':
				list = data.birthdays;
				if(!list?.length) break;
				toImport = list;
				break;
			default:
				return {
					fail: true,
					err: "Please provide an export from me, PluralKit, or Tupperbox!"
				}
		}

		if(!toImport?.length) return {
			fail: true,
			err: "No birthdays to import!"
		}

		var bdays = await this.getByUser(server, user);
		for(var im of toImport) {
			var bd = bdays?.find(x => x.name.toLowerCase() == im.name.toLowerCase());
			if(bd) {
				bd.bday = im.bday;
				await bd.save();
				updated += 1;
			} else {
				await this.create({
					server_id: server,
					user_id: user,
					...im
				});
				created += 1;
			}
		}

		return {
			updated,
			created
		}
	}

	typeCheck(data) {
		if(data.tuppers) return 'tb';
		if(data.birthdays) return 'bd';
		if(data.uuid) return 'pk';
		return 'x';
	}
}

module.exports = (bot, db) => new BirthdayStore(bot, db);
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
		d.setYear(2022);
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

	async get(server, hid) {
		try {
			var data = await this.db.query(`SELECT * FROM birthdays WHERE server_id = $1 AND hid = $2`,[server, hid]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}
		
		if(data.rows?.[0]) {
			return new Birthday(this, KEYS, data.rows[0]);
		} else return new Birthday(this, KEYS, {server_id: server});
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

	async getUpcoming(server) {
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
				bday >= CURRENT_DATE and
				bday <= (CURRENT_DATE + interval '30 days')
				and server_id = $1
				order by bday desc;
			`, [server, new Date().getFullYear()])
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}

		console.log(data.rows[0])

		if(!data.rows?.[0]) return undefined;
		else return data.rows.map(b => new Birthday(this, KEYS, b));
	}

	async getRecent(server) {
		try {
			var data = await this.db.query(`
				select * from (
					select
						*,
						(bday + make_interval(years := $2 - extract(year from bday)::integer)) as bday
					from birthdays
				) t where
				bday < CURRENT_DATE and
				bday >= (CURRENT_DATE + interval '30 days')
				and server_id = $1
				order by bday asc;
			`, [server, new Date().getFullYear()])
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

	async import(data) {
		// TODO: implement importing
		// should probably have different functions for handling tbox vs pk files?
		// may also create our own exports for taking around to different servers. hmm
	}
}

module.exports = (bot, db) => new BirthdayStore(bot, db);
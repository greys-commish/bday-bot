const { Models: { DataStore, DataObject } } = require('frame');

const KEYS = {
	id: { },
	server_id: { },
	channel: { patch: true },
	pings: { patch: true },
	prefix: { patch: true },
	timezone: { patch: true }
}

class Config extends DataObject {	
	constructor(store, keys, data) {
		super(store, keys, data);
	}
}

class ConfigStore extends DataStore {
	constructor(bot, db) {
		super(bot, db)
	}

	async init() {
		await this.db.query(`CREATE TABLE IF NOT EXISTS configs (
			id 					SERIAL PRIMARY KEY,
			server_id 			TEXT,
			channel 			TEXT,
			pings 				TEXT,
			prefix 				TEXT,
			timezone 			TEXT
		)`)
	}

	async create(data = {}) {
		try {
			var c = await this.db.query(`INSERT INTO configs (
				server_id,
				channel,
				pings,
				prefix,
				timezone
			) VALUES ($1,$2,$3,$4,$5)
			RETURNING id`,
			[data.server_id, data.channel,
			 data.pings, data.prefix, data.timezone]);
		} catch(e) {
			console.log(e);
	 		return Promise.reject(e.message);
		}
		
		return await this.getID(c.rows[0].id);
	}

	async index(data = {}) {
		try {
			await this.db.query(`INSERT INTO configs (
				server_id,
				channel,
				pings,
				prefix,
				timezone
			) VALUES ($1,$2,$3,$4,$5)`,
			[data.server_id, data.channel,
			 data.pings, data.prefix, data.timezone]);
		} catch(e) {
			console.log(e);
	 		return Promise.reject(e.message);
		}
		
		return;
	}

	async get(server) {
		try {
			var data = await this.db.query(`SELECT * FROM configs WHERE server_id = $1`,[server]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}
		
		if(data.rows?.[0]) {
			return new Config(this, KEYS, data.rows[0]);
		} else return new Config(this, KEYS, {server_id: server});
	}

	async getID(id) {
		try {
			var data = await this.db.query(`SELECT * FROM configs WHERE id = $1`,[id]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}
		
		if(data.rows?.[0]) {
			return new Config(this, KEYS, data.rows[0]);
		} else return new Config(this, KEYS, {});
	}

	async getAll() {
		try {
			var data = await this.db.query(`SELECT * FROM configs`);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}
		
		if(data.rows?.[0]) {
			return data.rows.map(r => new Config(this, KEYS, r));
		} else return [];
	}

	async update(id, data = {}) {
		try {
			await this.db.query(`UPDATE configs SET ${Object.keys(data).map((k, i) => k+"=$"+(i+2)).join(",")} WHERE id = $1`,[id, ...Object.values(data)]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}

		return await this.getID(id);
	}

	async delete(id) {
		try {
			await this.db.query(`DELETE FROM configs WHERE id = $1`, [id]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}
		
		return;
	}
}

module.exports = (bot, db) => new ConfigStore(bot, db);
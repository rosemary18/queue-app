const Joi = require('joi');
const conf = require('./api.config')
const { FETCH_REQUEST_TYPES, RES_TYPES } = require('../../types')
const db = require('../../services/db')
const abs_path = conf.base_path + '/signin'
const socket = require('../../services/socket')

// Handlers

const handlerSignEventCounter = async (req, res) => {

    const { event_code, event_counter_pass, counter_code, socket_id } = req.payload;
    const data = {
        event: null,
        counter: null
    }

    try {

        const sql_event = `SELECT * FROM tbl_events WHERE event_code = ?`;
        const event = await new Promise((resolve, reject) => {
            db.get(sql_event, [event_code], function (err, row) {
                if (err) {
                    console.log(err);
                    return reject(new Error('Database query error'));
                }
                resolve(row);
            });
        })

        if (!event) return res.response(RES_TYPES[400]("Invalid event code"));
        if (event?.event_counter_pass != event_counter_pass) return res.response(RES_TYPES[400]("Invalid event counter pass"));

        data.event = event

        const sql_exist_counter = `SELECT * FROM tbl_counters WHERE event_id = ? AND counter_code = ?`;
        const exist_counter = await new Promise((resolve, reject) => {
            db.get(sql_exist_counter, [event.id, counter_code], function (err, row) {
                if (err) {
                    console.log(err);
                    return reject(new Error('Database query error'));
                }
                resolve(row);
            });
        })

        if (exist_counter) {
            if (exist_counter.status == 1) return res.response(RES_TYPES[400]("Counter already signed in"));
            const sql_update_counter = `UPDATE tbl_counters SET status = 1, ip = ?, socket_id = ? WHERE id = ?`;
            const update_counter = await new Promise((resolve, reject) => {
                db.run(sql_update_counter, [req.info.remoteAddress , socket_id, exist_counter.id], function (err) {
                    if (err) {
                        console.log(err);
                        return reject(new Error('Database update error'));
                    }
                    resolve(true);
                });
            })
            if (!update_counter) return res.response(RES_TYPES[500]());
            const sql_counter = `SELECT * FROM tbl_counters WHERE event_id = ? AND counter_code = ?`;
            const counter = await new Promise((resolve, reject) => {
                db.get(sql_counter, [event.id, counter_code], function (err, row) {
                    if (err) {
                        console.log(err);
                        return reject(new Error('Database query error'));
                    }
                    resolve(row);
                });
            })
            data.counter = counter
            socket.emit('counter-signed');
            return res.response(RES_TYPES[200](data, "Counter signed in successfully"));
        } else {
            const sql_counter = `INSERT INTO tbl_counters (event_id, ip, counter_code, socket_id) VALUES (?, ?, ?, ?)`;
            const counter = await new Promise((resolve, reject) => {
                db.run(sql_counter, [event.id, req.info.remoteAddress, counter_code, socket_id], function (err) {
                    if (err) {
                        console.log(err);
                        return reject(new Error('Database insertion error'));
                    }
                    resolve(true);
                });
            })
            if (!counter) return res.response(RES_TYPES[500]());
            const sql_new_counter = `SELECT * FROM tbl_counters WHERE event_id = ? AND counter_code = ?`;
            const new_counter = await new Promise((resolve, reject) => {
                db.get(sql_new_counter, [event.id, counter_code], function (err, row) {
                    if (err) {
                        console.log(err);
                        return reject(new Error('Database query error'));
                    }
                    resolve(row);
                });
            })
            data.counter = new_counter
            socket.emit('counter-signed');
            return res.response(RES_TYPES[200](data, "Counter signed in successfully"));
        }
    } catch (err) {
        console.log(err);
        return res.response(RES_TYPES[500](err.message));
    }
} 

const handlerSignEventBooth = async (req, res) => {

    const { event_code, event_booth_pass, booth_code, socket_id } = req.payload;
    const data = {
        event: null,
        booth: null,
        queue: null
    }

    try {

        const sql_event = `SELECT * FROM tbl_events WHERE event_code = ?`;
        const event = await new Promise((resolve, reject) => {
            db.get(sql_event, [event_code], function (err, row) {
                if (err) {
                    console.log(err);
                    return reject(new Error('Database query error'));
                }
                resolve(row);
            });
        })

        if (!event) return res.response(RES_TYPES[400]("Invalid event code or event booth pass"));
        if (event?.event_booth_pass != event_booth_pass) return res.response(RES_TYPES[400]("Invalid event booth pass"));

        data.event = event

        const sql_exist_booth = `SELECT * FROM tbl_booths WHERE event_id = ? AND booth_code = ?`;
        const exist_booth = await new Promise((resolve, reject) => {
            db.get(sql_exist_booth, [event.id, booth_code], function (err, row) {
                if (err) {
                    console.log(err);
                    return reject(new Error('Database query error'));
                }
                resolve(row);
            });
        })

        
        if (exist_booth) {
            const sql_exist_queue = `SELECT * FROM tbl_participants WHERE serve_by_booth = ? AND status = 0 ORDER BY id ASC LIMIT 1`;
            const exist_queue = await new Promise((resolve, reject) => {
                db.get(sql_exist_queue, [exist_booth.id], function (err, row) {
                    if (err) {
                        console.log(err);
                        return reject(new Error('Database query error'));
                    }
                    resolve(row);
                });
            })

            if (exist_queue) data.queue = exist_queue

            if (exist_booth.status == 1) return res.response(RES_TYPES[400]("Booth already signed in"));
            const sql_update_booth = `UPDATE tbl_booths SET status = 1, ip = ?, socket_id = ? WHERE id = ?`;
            const update_booth = await new Promise((resolve, reject) => {
                db.run(sql_update_booth, [req.info.remoteAddress, socket_id, exist_booth.id], function (err) {
                    if (err) {
                        console.log(err);
                        return reject(new Error('Database update error'));
                    }
                    resolve(true);
                });
            })
            if (!update_booth) return res.response(RES_TYPES[500]());
            const sql_booth = `SELECT * FROM tbl_booths WHERE event_id = ? AND booth_code = ?`;
            const booth = await new Promise((resolve, reject) => {
                db.get(sql_booth, [event.id, booth_code], function (err, row) {
                    if (err) {
                        console.log(err);
                        return reject(new Error('Database query error'));
                    }
                    resolve(row);
                });
            })
            data.booth = booth
            socket.emit('booth-signed');
            return res.response(RES_TYPES[200](data, "Booth signed in successfully"));
        } else {
            const sql_booth = `INSERT INTO tbl_booths (event_id, ip, booth_code, socket_id) VALUES (?, ?, ?, ?)`;
            const booth = await new Promise((resolve, reject) => {
                db.run(sql_booth, [event.id, req.info.remoteAddress, booth_code, socket_id], function (err) {
                    if (err) {
                        console.log(err);
                        return reject(new Error('Database insertion error'));
                    }
                    resolve(true);
                });
            })
            if (!booth) return res.response(RES_TYPES[500]());
            const sql_new_booth = `SELECT * FROM tbl_booths WHERE event_id = ? AND booth_code = ?`;
            const new_booth = await new Promise((resolve, reject) => {
                db.get(sql_new_booth, [event.id, booth_code], function (err, row) {
                    if (err) {
                        console.log(err);
                        return reject(new Error('Database query error'));
                    }
                    resolve(row);
                });
            })
            data.booth = new_booth
            socket.emit('booth-signed');
            return res.response(RES_TYPES[200](data, "Booth signed in successfully"));
        }
    } catch (err) {
        console.log(err);
        return res.response(RES_TYPES[500](err.message));
    }
    
} 

// Routing

const routes = [
    {
        method: FETCH_REQUEST_TYPES.POST,
        path: abs_path + '/counter',
        options: {
            validate: {
                payload: Joi.object({
                    event_code: Joi.string().required(),
                    event_counter_pass: Joi.string().required(),
                    counter_code: Joi.string().required(),
                    socket_id: Joi.string().required(),
                })
            },
        },
        handler: handlerSignEventCounter
    },
    {
        method: FETCH_REQUEST_TYPES.POST,
        path: abs_path + '/booth',
        options: {
            validate: {
                payload: Joi.object({
                    event_code: Joi.string().required(),
                    event_booth_pass: Joi.string().required(),
                    booth_code: Joi.string().required(),
                    socket_id: Joi.string().required(),
                })
            },
        },
        handler: handlerSignEventBooth
    }
]

module.exports = routes
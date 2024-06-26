const Joi = require('joi');
const conf = require('./api.config')
const { FETCH_REQUEST_TYPES, RES_TYPES } = require('../../types');
const db = require('../../services/db')
const socket = require('../../services/socket')
const abs_path = conf.base_path + '/queue'

// Handlers

const handlerGetQueues = async (req, res) => {

    const eventId = req.params.eventId;
    const sql_participants = `SELECT * FROM tbl_participants WHERE event_id = ? AND status = 0 ORDER BY id ASC`;
    const participants = await new Promise((resolve, reject) => {
        db.all(sql_participants, [eventId], function (err, rows) {
            if (err) {
                console.log(err);
                return reject(new Error('Database query error'));
            }
            console.log(rows)
            resolve(rows);
        });
    })

    return res.response(RES_TYPES[200](participants));
}

const handlerNextQueue = async (req, res) => {

    const { booth_id } = req.payload

    // Get booth
    const sql_booth = `SELECT * FROM tbl_booths WHERE id = ?`;
    const booth = await new Promise((resolve, reject) => {
        db.get(sql_booth, [booth_id], function (err, row) {
            if (err) {
                console.log(err);
                return reject(new Error('Database query error'));
            }
            resolve(row);
        });
    })
    
    if (!booth) return res.response(RES_TYPES[404]("Booth not found"));

    // Get participant that served by this booth but status is 0
    const sql_participant = `SELECT * FROM tbl_participants WHERE serve_by_booth = ? AND status = 0 ORDER BY id ASC LIMIT 1`;
    const participant = await new Promise((resolve, reject) => {
        db.get(sql_participant, [booth_id], function (err, row) {
            if (err) {
                console.log(err);
                return reject(new Error('Database query error'));
            }
            resolve(row);
        });
    })

    if (participant) {
        // Update status participant to 1
        const sql_update_participant = `UPDATE tbl_participants SET status = ? WHERE id = ?`;
        new Promise((resolve, reject) => {
            db.run(sql_update_participant, [1, participant.id], function (err) {
                if (err) {
                    console.log(err);
                    return reject(new Error('Database query error'));
                }
                resolve(true);
            });
        })
    }

    // Get all participants
    const sql_participants = `SELECT * FROM tbl_participants WHERE event_id = ? AND status = 0 ORDER BY id ASC`;
    const participants = await new Promise((resolve, reject) => {
        db.all(sql_participants, [booth.event_id], function (err, rows) {
            if (err) {
                console.log(err);
                return reject(new Error('Database query error'));
            }
            resolve(rows);
        });
    })

    if (!(participants?.length > 0)) {
        socket.emit('queue-updated');
        return res.response(RES_TYPES[200]("Queues completed successfully"));
    }

    // Update serve_by_booth first items of participant to this booth
    const sql_update_next_participant = `UPDATE tbl_participants SET serve_by_booth = ? WHERE id = ?`;
    const nextUpdated = new Promise((resolve, reject) => {
        db.run(sql_update_next_participant, [booth_id, participants[0].id], function (err) {
            if (err) {
                console.log(err);
                return reject(new Error('Database query error'));
            }
            resolve(true);
        });
    })

    if (!nextUpdated) return res.response(RES_TYPES[400]("Failed to update next participant"));

    socket.emit('queue-updated');
    return res.response(RES_TYPES[200]("Next queue assigned successfully"));

}


// Routing

const routes = [
    {
        method: FETCH_REQUEST_TYPES.GET,
        path: abs_path+"/{eventId}",
        handler: handlerGetQueues
    },
    {
        method: FETCH_REQUEST_TYPES.POST,
        path: abs_path + "/next",
        options: {
            validate: {
                payload: Joi.object({
                    booth_id: Joi.number().required(),
                })
            },
        },
        handler: handlerNextQueue
    }
]

module.exports = routes
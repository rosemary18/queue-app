const Joi = require('joi');
const conf = require('./api.config')
const { FETCH_REQUEST_TYPES, RES_TYPES } = require('../../types')
const { generateRandomString, createPDF } = require('../../utils')
const db = require('../../services/db')
const abs_path = conf.base_path + '/event'
const socket = require('../../services/socket')

const sql_select_events = `
    SELECT
        e.id,
        e.event_code,
        e.event_counter_pass,
        e.event_booth_pass,
        e.event_name,
        e.created_at,
        e.updated_at,
        (
            SELECT COALESCE(
                json_group_array(
                    json_object(
                        'id', c.id,
                        'ip', c.ip,
                        'counter_code', c.counter_code,
                        'status', c.status,
                        'socket_id', c.socket_id
                    )
                ),
                '[]'
            ) FROM tbl_counters c WHERE c.event_id = e.id
        ) AS counters,
        (
            SELECT COALESCE(
                json_group_array(
                    json_object(
                        'id', b.id,
                        'ip', b.ip,
                        'booth_code', b.booth_code,
                        'status', b.status,
                        'socket_id', b.socket_id
                    )
                ),
                '[]'
            ) FROM tbl_booths b WHERE b.event_id = e.id ORDER BY b.booth_code ASC
        ) AS booths,
        (
            SELECT COALESCE(
                json_group_array(
                    json_object(
                        'id', p.id,
                        'queue_code', p.queue_code,
                        'name', p.name,
                        'phone_number', p.phone_number,
                        'ticket_link', p.ticket_link,
                        'wa_sent_status', p.wa_sent_status,
                        'input_by_counter', p.input_by_counter,
                        'serve_by_booth', p.serve_by_booth,
                        'status', p.status)
                    ),
                    '[]'
                )
            FROM tbl_participants p WHERE p.event_id = e.id
        ) AS participants
    FROM tbl_events e
`

// Handlers

const handlerCreateEvent = async (req, res) => {

    const { event_name } = req.payload;

    try {

        // Masukkan event baru ke database
        const eventId = await new Promise((resolve, reject) => {
            const sql = `INSERT INTO tbl_events (event_name, event_code, event_counter_pass, event_booth_pass) VALUES (?, ?, ?, ?)`;
            db.run(sql, [event_name, generateRandomString(12), generateRandomString(12), generateRandomString(12)], function (err) {
                if (err) {
                    console.log(err);
                    return reject(new Error('Database insertion error'));
                }
                resolve(this.lastID);
            });
        });

        // Ambil data event yang baru dimasukkan
        const newEvent = await new Promise((resolve, reject) => {
            const sql = `
                ${sql_select_events}
                WHERE e.id = ?
            `;
            db.get(sql, [eventId], (err, row) => {
                if (err) {
                    console.log(err);
                    return reject(new Error('Database query error'));
                }
                resolve(row);
            });
        });

        newEvent.counters = JSON.parse(newEvent.counters) ?? [];
        newEvent.booths = JSON.parse(newEvent.booths) ?? [];
        newEvent.participants = JSON.parse(newEvent.participants) ?? [];

        // Kembalikan respons dengan data event yang baru dimasukkan
        socket.emit('event-add')
        return res.response(RES_TYPES[200](newEvent, 'Event created successfully'));
    } catch (err) {
        console.log(err);
        return res.response(RES_TYPES[500](err.message));
    }
};

const handlerGetEvent = async (req, res) => {

    const eventId = req.params.eventId;

    try {

        // Ambil data event yang baru dimasukkan
        const newEvent = await new Promise((resolve, reject) => {
            const sql = `
                ${sql_select_events}
                WHERE e.id = ?
            `;
            db.get(sql, [eventId], (err, row) => {
                if (err) {
                    console.log(err);
                    return reject(new Error('Database query error'));
                }
                resolve(row);
            });
        });

        newEvent.counters = JSON.parse(newEvent?.counters) ?? [];
        newEvent.booths = JSON.parse(newEvent?.booths) ?? [];
        newEvent.participants = JSON.parse(newEvent?.participants) ?? [];

        // Kembalikan respons dengan data event yang baru dimasukkan
        return res.response(RES_TYPES[200](newEvent, 'Get event successfully'));
    } catch (err) {
        console.log(err);
        return res.response(RES_TYPES[500](err.message));
    }
};

const handlerGetEventByCode = async (req, res) => {

    const code = req.params.code;

    try {

        // Ambil data event yang baru dimasukkan
        const event = await new Promise((resolve, reject) => {
            const sql = `
                ${sql_select_events}
                WHERE e.event_code = ?
            `;
            db.get(sql, [code], (err, row) => {
                if (err) {
                    console.log(err);
                    return reject(new Error('Database query error'));
                }
                resolve(row);
            });
        });

        event.counters = JSON.parse(event?.counters) ?? [];
        event.booths = JSON.parse(event?.booths) ?? [];
        event.participants = JSON.parse(event?.participants) ?? [];

        // Kembalikan respons dengan data event yang baru dimasukkan
        return res.response(RES_TYPES[200](event, 'Get event successfully'));
    } catch (err) {
        console.log(err);
        return res.response(RES_TYPES[500](err.message));
    }
};

const handlerGetAllEvents = async (req, res) => {
    
    try {
        const events = await new Promise((resolve, reject) => {
            db.all(sql_select_events, [], (err, rows) => {
                if (err) {
                    console.log(err)
                    return reject(res.response(RES_TYPES[500](err)));
                }
                const result = rows.map(row => ({
                    ...row,
                    counters: JSON.parse(row.counters) ?? [],
                    booths: JSON.parse(row.booths) ?? [],
                    participants: row.participants ? JSON.parse(row.participants) : [],
                }));
                resolve(result || []);
            });
        })

        return res.response(RES_TYPES[200](events));
    } catch (err) {
        console.log(err)
        return res.response(RES_TYPES[500]());
    }

    

} 

const handlerUpdateEvent = async (req, res) => {

    const { event_name } = req.payload;
    const eventId = req.params.eventId;

    try {
        const sql = `UPDATE tbl_events SET event_name = ? WHERE id = ?`;
        const isUpdated = await new Promise((resolve, reject) => {
            db.run(sql, [event_name, eventId], function (err) {
                if (err) {
                    console.log(err);
                    return reject(new Error('Database update error'));
                }
                resolve(true);
            });
        })

        if (!isUpdated) return res.response(RES_TYPES[500]());
        return res.response(RES_TYPES[200](null, "Event updated successfully"));
    } catch (err) {
        console.log(err);
        return res.response(RES_TYPES[500](err.message));
    }
} 

const handlerDeleteEvent = async (req, res) => {

    const eventId = req.params.eventId;

    try {
        const sql = `DELETE FROM tbl_events WHERE id = ?`;
        const isDeleted = await new Promise((resolve, reject) => {
            db.run(sql, [eventId], function (err) {
                if (err) {
                    console.log(err);
                    return reject(new Error('Database deletion error'));
                }
                resolve(true);
            });
        })

        const sql_delete_participants = `DELETE FROM tbl_participants WHERE event_id = ?`;
        await new Promise((resolve, reject) => {
            db.run(sql_delete_participants, [eventId], function (err) {
                if (err) {
                    console.log(err);
                    return reject(new Error('Database deletion error'));
                }
                resolve(true);
            });
        })

        const sql_delete_counters = `DELETE FROM tbl_counters WHERE event_id = ?`;
        await new Promise((resolve, reject) => {
            db.run(sql_delete_counters, [eventId], function (err) {
                if (err) {
                    console.log(err);
                    return reject(new Error('Database deletion error'));
                }
                resolve(true);
            });
        })

        const sql_delete_booths = `DELETE FROM tbl_booths WHERE event_id = ?`;
        await new Promise((resolve, reject) => {
            db.run(sql_delete_booths, [eventId], function (err) {
                if (err) {
                    console.log(err);
                    return reject(new Error('Database deletion error'));
                }
                resolve(true);
            });
        })

        if (!isDeleted) return res.response(RES_TYPES[500]());
        return res.response(RES_TYPES[200](null, "Event deleted successfully"));
    } catch (err) {
        console.log(err);
        return res.response(RES_TYPES[500](err.message));
    }
} 

const handlerExportEvent = async (req, res) => {

    const event_id = req.params.eventId;

    const sql_get_event = `
        ${sql_select_events}
        WHERE e.id = ?
    `;
    const event = await new Promise((resolve, reject) => {
        db.get(sql_get_event, [event_id], (err, row) => {
            if (err) {
                console.log(err);
                return reject(new Error('Database query error'));
            }
            resolve(row);
        });
    })

    if (!event) return res.response(RES_TYPES[404]("Event not found"));
    
    event.participants = JSON.parse(event?.participants) ?? [];

    let pdf = await new Promise((resolve, reject) => {
        createPDF(event?.event_name, event?.participants).then(data => resolve(data)).catch(err => resolve(""));
    })

    return res.response(Buffer.from(pdf))
    .type('application/pdf')
    .header('Content-Disposition', 'attachment;');
}


// Routing

const routes = [
    {
        method: FETCH_REQUEST_TYPES.GET,
        path: abs_path,
        handler: handlerGetAllEvents
    },
    {
        method: FETCH_REQUEST_TYPES.GET,
        path: abs_path+'/export/{eventId}',
        handler: handlerExportEvent
    },
    {
        method: FETCH_REQUEST_TYPES.GET,
        path: abs_path + '/{eventId}',
        handler: handlerGetEvent
    },
    {
        method: FETCH_REQUEST_TYPES.GET,
        path: abs_path + '/code/{code}',
        handler: handlerGetEventByCode
    },
    {
        method: FETCH_REQUEST_TYPES.POST,
        path: abs_path + '/create',
        options: {
            validate: {
                payload: Joi.object({
                    event_name: Joi.string().required(),
                })
            },
        },
        handler: handlerCreateEvent
    },
    {
        method: FETCH_REQUEST_TYPES.PUT,
        path: abs_path + '/update/{eventId}',
        options: {
            validate: {
                payload: Joi.object({
                    event_name: Joi.string().required(),
                })
            },
        },
        handler: handlerUpdateEvent
    },
    {
        method: FETCH_REQUEST_TYPES.DELETE,
        path: abs_path + '/delete/{eventId}',
        handler: handlerDeleteEvent
    }
]

module.exports = routes
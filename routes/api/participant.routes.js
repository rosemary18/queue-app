const Joi = require('joi');
const fs = require('fs');
const Path = require('path');
const conf = require('./api.config')
const FormData = require('form-data');
const { FETCH_REQUEST_TYPES, RES_TYPES } = require('../../types');
const { sendWa, generateQueueImage } = require('../../utils');
const db = require('../../services/db')
const abs_path = conf.base_path + '/participant'
const socket = require('../../services/socket')

// Handlers

const handlerGetAllParticipants = async (req, res) => {
    
    const sql_participants = `SELECT * FROM tbl_participants`;
    const participants = await new Promise((resolve, reject) => {
        db.all(sql_participants, function (err, rows) {
            if (err) {
                console.log(err);
                return reject(new Error('Database query error'));
            }
            resolve(rows);
        });
    })

    return res.response(RES_TYPES[200](participants));
}

const handlerGetParticipant = async (req, res) => {

    const participantId = req.params.id;
    const sql_participant = `SELECT * FROM tbl_participants WHERE id = ?`;
    const participant = await new Promise((resolve, reject) => {
        db.get(sql_participant, [participantId], function (err, row) {
            if (err) {
                console.log(err);
                return reject(new Error('Database query error'));
            }
            resolve(row);
        });
    })

    if (!participant) return res.response(RES_TYPES[404]("Participant not found"));

    return res.response(RES_TYPES[200](participant));
}

const handlerGetParticipantByEventId = async (req, res) => {

    const eventId = req.params.id;
    const sql_participants = `SELECT * FROM tbl_participants WHERE event_id = ?`;
    const participants = await new Promise((resolve, reject) => {
        db.all(sql_participants, [eventId], function (err, rows) {
            if (err) {
                console.log(err);
                return reject(new Error('Database query error'));
            }
            resolve(rows);
        });
    })

    return res.response(RES_TYPES[200](participants));
}

const handlerGetParticipantByCounterId= async (req, res) => {

    const counterId = req.params.id;
    const sql_participants = `SELECT * FROM tbl_participants WHERE id = ?`;
    const participants = await new Promise((resolve, reject) => {
        db.all(sql_participants, [counterId], function (err, rows) {
            if (err) {
                console.log(err);
                return reject(new Error('Database query error'));
            }
            resolve(rows);
        });
    })

    return res.response(RES_TYPES[200](participants));
}

const handlerAddParticipant = async (req, res) => {

    const { counter_id, queue_code, name, phone_number } = req.payload;

    const sql_counter = `SELECT * FROM tbl_counters WHERE id = ?`;
    const counter = await new Promise((resolve, reject) => {
        db.get(sql_counter, [counter_id], function (err, row) {
            if (err) {
                console.log(err);
                return reject(new Error('Database query error'));
            }
            resolve(row);
        });
    })

    if (!counter) return res.response(RES_TYPES[404]("Counter not found"));

    const sql_event = `SELECT * FROM tbl_events WHERE id = ?`;
    const event = await new Promise((resolve, reject) => {
        db.get(sql_event, [counter.event_id], function (err, row) {
            if (err) {
                console.log(err);
                return reject(new Error('Database query error'));
            }
            resolve(row);
        });
    })

    if (!event) return res.response(RES_TYPES[404]("Event not found"));

    const sql_check_queue = `SELECT * FROM tbl_participants WHERE event_id = ? AND queue_code = ?`;
    const check_queue = await new Promise((resolve, reject) => {
        db.get(sql_check_queue, [event.id, queue_code], function (err, row) {
            if (err) {
                console.log(err);
                return reject(new Error('Database query error'));
            }
            resolve(row);
        });
    })

    if (check_queue) return res.response(RES_TYPES[400]("Queue already exist"));

    const sql_participant = `INSERT INTO tbl_participants (event_id, queue_code, name, phone_number, ticket_link, input_by_counter) VALUES (?, ?, ?, ?, ?, ?)`;
    const newParticipantID = await new Promise((resolve, reject) => {
        db.run(sql_participant, [event.id, queue_code, name, phone_number, '', counter_id], function (err) {
            if (err) {
                console.log(err);
                return reject(new Error('Database query error'));
            }
            resolve(this.lastID);
        });
    })

    if (!newParticipantID) return res.response(RES_TYPES[500]());
    else {
        const id_queue = await generateQueueImage(queue_code);
        if (id_queue != null) {
            const sql_update_participant = `UPDATE tbl_participants SET ticket_link = ? WHERE id = ?`;
            const protocol = req.server.info.protocol;
            const host = req.info.host;
            const baseUrl = `${protocol}://${host}`
            const link_image = `${baseUrl}/tickets/${id_queue}.png`;
            await new Promise((resolve, reject) => {
                db.run(sql_update_participant, [link_image, newParticipantID], function (err) {
                    if (err) {
                        console.log(err);
                        return reject(new Error('Database query error'));
                    }
                    resolve(true);
                });
            })
            sendWa(link_image, queue_code, phone_number).then(async res => {
                if (res?.data?.status) {
                    const sql_update_wa_status = `UPDATE tbl_participants SET wa_sent_status = ? WHERE id = ?`;
                    await new Promise((resolve, reject) => {
                        db.run(sql_update_wa_status, [1, newParticipantID], function (err) {
                            if (err) {
                                console.log(err);
                                return reject(new Error('Database query error'));
                            }
                            resolve(true);
                        });
                    })
                }
            }).catch(err => console.log(err));
        } 
    }

    socket.emit('queue-updated');
    return res.response(RES_TYPES[200](null, "Participant added successfully"));

} 

const handlerUpdateParticipant = async (req, res) => {

    const id = req.params.id;
    const { name, phone_number } = req.payload;
    const sql_participant = `UPDATE tbl_participants SET name = ?, phone_number = ? WHERE id = ?`;
    await new Promise((resolve, reject) => {
        db.run(sql_participant, [name, phone_number, id], function (err) {
            if (err) {
                console.log(err);
                return reject(new Error('Database query error'));
            }
            resolve(true);
        });
    })

    return res.response(RES_TYPES[200](null, "Participant updated successfully"));
}

const handlerDeleteParticipant = async (req, res) => {

    const id = req.params.id;

    const sql_participant = `SELECT * FROM tbl_participants WHERE id = ?`;
    const participant = await new Promise((resolve, reject) => {
        db.get(sql_participant, [id], function (err, row) {
            if (err) {
                console.log(err);
                return reject(new Error('Database query error'));
            }
            resolve(row);
        });
    })

    if (!participant) return res.response(RES_TYPES[404]("Participant not found"));

    // Delete generate ticket image
    
    if (participant.ticket_link) {
        const fileName = participant.ticket_link.split('/tickets/')[1];
        const file_path = Path.join(__dirname, `../../public/tickets/${fileName}`);
        fs.unlink(file_path, (err) => {
            if (err) console.error(`Error deleting file: ${err}`);
            else console.log('File deleted successfully');
        });
    }

    const sql_participant_delete = `DELETE FROM tbl_participants WHERE id = ?`;
    await new Promise((resolve, reject) => {
        db.run(sql_participant_delete, [id], function (err) {
            if (err) {
                console.log(err);
                return reject(new Error('Database query error'));
            }
            resolve(true);
        });
    })

    return res.response(RES_TYPES[200](null, "Participant deleted successfully"));
}

const handlerResendWA = async (req, res) => {

    const id = req.params.id;

    const sql_participant = `SELECT * FROM tbl_participants WHERE id = ?`;

    const participant = await new Promise((resolve, reject) => {
        db.get(sql_participant, [id], function (err, row) {
            if (err) {
                console.log(err);
                return reject(new Error('Database query error'));
            }
            resolve(row);
        });
    })

    if (!participant) return res.response(RES_TYPES[404]("Participant not found"));

    sendWa(participant.ticket_link, participant.queue_code, participant.phone_number).then(res => {
        if (res?.data?.status) {
            const sql_update_wa_status = `UPDATE tbl_participants SET wa_sent_status = ? WHERE id = ?`;
            new Promise((resolve, reject) => {
                db.run(sql_update_wa_status, [1, id], function (err) {
                    if (err) {
                        console.log(err);
                        return reject(new Error('Database query error'));
                    }
                    resolve(true);
                });
            })
        } else return res.response(RES_TYPES[400](null, "WA failed to send"));
    }).catch(err => console.log(err));

    return res.response(RES_TYPES[200](null, "WA sent successfully"));
}

// Routing

const routes = [
    {
        method: FETCH_REQUEST_TYPES.GET,
        path: abs_path,
        handler: handlerGetAllParticipants
    },
    {
        method: FETCH_REQUEST_TYPES.GET,
        path: abs_path+'/{id}',
        handler: handlerGetParticipant
    },
    {
        method: FETCH_REQUEST_TYPES.GET,
        path: abs_path+'/event/{id}',
        handler: handlerGetParticipantByEventId
    },
    {
        method: FETCH_REQUEST_TYPES.GET,
        path: abs_path+'/counter/{id}',
        handler: handlerGetParticipantByCounterId
    },
    {
        method: FETCH_REQUEST_TYPES.POST,
        path: abs_path + '/add',
        options: {
            validate: {
                payload: Joi.object({
                    counter_id: Joi.string().required(),
                    queue_code: Joi.string().required(),
                    name: Joi.string().required(),
                    phone_number: Joi.string().required(),
                })
            },
        },
        handler: handlerAddParticipant
    },
    {
        method: FETCH_REQUEST_TYPES.POST,
        path: abs_path + '/resend-wa/{id}',
        handler: handlerResendWA
    },
    {
        method: FETCH_REQUEST_TYPES.PUT,
        path: abs_path + '/update/{id}',
        handler: handlerUpdateParticipant
    },
    {
        method: FETCH_REQUEST_TYPES.DELETE,
        path: abs_path + '/delete/{id}',
        handler: handlerDeleteParticipant
    }
]

module.exports = routes

const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./exampleee.db', (err) => {
    if (err) console.log(`[DATABASE]: Connection failed. \n ${err.message}`);
    else console.log('[DATABASE]: Connected to the SQLite database.');
});

// Create tables
db.run(`CREATE TABLE IF NOT EXISTS tbl_events (
    id INTEGER PRIMARY KEY,
    event_code TEXT,
    event_counter_pass TEXT,
    event_booth_pass TEXT,
    event_name TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
)`, (err) => {
    if (err) return console.error(err.message);
    console.log('[DATABASE]: tbl_events created.');
    db.run(`CREATE TABLE IF NOT EXISTS tbl_participants (
        id INTEGER PRIMARY KEY,
        event_id INTEGER,
        queue_code TEXT,
        name TEXT,
        phone_number TEXT,
        ticket_link TEXT,
        wa_sent_status INTEGER,
        input_by_counter TEXT,
        serve_by_booth TEXT,
        status INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES tbl_events(id)
    )`, (err) => {
        if (err) return console.error(err.message);
        console.log('[DATABASE]: tbl_participants created.');
    });
    db.run(`CREATE TABLE IF NOT EXISTS tbl_counters (
        id INTEGER PRIMARY KEY,
        event_id INTEGER,
        ip TEXT,
        counter_code TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES tbl_events(id)
    )`, (err) => {
        if (err) return console.error(err.message);
        console.log('[DATABASE]: tbl_counters created.');
    });
    db.run(`CREATE TABLE IF NOT EXISTS tbl_booths (
        id INTEGER PRIMARY KEY,
        event_id INTEGER,
        ip TEXT,
        booth_code TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES tbl_events(id)
    )`, (err) => {
        if (err) return console.error(err.message);
        console.log('[DATABASE]: tbl_booths created.');
    });
});

process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('[DATABASE]: Connection closed.');
        process.exit(0);
    });
});

module.exports = db
const { Client } = require('pg')

const db = new Client ({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "123456",
    database: "gdgoc_todos",
})

module.exports = db
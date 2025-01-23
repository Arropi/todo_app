const { Client } = require('pg')

const db = new Client ({
    host: 'localhost',
    user: 'postgres',
    database: 'gdgoc_todos',
    port: 5432,
    password: '123456'
})

module.exports = db
const { Client } = require('pg')

const db = new Client ({
    connectionString: process.env.DATABASE_URL
})

module.exports = db
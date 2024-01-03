const Pool = require("pg").Pool

const pool = new Pool({
    user: "postgres",
    password: "sun41pu",
    host: "localhost",
    port: 5432,
    database: "klass"
})

module.exports = pool;
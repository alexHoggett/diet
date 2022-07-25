module.exports = function() {
  const mysql = require('mysql2')

  const db = mysql.createConnection({
    host: 'eu-cdbr-west-03.cleardb.net', 
    user: 'b1d82287da1b15',
    password: '3a22a215',
    database: 'heroku_29350bebafd1cb9'
  })

  db.connect((err) => {
    if (err) {
      console.log(`connection request failed ${err.stack}`)
    } else {
      console.log(`Connected to the database, ${db.threadId}`);
    }
    
  })
  // global.db = db
  return db
}
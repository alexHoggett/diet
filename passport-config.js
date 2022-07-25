const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
let connectionRequest = require('./connectionRequest')

function initialise(passport) {
  const authenticateUser = async (email, password, done) => {
    let connection = connectionRequest()
    let sqlQuery = `SELECT * FROM users WHERE email = ?`
    const users = await connection.promise().query(sqlQuery, [email]);
    const [user] = users[0];
    if (user == null) {
      return done(null, false, { message: 'No user with that email' })
    }
    connection.destroy()
    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user)
      } else {
        return done(null, false, { message: 'Password incorrect' })
      }
    } catch (e) {
      return done(e)
    }
  }

  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))
  passport.serializeUser((user, done) => done(null, user.user_id))
  passport.deserializeUser(async (id, done) => {
    let connection = connectionRequest()
    let sqlQuery = `SELECT * FROM users WHERE user_id = ?`
    const results = await connection.promise().query(sqlQuery, [id]);
    const [result] = results[0];
    connection.destroy()
    return done(null, result);
  })
}

module.exports = initialise
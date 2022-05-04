const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialise(passport) {
  const authenticateUser = async (email, password, done) => {
    let sqlQuery = `SELECT * FROM users WHERE email = ?`
    const users = await db.promise().query(sqlQuery, [email]);
    const [user] = users[0];
    if (user == null) {
      return done(null, false, { message: 'No user with that email' })
    }

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
    let sqlQuery = `SELECT * FROM users WHERE user_id = ?`
    const results = await db.promise().query(sqlQuery, [id]);
    const [result] = results[0];
    return done(null, result);
  })
}

module.exports = initialise
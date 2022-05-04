if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
  // loads all of our different env variables and loads them into process.env
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const mysql = require('mysql2')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'tenderStem34',
  database: 'dietapp'
})

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Connected to the database');
})
global.db = db;


// const getEmail = async function(email, callback) {
//   let sqlQuery = `SELECT * FROM users WHERE email = ?`
//   const results = await db.promise().query(sqlQuery, [email]);
//   return results;
// }

const initialisePassport = require('./passport-config')
initialisePassport(passport)

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false })) // allows us to use req.body etc
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
app.use(express.static('public'))

app.get('/', (req, res) => {
  // add checkAuthenticated when finished building
  // res.render('index.ejs', { name: req.user.firstname })
  res.render('index.ejs', { name: 'alex' })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs', { 'name': 'alex' })
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    let sqlQuery = `INSERT INTO users (firstname, lastname, email, password)
                    VALUES (?, ?, ?, ?)`
    let newUser = [req.body.firstname, req.body.lastname, req.body.email, hashedPassword]
    db.query(sqlQuery, newUser, (err, result) => {
      if (err){
        res.redirect('/register')
      } else{
        res.redirect('/login')
      }
    })
})

app.delete('/logout', (req, res) => {
  req.logout()
  res.redirect('login')
})

function checkAuthenticated(req, res, next){
  if (req.isAuthenticated()){
    return next()
  }
  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

app.listen(3000)
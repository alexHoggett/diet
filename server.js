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
const axios = require('axios')

const db = mysql.createConnection({
  host: 'eu-cdbr-west-03.cleardb.net', 
  user: 'b1d82287da1b15',
  password: '3a22a215',
  database: 'heroku_29350bebafd1cb9'
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
const res = require('express/lib/response')
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

app.get('/', checkAuthenticated, (req, res) => {
  // add checkAuthenticated when finished building
  // res.render('index.ejs', { name: req.user.firstname })

  // Get today's date
  const date = new Date();

  let calories = 0
  let protein = 0

  proteinOnDay(1, date)
    .then(function(result){
      protein = result;
      return caloriesOnDay(1, date)
    .then(function(result){
      calories = result;

      if (protein == null) protein = 0;
      if (calories == null) calories = 0;
      
      const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
      
      res.render('index.ejs', {
        name: 'alex',
        day: date.getDate(),
        month: monthNames[date.getMonth()],
        year: date.getFullYear(),
        daysCalories: calories,
        daysProtein: protein
     })
    }).catch((err) => setImmediate(() => { throw err; }));
  })
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

app.get('/profile', checkAuthenticated, (req, res) => {
  res.render('profile.ejs', req.user);
})

app.post('/update-profile', checkAuthenticated, (req, res) => {
  // console.log('params', req.body.firstname) // new data
  // console.log('body', req.user) // user data

  let sqlQuery = `UPDATE users 
                  SET firstname = ?, lastname = ?, email = ?
                  WHERE user_id = ?;`
  let userData = [req.body.firstname, req.body.lastname, req.body.email, req.user.user_id]
  db.query(sqlQuery, userData, (err, result) => {
    if (err){
      res.redirect('/profile')
    } else{
      res.redirect('/')
    }
  })
})

app.post('/add-food', checkAuthenticated, (req, res) => {
  // First check if food has ever been logged - COME BACK TO THIS

  let sqlQuery = `INSERT INTO logged_foods (user_id, log_date, quantity, metric, protein, calories)
                    VALUES (?, ?, ?, ?, ?, ?)`
  let currentDate = new Date();
  let newLog = [req.user.user_id, currentDate, req.body.amount, req.body.metric, req.body.protein, req.body.cals]
  db.query(sqlQuery, newLog, (err, result) => {
    if (err){
      res.send(err)
    } else {
      res.redirect('/')
    }
  })
})

app.get('/api/searchbar-result/:term', (req, res) => {
  const options = {
    method: 'GET',
    url: `https://trackapi.nutritionix.com/v2/search/instant`,
    params: {
      query: req.params.term,
      branded: true,
      common: true,
      detailed: true
    },
    headers: {
      'x-app-id': 'c4fd75a8',
      'x-app-key': '3ca63844fb74f6991f1b1f50d3038cbc',
      'x-remote-user-id': '0'
    }
  };
  
  axios.request(options).then(function (response) {
    res.send(response.data);
  }).catch(function (error) {
    res.send(error);
  });
})

app.get('/api/food-info/:name', (req, res) => {
  const options = {
    method: 'POST',
    url: `https://trackapi.nutritionix.com/v2/natural/nutrients`,
    data: {
      'query': `${req.params.name} 1 gram`
    },
    headers: {
      'x-app-id': 'c4fd75a8',
      'x-app-key': '3ca63844fb74f6991f1b1f50d3038cbc',
      'x-remote-user-id': '0'
    }
  };

  axios.request(options).then(function (response) {
    res.send(response.data)
  }).catch(function (error) {
    res.send(error)
  })
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

function proteinOnDay(userID, date){
  // function to get total protein intake so far of the day
  // date must be in dateTime format.

  return new Promise(function(resolve, reject){
    const dateCopy = new Date(date.getTime())
    const startDate = dateCopy.toISOString().slice(0, 10)
    dateCopy.setDate(dateCopy.getDate() + 1)
    const endDate = dateCopy.toISOString().slice(0, 10)
  
    let sqlQuery = `SELECT SUM(protein)
                    FROM logged_foods
                    WHERE user_id = ? 
                    AND log_date >= '${startDate} 00:00:00'
                    AND log_date <= '${endDate} 00:00:00'
                    `
    db.query(sqlQuery, userID, (err, result) => {
      if (err){
        return reject(err)
      } else {
        resolve(result[0][Object.keys(result[0])[0]])
      }
    })
  })

  
}

async function caloriesOnDay(userID, date){
  // function to get total calorie intake so far of the day
  // date must be in dateTime format.

  return new Promise(function(resolve, reject){
    const dateCopy = new Date(date.getTime())
    const startDate = dateCopy.toISOString().slice(0, 10)
    dateCopy.setDate(dateCopy.getDate() + 1)
    const endDate = dateCopy.toISOString().slice(0, 10)
  
    let sqlQuery = `SELECT SUM(calories)
                    FROM logged_foods
                    WHERE user_id = ? 
                    AND log_date >= '${startDate} 00:00:00'
                    AND log_date <= '${endDate} 00:00:00'
                    `
    db.query(sqlQuery, userID, (err, result) => {
      if (err){
        return reject(err)
      } else {
        resolve(result[0][Object.keys(result[0])[0]])
      }
    })
  })
}

app.listen(3000)
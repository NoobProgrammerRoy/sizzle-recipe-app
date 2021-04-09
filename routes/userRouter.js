const express = require('express')
const router = express.Router()
const session = require('express-session')
const flash = require('express-flash')
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser')
const User = require('../models/userModel')

// Middleware
router.use(cookieParser('secret'))
router.use(session({
    cookie: { maxAge: 600000 },
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false
}))

router.use(flash())

// Landing and Login Page
router.get('/', (req, res) => {
    if (req.session.user) return res.redirect('/home')
    return res.render('index')
})

router.post('/', async (req, res) => {
    const email = req.body.email
    const password = req.body.password
    try {
        const result = await User.findOne({ email: email })
        if (!result || !await bcrypt.compare(password, result.password)) {
            req.flash('error', 'User does not exist!')
            return res.redirect('/')
        }
        req.session.user = result
        return res.redirect('/home')
    } catch (err) {
        console.log(err)
    }
})

// Sign Up Page
router.get('/signup', (req, res) => {
    if (req.session.user) return res.redirect('/home')
    return res.render('signup')
})

router.post('/signup', async (req, res) => {
    const username = req.body.username
    const email = req.body.email
    const password = req.body.password
    const result = await User.findOne({ email: email })
    if(result) {
        req.flash('error', 'Email ID already exists!')
        return res.redirect('/signup')
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = new User({
        username: username,
        email: email,
        password: hashedPassword
    })
    user.save((err, user) => {
        if (err) return console.log(err)
    })
    req.session.user = user
    return res.redirect('/home')
})

// Profile Page
router.get('/profile', (req, res) => {
    if (!req.session.user) return res.redirect('/')
    const user = req.session.user
    return res.render('profile', { user: user })
})

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return console.log(err)
        return res.redirect('/')
    })
})

module.exports = router
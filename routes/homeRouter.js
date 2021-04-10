const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
const fileUpload = require('express-fileupload')
const User = require('../models/userModel')
const Recipe = require('../models/recipeModel')

// Middleware
router.use(fileUpload())

// Home Page
router.get('/', async (req, res) => {
    const recipes = await Recipe.find()
    const isLoggedIn = req.session.user ? true : false
    return res.render('home', { recipes: recipes, isLoggedIn: isLoggedIn })
})

// Recipe Page
router.get('/recipe/:id', async (req, res) => {
    const recipe = await Recipe.findOne({ url: req.params.id})
    if (!recipe) return res.redirect('/home')
    return res.render('recipe', { recipe: recipe })    
})

// New Recipe Page
router.get('/new', (req, res) => {
    if (!req.session.user) return res.redirect('/home')
    return res.render('newRecipe')
})

router.post('/new', async (req, res) => {
    if (!req.session.user) return res.redirect('/home')
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.send('Could not upload file')
    }

    const title = req.body.title
    const author = req.session.user.username
    const description = req.body.description
    const ingredients = req.body.ingredients
    const steps = req.body.steps
    const url = generateURL()
    
    // File Upload
    const file = req.files.picture
    const picture = path.join(__dirname, '../public/img/') + url
    file.mv(picture, err => {
        if (err) return console.log(err)
    })

    const recipe = new Recipe({
        title: title,
        author: author,
        description: description,
        ingredients: ingredients,
        steps: steps,
        url: url
    })
    recipe.save((err, recipe) => {
        if (err) return console.log(err)
    })

    // Adding same recipe to user 
    const result = await User.updateOne({ email: req.session.user.email }, { $push : { recipes : { 
        title: title,
        author: author,
        description: description,
        ingredients: ingredients,
        steps: steps,
        url: url 
    }}})

    req.session.user = await User.findOne({ email: req.session.user.email })

    return res.redirect('/home')
})

// Edit Recipe Page
router.get('/edit/:id', async (req, res) => {
    if (!req.session.user) return res.redirect('/home')
    const recipe = req.session.user.recipes.filter(recipe => { 
        return recipe.url == req.params.id
    })
    if (recipe.length == 0) return res.redirect('/profile')
    return res.render('editRecipe', { recipe: recipe[0] })
})

router.post('/edit/:id', async (req, res) => {
    if (!req.session.user) return res.redirect('/home')
    
    const title = req.body.title
    const author = req.session.user.username
    const description = req.body.description
    const ingredients = req.body.ingredients
    const steps = req.body.steps
    const url = req.params.id
    
    if (req.files) {
        // File Upload
        const file = req.files.picture
        const picture = path.join(__dirname, '../public/img/') + url
        file.mv(picture, err => {
            if (err) return console.log(err)
        })
    }
    
    const recipe = await Recipe.updateOne({ url: url }, { $set: {
        title: title,
        description: description,
        ingredients: ingredients,
        steps: steps,
    }})

    if (!recipe) return res.redirect('/home')

    // Adding same recipe to user 
    await User.updateOne({ email: req.session.user.email, 'recipes.url': url }, { $set : { 
        'recipes.$.title': title,
        'recipes.$.description': description,
        'recipes.$.ingredients': ingredients,
        'recipes.$.steps': steps,
    }})

    req.session.user = await User.findOne({ email: req.session.user.email })

    return res.redirect('/profile')
})

// Delete Recipe Page
router.post('/delete', async (req, res) => {
    const url = req.body.url
    const recipe = await Recipe.remove({ url: url })
    if (!recipe) return res.redirect('/profile')
    
    // Deleting Recipe from User
    await User.updateOne({ email: req.session.user.email }, { $pull : { recipes :{ 
        url: url
    }}})

    fs.unlink(path.join(__dirname, '../public/img/') + url, err => {
        if (err) return console.log(err)
        console.log('Picture deleted successfully')
    })

    req.session.user = await User.findOne({ email: req.session.user.email })

    return res.redirect('/profile')
})

function generateURL() {
    let url = ""
    let characters = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM0123456789"
    let charactersLength = characters.length
    for (let i = 0; i < 10; i++) {
        url += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return url
}

module.exports = router
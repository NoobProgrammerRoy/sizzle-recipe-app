const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/sizzle-recipe-app', { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection

db.on('error', err => {
    console.log(err)
})

db.once('open', () => {
    console.log('Database opened successfully')
})

// Recipe Schema
const recipeSchema = new mongoose.Schema({
    title : {
        type: String,
        required: true
    },
    author : {
        type: String,
        required: true
    },
    description : {
        type: String,
        required: true
    },
    ingredients : [{
        type: String,
        required: true
    }],
    steps : {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    }
})

// Recipe Model
const recipeModel = mongoose.model('recipe', recipeSchema)
module.exports = recipeModel
const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/sizzle-recipe-app', { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection

db.on('error', err => {
    console.log(err)
})

db.once('open', () => {
    console.log('Database opened successfully')
})

// User Schema
const userSchema = new mongoose.Schema({
    username : {
        type: String,
        required: true
    },
    email : {
        type: String,
        required: true
    },
    password : {
        type: String,
        required: true
    },
    recipes : [{
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
        ingredients : {
            type: String,
            required: true
        },
        steps : {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    }]
})

// User Model
const userModel = mongoose.model('user', userSchema)
module.exports = userModel
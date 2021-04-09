const express = require('express')
const app = express()
const path = require('path')
const bodyParser = require('body-parser')
const userRouter = require('./routes/userRouter')
const homeRouter = require('./routes/homeRouter')

const port = process.env.PORT || 3000

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
app.use('/', userRouter)
app.use('/home', homeRouter)


app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
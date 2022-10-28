require('dotenv').config()

const express = require('express')
const app = express()

const helmet = require('helmet')
const cors = require('cors')

const steamPlayerStatusRouter = require('./routes/steam-player-status.js')

const notFoundMiddleware = require('./middleware/not-found')
const errorHandler = require('./middleware/error-handler')

app.set('trust proxy', 1)

app.use(express.json())
app.use(cors())
app.use(
    helmet.contentSecurityPolicy({
      useDefaults: true,
      directives: {
        "img-src": ["'self'", "https: data:"],
        "style-src": ['*', "'unsafe-inline'"]
      }
    })
)

app.use(steamPlayerStatusRouter)

app.use(notFoundMiddleware)
app.use(errorHandler)

const port = process.env.PORT || 5000

app.listen(port, () =>{
    console.log(`Listening on port ${process.env.PORT}`)
})

module.exports = app
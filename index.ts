import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
const helmet = require('helmet')

const app = express()

dotenv.config()

// router
import steamPlayerStatusRouter from './routes/steam-player-status';

// middlewares
import notFoundMiddleware from './middleware/not-found';
import errorHandler from './middleware/error-handler';

app.set('trust proxy', 1)

app.use(express.json())
app.use(express.static('public'))
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

const port: number | string = process.env.PORT || 5000

app.listen(port, () => console.log(`Listening on port ${port}`))

module.exports = app
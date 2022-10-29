const { StatusCodes } = require('http-status-codes')
const { Resvg } = require('@resvg/resvg-js')

const errorHandler = async (err, req, res, next) => {
    let customError = {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        msg: 'Something went wrong try again later',
    }

    if(err instanceof TypeError){
        customError = {
            statusCode: StatusCodes.NOT_FOUND,
            msg: 'User data not found, set your profile and game details to public',
        }
    } else if(err.response){
        customError = {
            statusCode: err.response.status,
            msg: err.response.statusText,
        }
    } else if (err.request){
        customError = {
            statusCode: StatusCodes.CONTINUE,
            msg: 'Request was sent but received no response',
        }
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="400" height="150"> 
        <g>
            <rect x="0" y="0" width="400" height="150" fill="#1b2838" /> 
            <text x="10" y="20" font-family="Motiva Sans,Arial,Helvetica,sans-serif" font-size="14" fill="white">Error ${customError.statusCode} encountered:</text>
            <text x="10" y="35" font-family="Motiva Sans,Arial,Helvetica,sans-serif" font-size="13" fill="orange">${customError.msg}</text>
            <text x="10" y="50" font-family="Motiva Sans,Arial,Helvetica,sans-serif" font-size="12" fill="yellow">Please verify your steam id</text>
        </g>  
        <style>
            svg {
                position: absolute;
                top: 0;
                left: 0;
            }
        </style>   
    </svg>
    `

    const opts = {
        fitTo: {
          mode: 'width',
          value: 800,
        },
        font: {
            fontFiles: ['./public/fonts/MotivaSansRegular.woff.ttf'], // Load custom fonts.
            loadSystemFonts: false, // It will be faster to disable loading system fonts.
            defaultFontFamily: 'Motiva Sans Regular', // Set default font family.
        },
    }

    const resvg = new Resvg(svg, opts)
    const pngData = resvg.render()
    const pngBuffer = pngData.asPng()

    res.set('Content-Type', 'image/png')
    return res.status(customError.statusCode).send(Buffer.from(pngBuffer))
}

module.exports = errorHandler
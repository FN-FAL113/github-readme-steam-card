import { Request, Response } from "express";

import { StatusCodes } from 'http-status-codes';
import { RequestErrorData } from "../types/error";

/**
 * 
 * @param err error object
 * @param req express request object
 * @param res express response object
 * @param next express middleware function
 */
const errorHandler = async (err: any, req: Request, res: Response): Promise<void> => {
    let customError: RequestErrorData = {
        message: 'Something went wrong, please try again later',
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR
    }

    if(err?.message) {
        customError = {
            message: err.message,
            statusCode: err.statusCode
        }
    } else if(err?.response) { // axios-related error
        customError = {
            message: err.response.statusText,
            statusCode: err.response.status
        }
    } else if (err?.request) {
        customError = {
            message: 'Request was sent but received no response',
            statusCode: StatusCodes.CONTINUE
        }
    }

    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="560" height="200"> 
            <g>
                <rect x="0" y="0" width="500" height="200" fill="#1b2838" /> 
                <text x="10" y="24" font-size="18" fill="white">Error ${customError.statusCode}:</text>
                <text x="10" y="39" font-size="17" fill="red">${customError.message}</text>
                <text x="10" y="55" font-size="16" fill="yellow">Please verify your steam id or report to github issue tracker</text>
            </g>  

            <style type="text/css">
                text { font-family: Arial, Helvetica, Verdana, sans-serif; }
            </style>
        </svg>
    `

    res.set('Content-Type', 'image/svg+xml')
    res.status(customError.statusCode).send(svg)
}

export default errorHandler
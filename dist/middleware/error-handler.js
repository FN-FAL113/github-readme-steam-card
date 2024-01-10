"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = require("http-status-codes");
/**
 *
 * @param err error object
 * @param req express request object
 * @param res express response object
 * @param next express middleware function
 */
const errorHandler = (err, req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let customError = {
        message: 'Something went wrong, please try again later',
        statusCode: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
    };
    if (err === null || err === void 0 ? void 0 : err.message) {
        customError = {
            message: err.message,
            statusCode: err.statusCode
        };
    }
    else if (err === null || err === void 0 ? void 0 : err.response) { // axios-related error
        customError = {
            message: err.response.statusText,
            statusCode: err.response.status
        };
    }
    else if (err === null || err === void 0 ? void 0 : err.request) {
        customError = {
            message: 'Request was sent but received no response',
            statusCode: http_status_codes_1.StatusCodes.CONTINUE
        };
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
    `;
    res.set('Content-Type', 'image/svg+xml');
    res.status(customError.statusCode).send(svg);
});
exports.default = errorHandler;

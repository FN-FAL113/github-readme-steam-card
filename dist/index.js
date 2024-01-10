"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const helmet = require('helmet');
const cors_1 = __importDefault(require("cors"));
// router
const steam_player_status_1 = __importDefault(require("./routes/steam-player-status"));
// middlewares
const not_found_1 = __importDefault(require("./middleware/not-found"));
const error_handler_1 = __importDefault(require("./middleware/error-handler"));
app.set('trust proxy', 1);
app.use(express_1.default.json());
app.use(express_1.default.static('public'));
app.use((0, cors_1.default)());
app.use(helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
        "img-src": ["'self'", "https: data:"],
        "style-src": ['*', "'unsafe-inline'"]
    }
}));
app.use(steam_player_status_1.default);
app.use(not_found_1.default);
app.use(error_handler_1.default);
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on port ${port}`));
module.exports = app;

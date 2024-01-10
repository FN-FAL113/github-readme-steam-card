"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const steam_player_status_1 = require("../controllers/steam-player-status");
// @route   GET /
// @desc    Get steam player status
// @access  Public
router.route('/status/').get(steam_player_status_1.getStatus);
exports.default = router;

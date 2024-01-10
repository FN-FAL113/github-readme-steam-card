import express from 'express';
const router = express.Router();

import { getStatus } from '../controllers/steam-player-status';

// @route   GET /
// @desc    Get steam player status
// @access  Public
router.route('/status/').get(getStatus)

export default router
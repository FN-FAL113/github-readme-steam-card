const express = require('express')
const router = express.Router()

const { getStatus } = require('../controllers/steam-player-status')

// @route   GET /
// @desc    Get steam player status
// @access  Public
router.route('/').get(getStatus)

module.exports = router
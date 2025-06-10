const express = require('express');
const router = express.Router();
const processController = require('../controllers/processController');

router.delete('/clear', processController.clearCache);
router.get('/stats', processController.getCacheStats);

module.exports = router;
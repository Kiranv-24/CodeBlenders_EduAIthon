const express = require('express');
const router = express.Router();
const { chatWithBot } = require('../controllers/chatbot.controller');

router.post('/chat', chatWithBot);

module.exports = router;

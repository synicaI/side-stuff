const express = require('express');
const app = express();
const authRoute = require('./routes/auth');

// ===== Start bot automatically =====
require('../bot/bot.js');

const PORT = process.env.PORT || 8080;

// Routes
app.use('/auth', authRoute);

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

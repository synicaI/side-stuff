const express = require('express');
const app = express();
const authRoute = require('./routes/auth');

const PORT = process.env.PORT || 8080;

app.use('/auth', authRoute);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

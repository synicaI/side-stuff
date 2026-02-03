const express = require('express');
const router = express.Router();
const db = require('../db');
const { SECRET } = require('../config');

router.get('/', (req, res) => {
    const { key, hwid, secret } = req.query;

    if (secret !== SECRET) return res.status(403).send("Invalid secret");

    db.get("SELECT * FROM users WHERE key = ?", [key], (err, user) => {
        if (err) return res.status(500).send("Server error");
        if (!user) return res.status(401).send("Invalid key");
        if (user.banned) return res.status(403).send("Banned");
        if (Date.now() > user.expires) return res.status(403).send("Expired");

        // Bind HWID if not already
        if (!user.hwid) {
            db.run("UPDATE users SET hwid = ? WHERE key = ?", [hwid, key]);
        } else if (user.hwid !== hwid) {
            return res.status(403).send("HWID mismatch");
        }

        res.status(200).send("OK");
    });
});

module.exports = router;

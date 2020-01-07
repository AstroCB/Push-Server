const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const push = require("./push");
const tokens = require("./tokens");
const app = express();

// Configure server settings
app.set("port", (process.env.PORT || 3000));
app.listen(app.get("port"), () => {
    console.log(`Listening on port ${app.get("port")}...`);
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// Listen for new tokens
app.post("/newtoken", (req, res) => {
    if (req.body) {
        tokens.addToken(req.body.token.toLowerCase(), req.body.bundleId);
        res.sendStatus(200);
    } else {
        res.status(500).send({
            "error": "Error receiving token"
        });
    }
});

// Listen for new push notification requests
app.post("/newpush", (req, res) => {
    if (req.body) {
        push.sendToAll(req.body.bundleId, req.body.body, req.body.title);
        res.sendStatus(200);
    } else {
        res.status(500).send({
            "error": "Error receiving message data"
        });
    }
});
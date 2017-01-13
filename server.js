const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const push = require("./push.js");
const app = express();

// Configure server settings
app.set("port", (process.env.PORT || 3000));
app.listen(app.get("port"), function() {
    console.log(`Listening on port ${app.get("port")}`);
});
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}));

// Listen for new tokens
app.post("/newtoken", function(req, res) {
    if (req.body) {
        addToken(req.body.token.toLowerCase(), req.body.bundleId);
        res.sendStatus(200);
    } else {
        res.status(500).send({
            "error": "Error receiving token"
        });
    }
});

// Listen for new push notification requests
app.post("/newpush", function(req, res) {
    if (req.body) {
        push.sendToAll(req.body.appIdentifier, req.body.body, req.body.title);
        res.sendStatus(200);
    } else {
        res.status(500).send({
            "error": "Error receiving message data"
        });
    }
});

function addToken(token, bundleId) {
    var now = (new Date()).toISOString(); // For record-keeping
    fs.readFile("tokens.json", function(err, data) {
        if (!err) {
            var storage = JSON.parse(data);
            if (storage[bundleId][token]) { // Token already exists: update
                storage[bundleId][token].updatedAt = now;
            } else {
                storage[bundleId][token] = {
                    "createdAt": now,
                    "updatedAt": now
                };
            }
            fs.writeFile("tokens.json", JSON.stringify(storage), function(err) {
                if (!err) {
                    console.log(`Database updated with token ${token} at ${now}`);
                } else {
                    console.log(`Token ${token} not added: ${err}`);
                }
            });
        } else {
            console.log("Tokens file cannot be read");
        }
    });
}

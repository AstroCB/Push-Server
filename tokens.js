const fs = require("fs");
// Grab tokens from storage
// Requires app bundle identifier (maps to tokens for that app in storage)
exports.getTokens = function(appId, callback) {
    fs.readFile("tokens.json", function(err, data) {
        if (!err) {
            const devices = JSON.parse(data)[appId];
            const tokens = Object.keys(devices); // Tokens (devices are hashed using their tokens)
            callback(null, tokens);
        } else {
            callback({
              "err": "tokens.json file does not exist"
            });
        }
    });
}

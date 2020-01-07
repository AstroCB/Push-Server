const apn = require("apn");
const fs = require("fs");
const tokenUtils = require("./tokens");
let config;
try {
    config = require("../config");
} catch (e) { // Deployed/using env vars
    config = process.env;
}

const options = {
    "token": {
        "key": "apns_push_key.p8",
        "keyId": config.keyId,
        "teamId": config.teamId
    },
    "production": true,
};
const service = new apn.Provider(options);

// Sends an notification to all registered devices (title optional)
// appId is the bundle identifier for the desired app
exports.sendToAll = (appId, body, title) => {
    tokenUtils.getTokens(appId, (err, tokens) => {
        if (!err) {
            sendNotif(appId, body, title, tokens);
        } else {
            console.log(`Failed to send push notification "${body}" with error: ${err}`);
        }
    });
}

// Internal notification helper function
function sendNotif(appId, body, title, tokens) {
    const note = title ? new apn.Notification({
        "title": title,
        "body": body
    }) : new apn.Notification({ "body": body });
    note.topic = appId;

    service.send(note, tokens).then(result => {
        console.log(`Notifications successfully delivered to ${result.sent.length} of ${tokens.length} registered devices`);
        service.shutdown();
    });
}

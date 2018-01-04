const apn = require("apn");
const fs = require("fs");
const tokenUtils = require("./tokens");
let credentials;
try {
    credentials = require("./credentials");
} catch (e) { // Deployed
    credentials = process.env;
}

const options = {
    "token": {
        "key": "apns_push_key.p8",
        "keyId": credentials.keyId,
        "teamId": credentials.teamId
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
    const note = new apn.Notification({
        "title": title,
        "body": body
    });
    note.topic = appId;

    service.send(note, tokens).then(result => {
        console.log(`Notifications successfully delivered to ${result.sent.length} of ${tokens.length} registered devices`);
        service.shutdown();
    });
}

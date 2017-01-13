const apn = require("apn");
const fs = require("fs");
const tokens = require("./tokens");

const options = {
    token: {
        key: "apns_push_key.p8",
        keyId: "V4JZA79DDM",
        teamId: "VFK9RBFX9F",
    },
    production: true,
};
const service = new apn.Provider(options);

// Sends an notification to all registered devices (title optional)
// appId is the bundle identifier for the desired app
exports.sendToAll = function(appId, body, title) {
    tokens.getTokens(appId, function(err, tokens) {
        if (!err) {
            sendNotif(appId, body, title, tokens);
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
        console.log(result.failed);
        service.shutdown();
    });
}

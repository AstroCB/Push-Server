const fs = require("fs");
let config;
try {
    config = require("../config");
} catch (e) { // Deployed remotely/using env vars
    config = process.env;
}

if (config.USES_MEMCACHIER) {
    // External storage API (Memcachier) (requires config)
    mem = require("memjs").Client.create(config.MEMCACHIER_SERVERS, {
        "username": config.MEMCACHIER_USERNAME,
        "password": config.MEMCACHIER_PASSWORD
    });
} else {
    // Use disk for storage
    mem = require("./disk");
}

// Grab tokens from storage
// Requires app bundle identifier (maps to tokens for that app in storage)
exports.getTokens = (bundleId, callback, retry = false) => {
    mem.get("tokens", (err, data) => {
        try {
            if (err) { throw new Error("Error retrieving from memory"); }

            const devices = JSON.parse(data)[bundleId];
            const tokens = Object.keys(devices); // Tokens (devices are hashed using their tokens)
            callback(null, tokens);
        } catch (e) {
            // Retrieval from memory failed; attempt to recover by restoring snapshot
            try {
                fs.readFile("backup.json", (err, backup) => {
                    if (err) { throw new Error("Couldn't read backup file"); }
                    mem.set("tokens", backup.toString(), {}, (err) => {
                        if (err) { throw new Error("Couldn't restore from backup"); }

                        // Backup should have been restored successfully; execute recursively if
                        // it hasn't tried to already
                        if (!retry) {
                            exports.getTokens(bundleId, callback, true);
                        } else {
                            throw new Error("[MAJOR] Couldn't read restored backup (backup corrupted!)");
                        }
                    });
                });
            } catch (e) {
                callback(new Error("Tokens couldn't be retrieved from memory"));
                console.log(`FATAL: Error retrieving tokens from memory: ${e}`);
            }
        }
    });
}

// Add/update token in database
exports.addToken = (token, bundleId) => {
    const now = (new Date()).toISOString(); // For record-keeping
    // Read in db to get current token list
    mem.get("tokens", (err, data) => {
        if (!err) {
            const backup = data; // In case update fails

            let storage = JSON.parse(data) || {};

            if (!storage[bundleId]) { // New bundle ID: needs to be added 
                storage[bundleId] = {};
            }

            if (storage[bundleId][token]) { // Token already exists: update
                storage[bundleId][token].updatedAt = now;
            } else { // Create new token
                storage[bundleId][token] = {
                    "createdAt": now,
                    "updatedAt": now
                };
            }
            // Update db with new token info
            mem.set("tokens", JSON.stringify(storage), {}, (err) => {
                if (!err) {
                    console.log(`Database updated with token ${token} at ${now}`);
                } else {
                    // Update failed
                    console.log(`Token ${token} not added: ${err}`);

                    // Try to restore old database state
                    mem.set("tokens", JSON.stringify(backup), {}, (err) => {
                        console.log(err ? "FATAL: Restoration failed" : "Earlier db state restored");
                    });
                }
            });
        } else {
            console.log("FATAL: Tokens file cannot be read");
        }
    });
}

// Get the raw database information (for db encapsulation purposes)
// Includes creation date and last update date in ISO format
exports.getRawTokenData = (callback) => {
    mem.get("tokens", (err, data) => {
        if (!err) {
            const tokens = JSON.parse(data);
            callback(null, tokens);
        } else {
            callback(err);
        }
    });
}
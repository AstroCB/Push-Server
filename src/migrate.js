// For migrating old Parse data to new JSON storage
const fs = require("fs");

// Holds new data to be written to tokens.json
let newData = {};

// Bundle identifiers/directory names of apps to be migrated
const bundles = [];
// Parse each directory for new info and store in newData
for (let i = 0; i < bundles.length; i++) {
    const b = bundles[i];
    newData[b] = {}; // Store device data here hashed by device token
    const data = fs.readFileSync(`LegacyParseData/${b}/_Installation.json`);
    const devices = JSON.parse(data).results; // Array of installations
    for (let j = 0; j < devices.length; j++) {
        const dev = devices[j];
        // Hash devices by token to created/updated values (don't really need anything else)
        newData[b][dev.deviceToken] = {
            "createdAt": dev.createdAt,
            "updatedAt": dev.updatedAt
        };
    }
}
// Write to file after parsing has finished
fs.writeFile("backup.json", JSON.stringify(newData), (err) => {
    if (!err) {
        console.log("Data successfully migrated to tokens.json");
    } else {
        console.log(err);
    }
});

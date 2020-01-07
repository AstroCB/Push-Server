// Run this to archive all current token data stored in memory
// Stored in a file called backup.json on disk

const fs = require("fs");
const tokens = require("./tokens");

tokens.getRawTokenData((err, tokenData) => {
    if (!err) {
        fs.writeFile("backup.json", JSON.stringify(tokenData), (err) => {
            if (!err) {
                console.log(`Archive completed at ${(new Date()).toISOString()}`);
                process.exit(0);
            } else {
                console.log(`Failed to store archive to disk: ${err}`);
                process.exit(-1);
            }
        });
    } else {
        console.log(`Failed to retrieve token data for archive: ${err}`);
        process.exit(-1);
    }
});
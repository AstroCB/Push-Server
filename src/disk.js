// Use disk for storage but maintain Memcachier semantics

const fs = require("fs");
const file = "backup.js";

exports.get = (_, cb) => {
    fs.readFile(file, (err, data) => {
        if (err) { return cb(err); }

        cb(null, JSON.parse(data));
    });
};

exports.set = (_, val, __, cb) => {
    fs.writeFile(file, JSON.stringify(val), cb);
};

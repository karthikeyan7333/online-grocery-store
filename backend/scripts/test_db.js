const fs = require("fs");
const initializeDatabase = require("../config/database");
const { dataDirectory } = require("../model/jsonDatabase");

initializeDatabase()
    .then(() => {
        const files = fs.readdirSync(dataDirectory).filter((name) => name.endsWith(".json"));
        console.log(`JSON storage ready at ${dataDirectory} (${files.length} files).`);
    })
    .catch((error) => {
        console.error("JSON storage check failed:", error.message);
        process.exitCode = 1;
    });

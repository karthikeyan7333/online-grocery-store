const { initializeCollections } = require("../model/jsonDatabase");
const { allModelDefinitions } = require("../model/jsonModel");
require("../model/grocerymodel");

async function initializeDatabase() {
    const filenames = allModelDefinitions().map((definition) => definition.filename);
    await initializeCollections(filenames);
    console.log(`JSON data ready (${filenames.length} collections)`);
}

module.exports = initializeDatabase;

const fs = require("fs").promises;
const path = require("path");
const crypto = require("crypto");

const dataDirectory = path.resolve(__dirname, "../data");
const collectionLocks = new Map();

function collectionPath(filename) {
    return path.join(dataDirectory, filename);
}

async function ensureCollection(filename) {
    await fs.mkdir(dataDirectory, { recursive: true });
    const target = collectionPath(filename);
    try {
        await fs.access(target);
    } catch (error) {
        if (error.code !== "ENOENT") throw error;
        await writeFileAtomically(filename, []);
    }
    return target;
}

async function readCollection(filename) {
    const target = await ensureCollection(filename);
    let content;
    try {
        content = await fs.readFile(target, "utf8");
    } catch (error) {
        throw new Error(`Unable to read ${filename}: ${error.message}`);
    }
    try {
        const records = JSON.parse(content);
        if (!Array.isArray(records)) throw new Error("collection root must be a JSON array");
        return records;
    } catch (error) {
        throw new Error(`JSON data file ${filename} is invalid; it was left untouched: ${error.message}`);
    }
}

async function writeFileAtomically(filename, records) {
    await fs.mkdir(dataDirectory, { recursive: true });
    const target = collectionPath(filename);
    const temporary = `${target}.${process.pid}.${crypto.randomBytes(8).toString("hex")}.tmp`;
    const contents = `${JSON.stringify(records, null, 2)}\n`;
    let handle;
    try {
        handle = await fs.open(temporary, "wx", 0o600);
        await handle.writeFile(contents, "utf8");
        await handle.sync();
        await handle.close();
        handle = undefined;
        await fs.rename(temporary, target);
    } catch (error) {
        if (handle) await handle.close().catch(() => {});
        await fs.unlink(temporary).catch(() => {});
        throw new Error(`Unable to safely write ${filename}: ${error.message}`);
    }
}

async function withCollectionLock(filename, operation) {
    const prior = collectionLocks.get(filename) || Promise.resolve();
    const current = prior.catch(() => {}).then(operation);
    collectionLocks.set(filename, current);
    try {
        return await current;
    } finally {
        if (collectionLocks.get(filename) === current) collectionLocks.delete(filename);
    }
}

async function updateCollection(filename, operation) {
    return withCollectionLock(filename, async () => {
        const records = await readCollection(filename);
        const result = await operation(records);
        await writeFileAtomically(filename, records);
        return result;
    });
}

async function initializeCollections(filenames) {
    await fs.mkdir(dataDirectory, { recursive: true });
    for (const filename of filenames) await ensureCollection(filename);
}

module.exports = {
    dataDirectory,
    ensureCollection,
    initializeCollections,
    readCollection,
    updateCollection
};

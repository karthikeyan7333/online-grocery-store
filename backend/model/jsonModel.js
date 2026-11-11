const crypto = require("crypto");
const { readCollection, updateCollection } = require("./jsonDatabase");

const definitions = new Map();

function clone(value) {
    if (value instanceof Date) return new Date(value);
    if (Array.isArray(value)) return value.map(clone);
    if (value && typeof value === "object") {
        const copy = {};
        for (const [key, item] of Object.entries(value)) copy[key] = clone(item);
        return copy;
    }
    return value;
}

function jsonSafe(value) {
    if (value instanceof Date) return value.toISOString();
    if (Array.isArray(value)) return value.map(jsonSafe);
    if (value && typeof value === "object") {
        const copy = {};
        for (const [key, item] of Object.entries(value)) copy[key] = jsonSafe(item);
        return copy;
    }
    return value;
}

function readPathValues(value, path) {
    const parts = path.split(".");
    let current = [value];
    for (const part of parts) {
        const next = [];
        for (const item of current) {
            if (Array.isArray(item)) {
                for (const entry of item) {
                    if (entry != null && Object.prototype.hasOwnProperty.call(entry, part)) next.push(entry[part]);
                }
            } else if (item != null && Object.prototype.hasOwnProperty.call(item, part)) {
                next.push(item[part]);
            }
        }
        current = next;
    }
    return current;
}

function comparable(value) {
    if (value instanceof Date) return value.getTime();
    if (value && typeof value === "object" && value._id !== undefined) return String(value._id);
    if (value === null || value === undefined) return value;
    const parsed = typeof value === "string" ? Date.parse(value) : NaN;
    return Number.isNaN(parsed) ? value : parsed;
}

function equals(actual, expected) {
    if (expected instanceof RegExp) return typeof actual === "string" && expected.test(actual);
    if (Array.isArray(actual)) return actual.some((item) => equals(item, expected));
    if (expected instanceof Date || actual instanceof Date) return comparable(actual) === comparable(expected);
    if (actual && typeof actual === "object" && actual._id !== undefined) actual = actual._id;
    if (expected && typeof expected === "object" && expected._id !== undefined) expected = expected._id;
    if (actual == null || expected == null) return actual === expected;
    if (typeof actual === "object" || typeof expected === "object") {
        return JSON.stringify(jsonSafe(actual)) === JSON.stringify(jsonSafe(expected));
    }
    return String(actual) === String(expected);
}

function compareOperator(actualValues, operator, expected) {
    const values = actualValues.length ? actualValues : [undefined];
    if (operator === "$exists") return expected ? values.some((value) => value !== undefined) : values.every((value) => value === undefined);
    if (operator === "$ne") return values.every((value) => !equals(value, expected));
    if (operator === "$nin") return values.every((value) => !expected.some((candidate) => equals(value, candidate)));
    if (operator === "$in") return values.some((value) => expected.some((candidate) => equals(value, candidate)));
    if (operator === "$eq") return values.some((value) => equals(value, expected));
    if (operator === "$regex") {
        const regex = expected instanceof RegExp ? expected : new RegExp(expected, "");
        return values.some((value) => typeof value === "string" && regex.test(value));
    }
    const left = comparable(values[0]);
    const right = comparable(expected);
    if (operator === "$gt") return values.some((value) => comparable(value) > right);
    if (operator === "$gte") return values.some((value) => comparable(value) >= right);
    if (operator === "$lt") return values.some((value) => comparable(value) < right);
    if (operator === "$lte") return values.some((value) => comparable(value) <= right);
    if (operator === "$not") return !matchesCondition(values[0], expected);
    throw new Error(`Unsupported JSON query operator: ${operator}`);
}

function matchesCondition(actual, expected) {
    if (expected instanceof RegExp) return typeof actual === "string" && expected.test(actual);
    if (expected && typeof expected === "object" && !Array.isArray(expected) && !(expected instanceof Date)) {
        const operators = Object.keys(expected).filter((key) => key.startsWith("$"));
        if (operators.length) {
            return operators.every((operator) => compareOperator(actual === undefined ? [] : [actual], operator, expected[operator]));
        }
        if (actual && typeof actual === "object") return matches(actual, expected);
    }
    return equals(actual, expected);
}

function matches(record, query = {}) {
    return Object.entries(query).every(([key, expected]) => {
        if (key === "$or") return expected.some((branch) => matches(record, branch));
        if (key === "$and") return expected.every((branch) => matches(record, branch));
        if (key === "$nor") return expected.every((branch) => !matches(record, branch));
        const values = readPathValues(record, key);
        if (expected && typeof expected === "object" && !Array.isArray(expected) && !(expected instanceof Date)) {
            const operators = Object.keys(expected).filter((operator) => operator.startsWith("$"));
            if (operators.length) return operators.every((operator) => compareOperator(values, operator, expected[operator]));
        }
        return values.some((value) => matchesCondition(value, expected));
    });
}

function setPath(target, path, value) {
    const parts = path.split(".");
    let current = target;
    for (let index = 0; index < parts.length - 1; index += 1) {
        const part = parts[index];
        if (Array.isArray(current)) {
            for (const entry of current) setPath(entry, parts.slice(index).join("."), value);
            return;
        }
        if (!current[part] || typeof current[part] !== "object") current[part] = {};
        current = current[part];
    }
    if (Array.isArray(current)) {
        for (const entry of current) entry[parts[parts.length - 1]] = clone(value);
    } else {
        current[parts[parts.length - 1]] = clone(value);
    }
}

function transformPath(target, path, transform) {
    const parts = path.split(".");
    const [head, ...tail] = parts;
    if (Array.isArray(target)) {
        for (const entry of target) transformPath(entry, path, transform);
    } else if (target && typeof target === "object") {
        if (tail.length) transformPath(target[head], tail.join("."), transform);
        else if (target[head] !== undefined && target[head] !== null) target[head] = transform(target[head]);
    }
}

function applyUpdate(record, update) {
    if (!update || typeof update !== "object") return;
    const keys = Object.keys(update);
    const operators = keys.some((key) => key.startsWith("$"));
    const operations = operators ? update : { $set: update };
    for (const [operator, values] of Object.entries(operations)) {
        if (operator === "$set") {
            for (const [key, value] of Object.entries(values)) setPath(record, key, value);
        } else if (operator === "$unset") {
            for (const key of Object.keys(values)) {
                const parts = key.split(".");
                const field = parts.pop();
                const parents = readPathValues(record, parts.join("."));
                for (const parent of parents) if (parent && typeof parent === "object") delete parent[field];
            }
        } else if (operator === "$inc") {
            for (const [key, amount] of Object.entries(values)) {
                const current = readPathValues(record, key)[0] || 0;
                setPath(record, key, Number(current) + Number(amount));
            }
        } else if (operator === "$push" || operator === "$addToSet") {
            for (const [key, value] of Object.entries(values)) {
                const current = readPathValues(record, key)[0];
                const array = Array.isArray(current) ? current : [];
                const additions = value && value.$each ? value.$each : [value];
                for (const addition of additions) {
                    if (operator === "$push" || !array.some((entry) => equals(entry, addition))) array.push(clone(addition));
                }
                setPath(record, key, array);
            }
        } else if (operator === "$pull") {
            for (const [key, condition] of Object.entries(values)) {
                const current = readPathValues(record, key)[0];
                if (Array.isArray(current)) {
                    setPath(record, key, current.filter((entry) => !matchesCondition(entry, condition)));
                }
            }
        } else {
            throw new Error(`Unsupported JSON update operator: ${operator}`);
        }
    }
}

function normalizePopulate(specification) {
    if (!specification) return [];
    if (Array.isArray(specification)) return specification.flatMap(normalizePopulate);
    if (typeof specification === "string") return [{ path: specification }];
    if (typeof specification === "object" && specification.path) return [specification];
    return [];
}

function project(record, select) {
    if (!select) return clone(record);
    const fields = String(select).split(/\s+/).filter(Boolean);
    const included = fields.filter((field) => !field.startsWith("-"));
    const excluded = fields.filter((field) => field.startsWith("-")).map((field) => field.slice(1));
    if (included.length) {
        const result = {};
        if (!excluded.includes("_id") && record._id !== undefined) result._id = clone(record._id);
        for (const field of included) {
            if (field === "_id") continue;
            if (Object.prototype.hasOwnProperty.call(record, field)) result[field] = clone(record[field]);
        }
        return result;
    }
    const result = clone(record);
    for (const field of excluded) delete result[field];
    return result;
}

async function populateValue(value, model, owner, path, select, nested) {
    if (value == null) return value;
    if (Array.isArray(value)) return Promise.all(value.map((entry) => populateValue(entry, model, path, select, nested)));
    if (value && typeof value === "object" && value._id !== undefined) return value;
    const definition = definitions.get(model.modelName);
    const reference = definition && definition.references[path];
    if (!reference) throw new Error(`No JSON reference is configured for ${model.modelName}.${path}`);
    const targetName = typeof reference === "string"
        ? reference
        : (reference.aliases && reference.aliases[owner[reference.refPath]]) || owner[reference.refPath];
    const target = definitions.get(targetName);
    if (!target) return null;
    const records = await readCollection(target.filename);
    const found = records.find((record) => String(record._id) === String(value));
    if (!found) return null;
    const populated = project(found, select);
    if (nested) await applyPopulateSpec(populated, target.model, nested);
    return populated;
}

async function walkPopulate(root, model, parts, fullPath, select, nested) {
    if (root == null) return;
    if (Array.isArray(root)) {
        await Promise.all(root.map((entry) => walkPopulate(entry, model, parts, fullPath, select, nested)));
        return;
    }
    const [head, ...tail] = parts;
    if (tail.length) {
        await walkPopulate(root[head], model, tail, fullPath, select, nested);
        return;
    }
    root[head] = await populateValue(root[head], model, root, fullPath, select, nested);
}

async function applyPopulateSpec(document, model, specification) {
    for (const item of normalizePopulate(specification)) {
        const path = String(item.path);
        await walkPopulate(document, model, path.split("."), path, item.select, item.populate);
    }
}

function createModel(modelName, configuration) {
    const definition = { modelName, ...configuration };

    class JSONDocument {
        constructor(data = {}) {
            Object.assign(this, clone(data));
            for (const [field, fallback] of Object.entries(definition.defaults || {})) {
                if (this[field] === undefined) this[field] = typeof fallback === "function" ? fallback() : clone(fallback);
            }
            if (definition.timestamps) {
                const now = new Date();
                if (this.createdAt === undefined) this.createdAt = now;
                if (this.updatedAt === undefined) this.updatedAt = now;
            }
            if (!this._id) this._id = crypto.randomBytes(12).toString("hex");
            for (const field of definition.dateFields || []) {
                if (this[field] != null && !(this[field] instanceof Date)) {
                    const date = new Date(this[field]);
                    if (!Number.isNaN(date.getTime())) this[field] = date;
                }
            }
            for (const field of definition.numberFields || []) {
                transformPath(this, field, (value) => {
                    if (value === "") return null;
                    const number = Number(value);
                    if (!Number.isFinite(number)) throw new Error(`${modelName}.${field} must be a number`);
                    return number;
                });
            }
            for (const field of definition.booleanFields || []) {
                transformPath(this, field, (value) => value === true || value === "true" || value === 1 || value === "1");
            }
            for (const field of definition.trimFields || []) {
                transformPath(this, field, (value) => typeof value === "string" ? value.trim() : value);
            }
            for (const field of definition.subdocumentArrays || []) {
                if (Array.isArray(this[field])) {
                    this[field] = this[field].map((entry) => ({ ...entry, _id: entry._id || crypto.randomBytes(12).toString("hex") }));
                }
            }
        }

        get id() { return String(this._id); }

        toJSON() {
            const result = {};
            for (const [key, value] of Object.entries(this)) result[key] = jsonSafe(value);
            return result;
        }

        async populate(specification) {
            await applyPopulateSpec(this, Model, specification);
            return this;
        }

        async save() {
            const record = new Model(this.toJSON()).toJSON();
            if (definition.timestamps) record.updatedAt = new Date();
            for (const required of definition.required || []) {
                if (record[required] === undefined || record[required] === null || record[required] === "") {
                    throw new Error(`${modelName}.${required} is required`);
                }
            }
            for (const [field, allowed] of Object.entries(definition.enums || {})) {
                if (record[field] != null && !allowed.includes(record[field])) {
                    throw new Error(`${modelName}.${field} must be one of: ${allowed.join(", ")}`);
                }
            }
            const stored = await updateCollection(definition.filename, (records) => {
                for (const field of definition.unique || []) {
                    if (records.some((entry) => String(entry._id) !== String(record._id) && entry[field] === record[field])) {
                        throw new Error(`${modelName}.${field} must be unique`);
                    }
                }
                const index = records.findIndex((entry) => String(entry._id) === String(record._id));
                if (index < 0) records.push(jsonSafe(record));
                else records[index] = jsonSafe(record);
                return jsonSafe(record);
            });
            Object.assign(this, clone(stored));
            for (const field of definition.dateFields || []) {
                if (this[field] != null && !(this[field] instanceof Date)) this[field] = new Date(this[field]);
            }
            if (definition.timestamps) {
                this.createdAt = this.createdAt instanceof Date ? this.createdAt : new Date(this.createdAt);
                this.updatedAt = this.updatedAt instanceof Date ? this.updatedAt : new Date(this.updatedAt);
            }
            return this;
        }
    }

    class JSONQuery {
        constructor(query, one = false) {
            this.query = query || {};
            this.one = one;
            this.populations = [];
            this.sortOrder = null;
            this.maxResults = null;
        }
        populate(specification, select) {
            if (typeof specification === "string" && select) this.populations.push({ path: specification, select });
            else this.populations.push(...normalizePopulate(specification));
            return this;
        }
        sort(order) { this.sortOrder = order; return this; }
        limit(amount) { this.maxResults = Math.max(0, Number(amount)); return this; }
        async exec() {
            let records = (await readCollection(definition.filename)).filter((record) => matches(record, this.query));
            if (this.sortOrder) {
                const fields = Object.entries(this.sortOrder);
                records.sort((left, right) => {
                    for (const [field, direction] of fields) {
                        const a = comparable(readPathValues(left, field)[0]);
                        const b = comparable(readPathValues(right, field)[0]);
                        if (a === b) continue;
                        if (a === undefined) return -1 * direction;
                        if (b === undefined) return 1 * direction;
                        return (a < b ? -1 : 1) * direction;
                    }
                    return 0;
                });
            }
            if (this.one) records = records.slice(0, 1);
            else if (this.maxResults !== null) records = records.slice(0, this.maxResults);
            const documents = records.map((record) => new Model(record));
            for (const population of this.populations) {
                await applyPopulateSpec(documents, Model, population);
            }
            return this.one ? documents[0] || null : documents;
        }
        then(resolve, reject) { return this.exec().then(resolve, reject); }
        catch(reject) { return this.exec().catch(reject); }
        finally(callback) { return this.exec().finally(callback); }
    }

    class Model extends JSONDocument {
        static find(query = {}) { return new JSONQuery(query); }
        static findOne(query = {}) { return new JSONQuery(query, true); }
        static findById(id) { return new JSONQuery({ _id: id == null ? null : String(id) }, true); }
        static async countDocuments(query = {}) { return (await readCollection(definition.filename)).filter((record) => matches(record, query)).length; }
        static async create(data) { const document = new Model(data); return document.save(); }
        static async findByIdAndUpdate(id, update, options = {}) {
            return updateOne({ _id: String(id) }, update, options);
        }
        static async findOneAndUpdate(query, update, options = {}) { return updateOne(query, update, options); }
        static async findByIdAndDelete(id) { return deleteOne({ _id: String(id) }); }
        static async findOneAndDelete(query) { return deleteOne(query); }
        static async updateMany(query, update) {
            let matchedCount = 0;
            let modifiedCount = 0;
            await updateCollection(definition.filename, (records) => {
                for (let index = 0; index < records.length; index += 1) {
                    const record = records[index];
                    if (!matches(record, query)) continue;
                    matchedCount += 1;
                    const before = JSON.stringify(record);
                    applyUpdate(record, update);
                    records[index] = new Model(record).toJSON();
                    const normalized = records[index];
                    if (definition.timestamps) normalized.updatedAt = new Date().toISOString();
                    if (before !== JSON.stringify(normalized)) modifiedCount += 1;
                }
            });
            return { acknowledged: true, matchedCount, modifiedCount };
        }
    }

    async function updateOne(query, update, options) {
        const before = await updateCollection(definition.filename, (records) => {
            const index = records.findIndex((record) => matches(record, query));
            if (index < 0) return null;
            const oldRecord = clone(records[index]);
            applyUpdate(records[index], update);
            records[index] = new Model(records[index]).toJSON();
            if (definition.timestamps) records[index].updatedAt = new Date().toISOString();
            return options.new || options.returnDocument === "after" ? clone(records[index]) : oldRecord;
        });
        return before ? new Model(before) : null;
    }

    async function deleteOne(query) {
        return updateCollection(definition.filename, (records) => {
            const index = records.findIndex((record) => matches(record, query));
            if (index < 0) return null;
            const [removed] = records.splice(index, 1);
            return new Model(removed);
        });
    }

    definitions.set(modelName, { ...definition, model: Model });
    Object.defineProperty(Model, "modelName", { value: modelName });
    return Model;
}

function modelDefinition(modelName) { return definitions.get(modelName); }
function allModelDefinitions() { return Array.from(definitions.values()); }

module.exports = { createModel, allModelDefinitions, modelDefinition };

import Vue from 'vue';

import * as Utils from '@/plugins/utils';

const LOCAL_STORAGE_KEY = 'na2';
const LOCAL_STORAGE_VERSION = 3;

function isValidLocalStorageObject(storage) {
    return Utils.isPlainObject(storage) &&
           Utils.isPlainObject(storage.data) &&
           typeof storage.version == 'number';
}

function migrateLocalStorage(storage /* eslint-disable-line no-unused-vars */) {
    /* not implemented, storage will be reset */
    return;
}

export default {
    observable: Vue.observable({
        entities: [],
        localStorage: null,
    }),

    /**
     * Getter for entities.
     * @returns {string[]} - Array of entities.
     */
    getEntities() {
        return this.observable.entities;
    },
    /**
     * Setter for entities.
     * @param {string[]} newEntities - New values to set.
     */
    setEntities(newEntities) {
        this.observable.entities = newEntities;
    },

    /**
     * Add a search history or a bookmark entry, then persist it to the
     * browser local storage.
     * The entries are stored per entity with a limit of 10 for bookmarks and
     * 5 for the search history. If the same entry (label) exist, remove it.
     * Then, put the new one up front and remove the last one if the length
     * limit was reached. We could index an object by label, yet those are
     * small arrays.
     * @param {string} type - Saved query type, either history or bookmark.
     * @param {string} entity - Name of the entity to attach the entry to.
     * @param {string} label - Display string for the entry, used as identifier.
     * @param {Location} entry - Partial route location object to replay the query.
     */
    addLocalStorageSavedQuery(type, entity, label, entry) {
        console.log(`store: addLocalStorageSavedQuery: ${type} | ${entity} | ${label} |`, entry);
        if (!type || !entity)
            return; /* prevent empty object keys */

        const storage = this.observable.localStorage; /* shortcut ref */

        if (!storage.data[type])
            Vue.set(storage.data, type, {});
        if (!storage.data[type][entity])
            Vue.set(storage.data[type], entity, []);

        /* If the same entry (label) exist, remove it. Then, put the new one up
         * front and remove the last one if the length limit was reached.
         * We could index an object by label, yet those are small arrays. */
        const currentIndex = storage.data[type][entity].findIndex((e) => e.label === label);
        if (currentIndex > -1)
            storage.data[type][entity].splice(currentIndex, 1);
        storage.data[type][entity].unshift({ label, entry });
        if (storage.data[type][entity].length > (type === 'bookmark' ? 10 : 5))
            storage.data[type][entity].pop();

        this.saveLocalStorage();
    },
    /**
     * Move a search history or a bookmark entry from one position to another.
     * The <from> and <to> position are indexes in the array holding the
     * entries for the given <type> and <entity>.
     * @param {string} type - Saved query type, either history or bookmark.
     * @param {string} entity - Name of the entity to attach the entry to.
     * @param {number} from - Initial index
     * @param {number} to - Target index
     * @pre - Given indexes <from> and <to> must be valid, ie. between 0 and
     *      array length-1.
     */
    moveLocalStorageSavedQuery(type, entity, from, to) {
        const array = this.observable.localStorage.data?.[type]?.[entity];
        if (array) {
            array.splice(to, 0, ...array.splice(from, 1));
            this.saveLocalStorage();
        }
    },
    /**
     * Delete a search history or a bookmark entry, then persist it to the
     * browser local storage.
     * @param {string} type - Saved query type, either history or bookmark.
     * @param {string} entity - Name of the entity to delete the entry from.
     * @param {number} index - Index of the entry to delete in the entity array.
     */
    deleteLocalStorageSavedQuery(type, entity, index) {
        console.log(`store: deleteLocalStorageSavedQuery: ${type} | ${entity} | ${index}`);
        this.observable.localStorage.data?.[type]?.[entity].splice(index, 1);
        this.saveLocalStorage();
    },
    /**
     * Retrieve search history or bookmark entries for a given entity.
     * @param {string} type - Saved query type, either history or bookmark.
     * @param {string} entity - Name of the entity.
     */
    getLocalStorageSavedQuery(type, entity) {
        return this.observable.localStorage.data?.[type]?.[entity];
    },
    /**
     * Persist the in-memory local storage data to the browser.
     * This is a best effort call to setItem() for localStorage key
     * LOCAL_STORAGE_KEY. If the browser's web storage API throws an error,
     * it is only loggued, at least for.
     */
    saveLocalStorage() {
        try {
            window.localStorage.setItem(LOCAL_STORAGE_KEY,
                JSON.stringify(this.observable.localStorage));
        }
        catch (e) {
            console.log('store: saveLocalStorage: Failed save storage data');
            console.log('store: saveLocalStorage: ' + e.message);
        }
    },
    /**
     * Load and parse the local storage data present in the browser under
     * localStorage key LOCAL_STORAGE_KEY. If no data is available, if it
     * is detected to be malformed, or if the JSON parsing fails, it gets
     * reset to a default value. A format version number is attached to the
     * data and is expected to match the one defined in LOCAL_STORAGE_VERSION.
     * This allows for automatic migration if the format of the data were to
     * be changed.
     *
     * @throws Assume it may throw, eg. in version migration code.
     */
    loadLocalStorage() {
        const resetValue = { version: LOCAL_STORAGE_VERSION, data: {} };
        const rawStorage = window.localStorage.getItem(LOCAL_STORAGE_KEY);
        let storage = null;
        let needReset = false;
        let needBackup = false;
        let needCommit = false;

        if (rawStorage) {
            /* parse json data fetched from local storage */
            try { storage = JSON.parse(rawStorage); }
            catch (e) {
                console.log('store: loadLocalStorage: Failed to parse storage data');
                console.log('store: loadLocalStorage: ' + e.message);
                needReset = true;
            }
            if (!needReset) { /* JSON parse was fine */
                do {
                    let lastVersionBeforeMigration = undefined;
                    if (!isValidLocalStorageObject(storage)) {
                        console.log('store: loadLocalStorage: Invalid storage data');
                        needReset = needBackup = true;
                        break;
                    }
                    /* Check if the version has increased after migration in order to prevent
                     * infinite loops in case there is a bug in the migration code. */
                    if (lastVersionBeforeMigration !== undefined &&
                        storage.version <= lastVersionBeforeMigration) {
                        console.log('store: loadLocalStorage: Version did not increased after migration code');
                        needReset = needBackup = true;
                        break;
                    }
                    if (storage.version < LOCAL_STORAGE_VERSION) {
                        console.log('store: loadLocalStorage: Current version is ' + storage.version);
                        console.log('store: loadLocalStorage: Need migration to version ' + LOCAL_STORAGE_VERSION);
                        lastVersionBeforeMigration = storage.version;
                        needCommit = true;
                        migrateLocalStorage(storage);
                        continue;
                    }
                    break;
                } while (true); /* eslint-disable-line no-constant-condition */
            }
        }
        else { /* storage data not found */
            needReset = true;
        }

        if (needBackup) {
            /* Best effort to keep a copy of the data before storage reset. */
            const backupKey = `${LOCAL_STORAGE_KEY}.old.${Date.now()}`;
            console.log(`store: loadLocalStorage: Backup storage to ${backupKey}`);
            try { window.localStorage.setItem(backupKey, rawStorage); }
            catch (e) {
                console.log('store: loadLocalStorage: Failed to backup storage');
                console.log('store: loadLocalStorage: ' + e.message);
            }
        }
        if (needReset) {
            console.log('store: loadLocalStorage: Reset storage to defaults');
            storage = resetValue;
        }

        this.observable.localStorage = storage;
        if (needReset || needCommit)
            this.saveLocalStorage();
    },
};

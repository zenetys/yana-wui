import Vue from 'vue';

export default {
    entities: [],
    data: Vue.observable({
        entityDatabases: [],
    }),
    /**
     * Getter for entity databases.
     * @returns {array} - Array of entity databases.
     */
    getEntityDatabases() {
        return this.data.entityDatabases;
    },
    /**
     * Set new values to the entity databases.
     * @param {array} newDatabases - New entity databases to set.
     */
    setEntityDatabases(newDatabases) {
        this.data.entityDatabases = newDatabases;
    },
    /**
     * Getter for entities.
     * @returns {array} - Array of entities.
     */
    getEntities() {
        return this.entities;
    },
    /**
     * Set new values to the entities.
     * @param {array} newEntities - New entities to set.
     */
    setEntities(newEntities) {
        this.entities = newEntities;
    },
};

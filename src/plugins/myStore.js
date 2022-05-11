import Vue from 'vue';

export default {
    entities: [],
    data: Vue.observable({
        entityDatabases: [],
        infoMessage: {},
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
    /**
     * Getter for the info message alert.
     * @returns {object} - The info message.
     */
    getInfoMessage() {
        return this.data.infoMessage;
    },
    /**
     * Set a new value for the info message.
     * @param {object} newMessage - The new info message to set.
     */
    setInfoMessage(newMessage) {
        this.data.infoMessage = newMessage;
    },
};

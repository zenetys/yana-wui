import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        storeEntityDatabases: [],
        storeEntities: [],
        storeInventoryMode: '',
        storeInfoMessage: {},
    },
    mutations: {
        EDIT_STORE_ENTITY_DATABASES(state, value) {
            console.log('from store: mutation EDIT_STORE_ENTITY_DATABASES', value);
            state.storeEntityDatabases = value;
        },
        EDIT_STORE_ENTITIES(state, value) {
            console.log('from store: mutation EDIT_STORE_ENTITIES', value);
            state.storeEntities = value;
        },
        EDIT_STORE_INVENTORY_MODE(state, value) {
            console.log('from store: mutation EDIT_STORE_INVENTORY_MODE', value);
            state.storeInventoryMode = value;
        },
        EDIT_STORE_INFO_MESSAGE(state, value) {
            console.log('from store: mutation EDIT_STORE_INFO_MESSAGE', value);
            state.storeInfoMessage = value;
        },
    },
    actions: {
        updateStoreEntityDatabases({ commit }, value) {
            commit('EDIT_STORE_ENTITY_DATABASES', value);
        },
        updateStoreEntities({ commit }, value) {
            commit('EDIT_STORE_ENTITIES', value);
        },
        updateStoreInventoryMode({ commit }, value) {
            commit('EDIT_STORE_INVENTORY_MODE', value);
        },
        updateStoreInfoMessage({ commit }, value) {
            commit('EDIT_STORE_INFO_MESSAGE', value);
        },
    },
    getters: {
        storeEntityDatabases: (state) => {
            return state.storeEntityDatabases;
        },
        storeEntities: (state) => {
            return state.storeEntities;
        },
        storeInventoryMode: (state) => {
            return state.storeInventoryMode;
        },
        storeInfoMessage: (state) => {
            return state.storeInfoMessage;
        },
    },
    modules: {},
});

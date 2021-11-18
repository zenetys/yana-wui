import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        storeDatabase: '',
        storeEntities: [],
        storeEntity: '',
        storeSearch: '',
        storeInfoMessage: {},
    },
    mutations: {
        EDIT_STORE_DATABASE(state, value) {
            console.log('from store: mutation EDIT_STORE_DATABASE', value);
            state.storeDatabase = value;
        },
        EDIT_STORE_ENTITIES(state, value) {
            console.log('from store: mutation EDIT_STORE_ENTITIES', value);
            state.storeEntities = value;
        },
        EDIT_STORE_ENTITY(state, value) {
            console.log('from store: mutation EDIT_STORE_ENTITY', value);
            state.storeEntity = value;
        },
        EDIT_STORE_SEARCH(state, value) {
            console.log('from store: mutation EDIT_STORE_SEARCH', value);
            if (value===null) {
                value = '';
            }
            state.storeSearch = value;
        },
        EDIT_STORE_INFO_MESSAGE(state, value) {
            console.log('from store: mutation EDIT_STORE_INFO_MESSAGE', value);
            state.storeInfoMessage = value;
        }
    },
    actions: {
        updateStoreDatabase({ commit }, value) {
            commit('EDIT_STORE_DATABASE', value);
        },
        updateStoreEntities({ commit }, value) {
            commit('EDIT_STORE_ENTITIES', value);
        },
        updateStoreEntity({ commit }, value) {
            commit('EDIT_STORE_ENTITY', value);
        },
        updateStoreSearch({ commit }, value) {
            commit('EDIT_STORE_SEARCH', value);
        },
        updateStoreInfoMessage({ commit }, value) {
            commit('EDIT_STORE_INFO_MESSAGE', value);
        }
    },
    getters: {
        storeDatabase: state => {
            return state.storeDatabase;
        },
        storeEntities: state => {
            return state.storeEntities;
        },
        storeEntity: state => {
            return state.storeEntity;
        },
        storeSearch: state => {
            return state.storeSearch;
        },
        storeInfoMessage: state => {
            return state.storeInfoMessage;
        }
    },
    modules: {
    }
})

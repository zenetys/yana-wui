import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        storeEntities: [],
        storeEntity: '',
        storeInfoMessage: {},
    },
    mutations: {
        EDIT_STORE_ENTITIES(state, value) {
            console.log('from store: mutation EDIT_STORE_ENTITIES', value);
            state.storeEntities = value;
        },
        EDIT_STORE_ENTITY(state, value) {
            console.log('from store: mutation EDIT_STORE_ENTITY', value);
            state.storeEntity = value;
        },
        EDIT_STORE_INFO_MESSAGE(state, value) {
            console.log('from store: mutation EDIT_STORE_INFO_MESSAGE', value);
            state.storeInfoMessage = value;
        }
    },
    actions: {
        updateStoreEntities({ commit }, value) {
            commit('EDIT_STORE_ENTITIES', value);
        },
        updateStoreEntity({ commit }, value) {
            commit('EDIT_STORE_ENTITY', value);
        },
        updateStoreInfoMessage({ commit }, value) {
            commit('EDIT_STORE_INFO_MESSAGE', value);
        }
    },
    getters: {
        storeEntities: state => {
            return state.storeEntities;
        },
        storeEntity: state => {
            return state.storeEntity;
        },
        storeInfoMessage: state => {
            return state.storeInfoMessage;
        }
    },
    modules: {
    }
})

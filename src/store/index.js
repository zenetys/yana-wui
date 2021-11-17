import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        storeInfoMessage: {},
    },
    mutations: {
        EDIT_STORE_INFO_MESSAGE(state, value) {
            console.log('from store: mutation EDIT_STORE_INFO_MESSAGE', value);
            state.storeInfoMessage = value;
        }
    },
    actions: {
        updateStoreInfoMessage({ commit }, value) {
            commit('EDIT_STORE_INFO_MESSAGE', value);
        }
    },
    getters: {
        storeInfoMessage: state => {
            return state.storeInfoMessage;
        }
    },
    modules: {
    }
})

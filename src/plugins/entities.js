import Api from '@/plugins/api';
import store from '@/store';

export default {
    /**
     * Fetch entities from the API and store them.
     * @async
     */
    async fetchStoreEntities() {
        const errorContext = 'Could not fetch entities.';
        const entities = await Api.get('/entities', errorContext);
        store.commit('EDIT_STORE_ENTITIES', entities);
        store.commit('EDIT_STORE_INFO_MESSAGE', {});
    },
};

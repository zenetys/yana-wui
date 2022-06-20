import Api from '@/plugins/api';
import Store from '@/plugins/store';

export default {
    /**
     * Fetch entities from the API and store them.
     * @async
     */
    async fetchStoreEntities() {
        const errorContext = 'Could not fetch entities.';
        const entities = await Api.get('/entities', errorContext);
        Store.setEntities(entities);
    },
};

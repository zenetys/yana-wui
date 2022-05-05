import Api from '@/plugins/api';
import MyStore from '@/plugins/myStore';

export default {
    /**
     * Fetch entities from the API and store them.
     * @async
     */
    async fetchStoreEntities() {
        const errorContext = 'Could not fetch entities.';
        const entities = await Api.get('/entities', errorContext);
        MyStore.setEntities(entities);
        MyStore.setInfoMessage({});
    },
};

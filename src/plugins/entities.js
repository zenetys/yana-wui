import Api from '@/plugins/api';
import store from '@/store';

export default {
    /**
     * Fetch entities from the API and store them.
     * @async
     */
    async fetchStoreEntities() {
        await Api.get('/entities')
            .then((response) => {
                store.commit('EDIT_STORE_ENTITIES', response.data);
                store.commit('EDIT_STORE_INFO_MESSAGE', {});
            })
            .catch((error) => {
                console.log('Error fetching entities :', error);

                store.commit('EDIT_STORE_INFO_MESSAGE', {
                    type: 'error',
                    content: 'Can not retrieve entities. Problem with query.',
                    error: error,
                });
            });
    },
};

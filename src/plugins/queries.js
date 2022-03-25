import store from '../store';
import Api from '@/plugins/api';

export function fetchUpdateStoreEntities() {
    Api.get('/entities')
        .then((response) => {
            store.commit('EDIT_STORE_ENTITIES', response.data);
            store.commit('EDIT_STORE_INFO_MESSAGE', {});
        })
        .catch((error) => {
            console.log(error);
            store.commit('EDIT_STORE_INFO_MESSAGE', {
                type: 'error',
                content: 'Can not retrieve entities. Problem with query.',
                error: error,
            });
        });
}

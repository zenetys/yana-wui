import store from "../store";
import axios from 'axios';

export function fetchUpdateStoreEntities() {
    let url = '/entities';
    axios({
        method: 'get',
        url: url,
    }).then( (response) => {
        store.commit('EDIT_STORE_ENTITIES', response.data);
        store.commit('EDIT_STORE_INFO_MESSAGE', {});
    }).catch((error) => {
        console.log(error);
        store.commit('EDIT_STORE_INFO_MESSAGE', { type: 'error', content: 'Can not retrieve entities. Problem with query.', error: error });
    });
}

import '@fontsource/roboto/latin.css';
import '@mdi/font/css/materialdesignicons.css';

import Vue from 'vue';
import App from '@/App.vue';
import router from '@/router';
import vuetify from '@/plugins/vuetify';
import Api from '@/plugins/api';
import * as Utils from '@/plugins/utils';
import Entities from '@/plugins/entities';
import store from '@/store';

Vue.config.productionTip = false;
Vue.prototype.$api = Api;
Vue.prototype.$utils = Utils;

async function init() {
    /* Initialise the API plugin */
    await Api.init();
    /* Fetch all Entities */
    await Entities.fetchStoreEntities();

    new Vue({
        router,
        vuetify,
        store,
        render: (h) => h(App),
    }).$mount('#app');
}

init();

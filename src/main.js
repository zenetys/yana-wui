import '@fontsource/roboto/latin.css';
import '@mdi/font/css/materialdesignicons.css';

import Vue from 'vue';
import App from '@/App.vue';
import router from '@/router';
import vuetify from '@/plugins/vuetify';
import Api from '@/plugins/api';
import * as Utils from '@/plugins/utils';
import Entities from '@/plugins/entities';
import MyStore from '@/plugins/myStore';

Vue.config.productionTip = false;
Vue.prototype.$api = Api;
Vue.prototype.$utils = Utils;
Vue.prototype.$mystore = MyStore;

async function init() {
    /* Initialise the API plugin */
    await Api.init();
    /* Fetch all Entities */
    await Entities.fetchStoreEntities();

    new Vue({
        router,
        vuetify,
        render: (h) => h(App),
    }).$mount('#app');
}

init();

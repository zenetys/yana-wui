import '@fontsource/roboto/latin.css';
import '@mdi/font/css/materialdesignicons.css';

import Vue from 'vue';
import App from '@/App.vue';
import router from '@/router';
import vuetify from '@/plugins/vuetify';
import Api from '@/plugins/api';
import * as Utils from '@/plugins/utils';
import Store from '@/plugins/store';
import Ev from '@/plugins/evbus';

Vue.config.productionTip = false;
Vue.prototype.$api = Api;
Vue.prototype.$utils = Utils;
Vue.prototype.$store = Store;
Vue.prototype.$ev = Ev;

async function init() {
    const earlyErrors = [];

    /* Initialise the API plugin */
    try { await Api.init() }
    catch (e) {
        earlyErrors.push({ title: 'Failed to initialize API',
            error: e, duration: null });
    }

    /* Fetch entities */
    try {
        const entities = await Api.axiosData('/entities', false);
        Store.setEntities(entities);
    }
    catch (e) {
        earlyErrors.push({ title: 'Failed to retrieve entities',
            error: e, duration: null });
    }

    /* Start Vue */
    new Vue({
        router,
        vuetify,
        render: (h) => h(App),
        mounted: () => {
            /* Render early errors */
            earlyErrors.forEach((ee) => Ev.$emit('message', ee));
        }
    }).$mount('#app');
}

init();

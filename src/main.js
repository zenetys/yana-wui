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

/* Imports related to optional features */
import ViewInventory from '@/views/ViewInventory.vue';
import ViewMain from '@/views/ViewMain.vue';
import mixinMainBackup from '@/mixins/main-backup.js';
import mixinInventoryBackup from '@/mixins/inventory-backup.js';
import backupRoutes from '@/router/backup.js'

async function init() {
    const earlyErrors = [];

    /* Load browser local storage */
    try { Store.loadLocalStorage() }
    catch (e) {
        earlyErrors.push({ title: 'Failed to load browser storage',
            error: e, duration: null });
    }

    /* Initialise the API plugin */
    try { await Api.init() }
    catch (e) {
        earlyErrors.push({ title: 'Failed to initialize API',
            error: e, duration: null });
    }

    /* Backup optional feature */
    if (Api.jsonConfig?.BACKUP_ENABLED) {
        console.log('main: enable backup addon');
        ViewInventory.mixins = [...ViewInventory.mixins || [], mixinInventoryBackup];
        ViewMain.mixins = [...ViewMain.mixins || [], mixinMainBackup];
        for (let route of backupRoutes)
            router.addRoute('ViewMain', route);
    }

    /* Fetch entities */
    try {
        const entities = await Api.base.getEntities(false);
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

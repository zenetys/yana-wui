import "@fontsource/roboto/latin.css";
import '@mdi/font/css/materialdesignicons.css';

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import store from './store'
import axios from 'axios';

Vue.config.productionTip = false

axios.defaults.timeout = 20000;

async function init() {
    var response;

    try {
        response = await axios({
            method: 'get',
            url: 'config.json',
            responseType: 'json',
        });
        if (typeof response.data == 'object') {
            if (response.data.API_BASE_URL)
                axios.defaults.baseURL = response.data.API_BASE_URL;
            if (response.data.API_TIMEOUT)
                axios.defaults.timeout = response.data.API_TIMEOUT;
        }
    }
    catch (e) {
        console.log('Failed to retrieve app configuration!', e);
    }

    console.log('axios baseURL: ' + (axios.defaults.baseURL
        ? axios.defaults.baseURL : '<empty>'));
    console.log('axios timeout: ' + (axios.defaults.timeout
        ? axios.defaults.timeout : '<empty>'));


    new Vue({
        router,
        vuetify,
        store,
        render: (h) => h(App)
    })
        .$mount("#app");
}

init();

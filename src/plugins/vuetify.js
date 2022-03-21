import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        themes: {
            light: {
                // primary: '#106e84',
                primary: '#0f6e84',
                secondary: '#17b8ce'
            },
        },
    },
});

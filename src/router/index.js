import Vue from 'vue';
import VueRouter from 'vue-router';

import ViewEntityPicker from '@/views/ViewEntityPicker.vue';
import ViewHost from '@/views/ViewHost.vue';
import ViewInventory from '@/views/ViewInventory.vue';
import ViewMain from '@/views/ViewMain.vue';
import ViewOui from '@/views/ViewOui.vue';
import ViewSwitch from '@/views/ViewSwitch.vue';
import ViewVlanMatrix from '@/views/ViewVlanMatrix.vue';

Vue.use(VueRouter);

const routes = [
    {
        path: '/',
        redirect: {
            name: 'ViewEntityPicker',
        },
    },
    {
        path: '/entity-picker',
        name: 'ViewEntityPicker',
        component: ViewEntityPicker,
    },
    {
        path: '/main',
        name: 'ViewMain',
        component: ViewMain,
        redirect: {
            name: 'ViewInventory',
        },
        children: [
            {
                path: '/main/inventory',
                name: 'ViewInventory',
                component: ViewInventory,
                children: [
                    {
                        path: '/main/inventory/host/:id',
                        name: 'ViewHost',
                        component: ViewHost,
                    },
                    {
                        path: '/main/inventory/switch/:id',
                        name: 'ViewSwitch',
                        component: ViewSwitch,
                    },
                ],
            },
            {
                path: '/main/vlan-matrix',
                name: 'ViewVlanMatrix',
                component: ViewVlanMatrix,
            },
            {
                path: '/main/oui',
                name: 'ViewOui',
                component: ViewOui,
            },
        ],
    },
    /* redirect any invalid hash-path to slash */
    {
        path: '*',
        redirect: {
            path: '/',
        },
    },
];

const router = new VueRouter({
    routes,
});

export default router;

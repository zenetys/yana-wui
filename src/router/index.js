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
                meta: {
                    menu: [
                        {
                            label: 'Inventory',
                            icon: 'mdi-grid',
                        },
                    ],
                },
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
                meta: {
                    menu: [
                        {
                            label: 'VLAN matrix',
                            icon: 'mdi-table',
                        },
                    ],
                },
            },
            {
                path: '/main/l2-diagram',
                meta: {
                    menu: [
                        {
                            label: 'L2 diagram',
                            icon: 'mdi-graph',
                        },
                    ],
                },
            },
            {
                path: '/main/oui',
                name: 'ViewOui',
                component: ViewOui,
                meta: {
                    menu: [
                        {
                            label: 'OUI lookup',
                            icon: 'mdi-help-network-outline',
                        },
                    ],
                },
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

VueRouter.prototype.getMenu = function () {
    var menu = [];
    function walk(routes) {
        for (let r of routes) {
            if (r.meta && r.meta.menu) {
                for (let m of r.meta.menu) {
                    const entry = { label: m.label, icon: m.icon };
                    if (r.name) /* require a named route */ {
                        entry.route = { name: r.name };
                        if (m.query)
                            entry.route.query = m.query;
                        if (m.params)
                            entry.route.params = m.params;
                    }
                    menu.push(entry);
                }
            }
            if (r.children)
                walk(r.children)
        }
    }
    walk(this.getRoutes());
    return menu;
}

const router = new VueRouter({
    routes,
});

export default router;

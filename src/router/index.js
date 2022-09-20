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
                    search: [
                        {
                            label: 'Inventory devices',
                            icon: 'mdi-grid',
                            route: {
                                query: {
                                    inventoryMode: 'devices',
                                },
                            },
                        },
                        {
                            label: 'Inventory FDB',
                            icon: 'mdi-grid',
                            route: {
                                query: {
                                    inventoryMode: 'fdb',
                                },
                            },
                        },
                    ],
                    hasTimeline: true,
                    buildHistory: (r) => {
                        const inventoryMode = r.query.inventoryMode;
                        const search = r.query.search;
                        if (!inventoryMode || !search)
                            return false;
                        return {
                            label: `${inventoryMode} / ${search}`,
                            entry: { path: r.path, query: { inventoryMode, search } },
                        };
                    },
                },
                children: [
                    {
                        path: '/main/inventory/host/:id',
                        name: 'ViewHost',
                        component: ViewHost,
                        meta: {
                            hasTimeline: true,
                            buildBookmark: (r) => {
                                const id = r.params.id;
                                if (!id)
                                    return false;
                                let label = document.querySelector('#device-name');
                                label = (label && label.textContent) ? label.textContent : `id ${id}`;
                                return {
                                    label: `host / ${label}`,
                                    entry: { path: r.path, params: { id } }
                                };
                            },
                        },
                    },
                    {
                        path: '/main/inventory/switch/:id',
                        name: 'ViewSwitch',
                        component: ViewSwitch,
                        meta: {
                            hasTimeline: true,
                            buildBookmark: (r) => {
                                const id = r.params.id;
                                if (!id)
                                    return false;
                                let label = document.querySelector('#device-name');
                                label = (label && label.textContent) ? label.textContent : `id ${id}`;
                                return {
                                    label: `switch / ${label}`,
                                    entry: { path: r.path, params: { id } }
                                };
                            },
                        },
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
                    hasTimeline: true,
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
                    search: [
                        {
                            label: 'OUI lookup',
                            icon: 'mdi-help-network-outline',
                            empty: false,
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

VueRouter.prototype.getMenu = function (metaKey = 'menu') {
    var menu = [];
    function walk(routes) {
        for (let r of routes) {
            if (r.meta && r.meta[metaKey]) {
                for (let m of r.meta[metaKey]) {
                    /* Keep the route object only if there is a name property.
                     * Be aware this edits the meta object inplace but it does
                     * not matter, at least for now. */
                    if (!m.route?.name && r.name) {
                        m.route ??= {};
                        m.route.name = r.name;
                    }
                    if (!m.route?.name)
                        delete m.route;
                    menu.push(m);
                }
            }
            if (r.children)
                walk(r.children)
        }
    }
    walk(this.getRoutes());
    return menu;
}

VueRouter.prototype.getSearchMenu = function () {
    return this.getMenu('search');
}

const router = new VueRouter({
    routes,
});

export default router;

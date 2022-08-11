import Vue from 'vue';
import VueRouter from 'vue-router';

import ViewEntityPicker from '@/views/ViewEntityPicker.vue';
import ViewFdb from '@/views/ViewFdb.vue';
import ViewHost from '@/views/ViewHost.vue';
import ViewInventory from '@/views/ViewInventory.vue';
import ViewMain from '@/views/ViewMain.vue';
import ViewOui from '@/views/ViewOui.vue';
import ViewSwitch from '@/views/ViewSwitch.vue';
import ViewVlanMatrix from '@/views/ViewVlanMatrix.vue';

const RouterView = { render: (h) => h('router-view') };

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
                /* No name, there is a default child route. */
                path: '/main/inventory',
                component: RouterView,
                meta: {
                    /* Used by SearchMenu when it finds the best search menu
                     * entry to preselect. Instruct the SearchMenu to assume
                     * route name ViewInventory when processing this unnamed
                     * route from the $route.matched array. */
                    assumeRouteName: 'ViewInventory',
                },
                children: [
                    {
                        /* Default child route. Path is either empty or has the
                         * same value than the parent. Here the 2nd option is
                         * used otherwise vue-router appends a forward slash to
                         * the path visible in the browser. */
                        path: '/main/inventory',
                        name: 'ViewInventory',
                        component: ViewInventory,
                        meta: {
                            menu: [
                                {
                                    label: 'Inventory',
                                    icon: 'mdi-book-open-page-variant-outline',
                                },
                            ],
                            search: [
                                {
                                    label: 'Inventory',
                                    icon: 'mdi-book-open-page-variant-outline',
                                },
                            ],
                            hasTimeline: true,
                            buildHistory: (r) => {
                                if (!r.query.search)
                                    return false;
                                return {
                                    label: `devices / ${r.query.search}`,
                                    entry: { path: r.path, query: { search: r.query.search } },
                                };
                            },
                        },
                    },

                    /* As implemented at the moment, it is important to keep
                     * host and switch routes under /main/inventory, otherwise
                     * the inventory menu entry will not be active on these. */
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
                path: '/main/fdb',
                name: 'ViewFdb',
                component: ViewFdb,
                meta: {
                    menu: [
                        {
                            label: 'FDB',
                            icon: 'mdi-database-arrow-right-outline',
                        },
                    ],
                    search: [
                        {
                            label: 'FDB',
                            icon: 'mdi-database-arrow-right-outline',
                            empty: false,
                        },
                    ],
                    hasTimeline: true,
                    buildHistory: (r) => {
                        if (!r.query.search)
                            return false;
                        return {
                            label: `fdb / ${r.query.search}`,
                            entry: { path: r.path, query: { search: r.query.search } },
                        };
                    },
                },
            },
            {
                path: '/main/vlan-matrix',
                name: 'ViewVlanMatrix',
                component: ViewVlanMatrix,
                meta: {
                    menu: [
                        {
                            label: 'VLAN matrix',
                            icon: 'mdi-table-pivot',
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

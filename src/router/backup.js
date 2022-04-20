import ViewBackupDetail from '@/views/ViewBackupDetail.vue';
import ViewBackupIndex from '@/views/ViewBackupIndex.vue';

const RouterView = { render: (h) => h('router-view') };

export default [
    {
        /* No name, there is a default child route. */
        path: '/main/backup',
        component: RouterView,
        meta: {
            /* Described in route for path /main/inventory */
            assumeRouteName: 'ViewBackupIndex',
        },
        children: [
            {
                path: '/main/backup',
                name: 'ViewBackupIndex',
                component: ViewBackupIndex,
                meta: {
                    menu: [
                        {
                            label: 'Backups',
                            icon: 'mdi-history',
                        },
                    ],
                    search: [
                        {
                            label: 'Backups',
                            icon: 'mdi-history',
                        },
                    ],
                    buildHistory: (r) => {
                        if (!r.query.search)
                            return false;
                        return {
                            label: `backups / ${r.query.search}`,
                            entry: { path: r.path, query: { search: r.query.search } },
                        };
                    },
                },
            },
            {
                path: '/main/backup/device/:name/:id?',
                name: 'ViewBackupDetail',
                component: ViewBackupDetail,
            },
        ],
    },
];

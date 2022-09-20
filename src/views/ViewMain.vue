<template>
    <div>
        <!-- ================== NAV BAR ============== -->
        <v-app-bar id="navbar" height="48" app elevation="0" color="#ffffff">
            <v-app-bar-nav-icon
                v-if="$vuetify.breakpoint.mdAndDown"
                @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
            <v-col cols="9" sm="5" md="4" lg="4" xl="5" class="pl-0 d-inline-flex">
                <v-text-field
                    label="Search..."
                    placeholder="Search..."
                    v-model="search"
                    @keyup="handleSearchChange()"
                    solo
                    dense
                    flat
                    background-color="#e8e8e8d6"
                    prepend-inner-icon="mdi-magnify"
                    :hide-details="true"
                    clearable
                    @click:clear="clearSearch"
                    @mouseup.middle="onClickMouseMiddle(search)"
                    @keyup.enter="redirectToUpdateSearch()"></v-text-field>
                <v-btn icon small @click="toggleKeepSearch" class="mt-1 ml-1" title="keep / disable your search">
                    <v-icon class="pt-1">
                        {{ keepSearch ? 'mdi-pin' : 'mdi-pin-off' }}
                    </v-icon>
                </v-btn>
            </v-col>
            <v-col cols="12" sm="3" md="4" lg="3" xl="4" class="d-flex justify-end">
                <div v-if="$route.name === 'ViewInventory'" class="pt-2 rounded select-inventory-mode">
                    <v-checkbox
                        v-for="(mode, modeIndex) in inventoryModes"
                        :key="modeIndex"
                        v-model="inventoryMode"
                        :label="mode"
                        :value="mode"
                        hide-details=""
                        :ripple="false"
                        tile
                        class="px-3 font-weight-light"></v-checkbox>
                </div>
            </v-col>

            <v-col cols="12" sm="3" md="3" lg="4" xl="2" class="d-flex">
                <v-autocomplete
                    class="select-entity-menu"
                    :items="storeEntities"
                    v-model="selectedEntity"
                    label="Select Entity"
                    placeholder="Select Entity"
                    solo
                    dense
                    hide-details=""
                    flat
                    @change="handleEntityPick()"
                    background-color="#e8e8e8d6"
                    prepend-inner-icon="mdi-server-network"></v-autocomplete>
                <v-btn icon small @click="setSavedQueries('bookmarks')" class="mt-1 ml-1" title="Add to Favorites">
                    <v-icon> mdi-bookmark </v-icon>
                </v-btn>
            </v-col>

            <v-spacer></v-spacer>
            <v-col cols="1" sm="1" md="1" lg="1" xl="1" class="d-flex justify-end">
                <v-menu open-on-hover bottom> </v-menu>
                <v-avatar color="light">
                    <v-icon size="30"> mdi-account-circle </v-icon>
                </v-avatar>
            </v-col>
        </v-app-bar>

        <!-- ================== SIDE BAR ============== -->
        <v-navigation-drawer class="aside-navigation" app v-model="drawer">
            <v-toolbar-title>
                <router-link to="/">
                    <img
                        class="py-1 pl-4 d-flex justify-start align-center"
                        height="40"
                        src="assets/images/zenetys-fg-black-bg-full-transparent_LD.png"
                        alt="" />
                </router-link>
            </v-toolbar-title>
            <v-list class="pt-0 mt-0">
                <div v-for="(sectionLink, linkIndex) in menuSide" :key="linkIndex" class="menu">
                    <v-list-item
                        v-if="!sectionLink.subMenus"
                        :to="getNavLinkFullRoute(sectionLink.route)"
                        :disabled="!sectionLink.route"
                        dense
                    >
                        <v-list-item-action class="mr-4">
                            <v-icon size="20">{{ sectionLink.icon }}</v-icon>
                        </v-list-item-action>
                        <v-list-item-title v-text="sectionLink.name" />
                    </v-list-item>
                </div>
            </v-list>
            <v-spacer></v-spacer>
            <v-list dense class="mt-5 mb-2">
                <p class="ml-5 mb-1 font-weight-light">Recent queries</p>
                <v-divider></v-divider>
                <v-list color="" class="mt-0" v-if="recentQueries.length > 0">
                    <v-list-item
                        v-for="(query, queryIndex) in recentQueries"
                        :key="queryIndex"
                        active-class="black"
                        class="list-item">
                        <v-list-item-icon class="mr-0 align-start item-icon">
                            <v-icon size="14">mdi-history</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            <v-list-item-title
                                @click="loadRecentQuery(query)"
                                class="font-weight-regular"
                                :title="getHistoryQueryText(query)"
                                v-text="getHistoryQueryText(query)"></v-list-item-title>
                        </v-list-item-content>
                        <v-icon
                            @click="removeSavedQuery('recent-queries', query)"
                            size="14"
                            class="list-item-remove-icon algin-end justify-end"
                            >mdi-close</v-icon
                        >
                    </v-list-item>
                </v-list>
                <span v-else class="ml-5 caption"> Empty list </span>
            </v-list>

            <v-list dense>
                <p class="ml-5 mb-1 font-weight-light">Bookmarks</p>
                <v-divider></v-divider>
                <v-list color="" class="mt-0" v-if="bookMarks.length > 0">
                    <v-list-item v-for="(bookmark, bookmarkIndex) in bookMarks" :key="bookmarkIndex" class="list-item">
                        <v-list-item-icon class="mr-0 align-start item-icon">
                            <v-icon size="14">mdi-bookmark-outline</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content @click="loadRecentQuery(bookmark)">
                            <v-list-item-title
                                class="font-weight-regular"
                                :title="getBookmarksQueryText(bookmark)"
                                v-text="getBookmarksQueryText(bookmark)"></v-list-item-title>
                        </v-list-item-content>
                        <v-icon
                            @click="removeSavedQuery('bookmarks', bookmark)"
                            size="14"
                            class="list-item-remove-icon algin-end justify-end"
                            >mdi-close</v-icon
                        >
                    </v-list-item>
                </v-list>
                <span v-else class="ml-5 caption"> Empty list </span>
            </v-list>
        </v-navigation-drawer>

        <!-- ================== MAIN CONTENT =========== -->
        <v-row>
            <v-col cols="12">
                <router-view class="mx-4 mt-4"></router-view>
            </v-col>
        </v-row>

        <v-bottom-navigation id="bottombar" fixed hide-on-scroll grow height="" :style="this.bottomBarStyle">
            <v-col cols="12">
                <v-card>
                    <TimeLine class="bottom-timeline" />
                </v-card>
            </v-col>
        </v-bottom-navigation>
    </div>
</template>

<!-- FIXME: check/remove, add scoped -->
<style lang="scss" scoped>
.v-navigation-drawer__border {
    display: none;
}

::v-deep {
    .v-navigation-drawer__content {
        margin-top: 47px;
        position: relative;
        border-top: solid 1px rgba(0, 0, 0, 0.12);
    }

    .v-navigation-drawer__border {
        top: 47px;
    }

    .v-toolbar__title {
        margin-top: -44px;
        position: fixed;
    }
}

.menu .v-list-item--disabled .v-list-item__action {
    opacity: 0.38;
}

.list-item {
    height: 20px;
    min-height: 20px !important;
    cursor: pointer;

    .list-item-remove-icon {
        visibility: hidden;
    }

    &:hover {
        background-color: #f7f7f7;
        .list-item-remove-icon {
            visibility: visible;
        }
    }
}

.select-entity-menu {
    z-index: 10;
}

header {
    border-bottom: solid 1px rgba(0, 0, 0, 0.12) !important;
}

.select-inventory-mode {
    display: flex;
    background-color: #e8e8e8d6;
    height: 38px;
}

.bottom-timeline {
    height: 80px;
}

.aside-navigation {
    z-index: 10;

    .item-icon {
        margin-top: 2px !important;
    }
}

a {
    text-decoration: none;
}
</style>

<script>
import TimeLine from '@/components/TimeLine.vue';

export default {
    name: 'Home',
    components: {
        TimeLine,
    },
    data() {
        return {
            inventoryModes: ['devices', 'fdb'],
            defaultInventoryMode: 'devices',
            drawer: true,
            searchUpdateTimeOut: 500,
            searchTimeOutId: null,
            keepSearch: true,
            menuSide: [
                {
                    name: 'Inventory',
                    icon: 'mdi-grid',
                    route: { name: 'ViewInventory' },
                },
                {
                    name: 'VLAN matrix',
                    icon: 'mdi-table',
                    route: { name: 'ViewVlanMatrix' },
                },
                {
                    name: 'L2 schema',
                    icon: 'mdi-graph',
                },
                {
                    name: 'OUI lookup',
                    icon: 'mdi-help-network-outline',
                    route: { name: 'ViewOui' },
                },
            ],
            recentQueries: [],
            bookMarks: [],
            entityDatabases: [],
            selectedEntity: null,
            search: '',
            inventoryMode: 'devices',
        };
    },
    computed: {
        storeEntities() {
            return this.$store.getEntities();
        },
        routeName() {
            return this.$route.name;
        },
        routeInventoryMode() {
            return this.$route.query.inventoryMode;
        },
        apiStateParams() {
            return {
                entity: this.$route.query.entity,
                database: this.$route.query.db,
                search: this.$route.query.search,
            };
        },
        storeEntityDatabases: {
            get() {
                return this.$store.getEntityDatabases();
            },
            set(newDatabases) {
                this.$store.setEntityDatabases(newDatabases);
            },
        },
        /**
         * Dynamic bottom bar style depending on the current breakpoint
         */
        bottomBarStyle() {
            return this.$vuetify.breakpoint.mdAndDown
                ? 'padding-left:5px;padding-right:5px;'
                : 'padding-left:261px;padding-right:5px;';
        },
    },
    methods: {
        /**
         * Run a new search query on a middlemouse click (paste) in the search input
         */
        onClickMouseMiddle() {
            clearTimeout(this.searchTimeOutId);
            setTimeout(() => this.redirectToUpdateSearch(), 100);
        },
        /**
         * Set the drawer value depending on the current breakpoint
         */
        drawerValueByBreakpoint() {
            this.drawer = !this.$vuetify.breakpoint.mdAndDown;
        },
        /**
         * Toggle the persistence of the search query upon navigation
         */
        toggleKeepSearch() {
            this.keepSearch = !this.keepSearch;
        },
        /**
         * Empties the search query
         */
        clearSearch() {
            this.search = '';
        },
        /**
         * Generate a label for a recent search query
         * @param {object} query - The query object
         * @return {string} The generated recent query label
         */
        getHistoryQueryText(query) {
            return query.query.inventoryMode + ' / ' + query.query.search;
        },
        /**
         * Generate a label for a bookmark
         * @param {object} bookmark - The bookmark object
         * @return {string} The generated bookmarked label
         */
        getBookmarksQueryText(bookmark) {
            return (
                bookmark.query.inventoryMode +
                (bookmark.query.search ? ' / ' + bookmark.query.search : '') +
                (bookmark.label ? ' / ' + bookmark.label : '')
            );
        },
        /**
         * Navigate to a recent search query or bookmark.
         * @param {object} query - The query object
         */
        loadRecentQuery(query) {
            if (query.url === '/main/inventory' && query.query.inventoryMode) {
                this.inventoryMode = query.query.inventoryMode;
            }

            const resolvedQueryRoute = this.$router.resolve(query.url).route;

            let newRoute = {};
            newRoute.query = {
                db: resolvedQueryRoute.query.db || query.query.db || this.apiStateParams.database,
                search: resolvedQueryRoute.query.search || query.query.search,
                entity: query.query.entity || this.apiStateParams.entity,
                inventoryMode:
                    resolvedQueryRoute.query.inventoryMode || query.query.inventoryMode || this.routeInventoryMode,
            };

            const mode = query.query.inventoryMode;
            switch (mode) {
                case 'devices':
                case 'fdb':
                    newRoute.name = 'ViewInventory';
                    break;
                case 'host':
                case 'switch':
                    newRoute.path = query.url;
                    break;
            }
            this.$router.push(newRoute).catch(() => {});
        },
        /**
         * Fetch recent queries & bookmarks from local storage and filter them
         * If none are found, an empty array is save in storage
         */
        getRecentQueriesAndBookmarks() {
            const rQueries = JSON.parse(localStorage.getItem('recent-queries'));
            const bookmarks = JSON.parse(localStorage.getItem('bookmarks'));

            rQueries
                ? (this.recentQueries = this.filterQueries(rQueries))
                : localStorage.setItem('recent-queries', JSON.stringify([]));

            bookmarks
                ? (this.bookMarks = this.filterQueries(bookmarks))
                : localStorage.setItem('bookmarks', JSON.stringify([]));
        },
        /**
         * Save a new search query or bookmark in local storage and update the view's data
         * @param {string['recent-queries'|'bookmarks']} type - The type of the query to save
         */
        setSavedQueries(type) {
            const queriesFromStorage = JSON.parse(localStorage.getItem(type));

            if (type === 'bookmarks') {
                localStorage.setItem(type, JSON.stringify(this.newBookmark(queriesFromStorage)));
            } else if (type === 'recent-queries') {
                localStorage.setItem(type, JSON.stringify(this.newRecentQuery(queriesFromStorage)));
            }

            this.getRecentQueriesAndBookmarks();
        },
        /**
         * Generate a new recent search query object and add it to the list of entity queries
         * @param {array} recentQueries - The array of current recent queries
         * @return {array} The updated recent queries array
         */
        newRecentQuery(recentQueries) {
            const allQueries = recentQueries;
            const currentEntityQueries = this.filterQueries(recentQueries);
            const newSearchQuery = { ...this.$route.query };
            newSearchQuery.search = this.search;
            newSearchQuery.inventoryMode = this.inventoryMode;

            const newSearch = {
                entity: this.apiStateParams.entity,
                query: newSearchQuery,
                url: '/main/inventory',
                label: document.querySelector('#device-name') ? document.querySelector('#device-name').textContent : '',
                index: new Date().getTime(),
            };

            /* Only save the new query if it doesn't already exist */
            if (
                this.search &&
                !currentEntityQueries.find((query) => {
                    return query.query.search === this.search && query.query.inventoryMode === this.inventoryMode;
                })
            ) {
                /* 5 queries maximum in storage */
                if (currentEntityQueries.length >= 5) {
                    currentEntityQueries.pop();
                }
                currentEntityQueries.push(newSearch);
            }

            return allQueries
                .filter((query) => query.entity !== this.apiStateParams.entity)
                .concat(currentEntityQueries);
        },
        /**
         * Generate a new bookmark object and add it to the list of entity queries
         * @param {array} existingBookmarks - The array of current bookmarks
         * @return {array} The updated bookmarks array
         */
        newBookmark(existingBookmarks) {
            const allQueries = existingBookmarks;
            const currentEntityQueries = this.filterQueries(existingBookmarks);
            const newQuery = {
                entity: this.apiStateParams.entity,
                query: {
                    inventoryMode:
                        this.$route.path === '/main/inventory'
                            ? this.inventoryMode
                            : this.$route.path.includes('switch')
                            ? 'switch'
                            : 'host',
                    search: this.$route.path === '/main/inventory' ? this.search : '',
                },
                url: this.$route.fullPath,
                id: this.$route.params.id,
                label: document.querySelector('#device-name') ? document.querySelector('#device-name').textContent : '',
                index: new Date().getTime(),
            };

            if (
                !currentEntityQueries.find(
                    (q) =>
                        q.url === this.$route.fullPath &&
                        q.id === this.$route.params.id &&
                        q.query.inventoryMode === newQuery.query.inventoryMode
                )
            ) {
                if (currentEntityQueries.length >= 10) {
                    currentEntityQueries.pop();
                }
                currentEntityQueries.push(newQuery);
            }

            return allQueries.filter((el) => el.entity !== this.apiStateParams.entity).concat(currentEntityQueries);
        },
        /**
         * Delete a recent query from history
         * @param {string} type - The type of the query to delete
         * @param {object} query - The query object to delete
         */
        removeSavedQuery(type, query) {
            const savedQueries = JSON.parse(localStorage.getItem(type));

            savedQueries.splice(
                savedQueries.findIndex((el) => el.index === query.index),
                1
            );

            localStorage.setItem(type, JSON.stringify(savedQueries));
            this.getRecentQueriesAndBookmarks();
        },
        /**
         * Filter the queries array to only keep the ones for the current entity
         * @param {object[]} queries - The array of queries to filter
         * @return {object[]} The filtered queries array
         */
        filterQueries(queries) {
            return queries
                .filter((query) => query.entity === this.apiStateParams.entity)
                .sort((a, b) => b.index - a.index);
        },
        /**
         * @async
         * Fetch all DBs for an entity from the API
         * @param {string} entity - The entity to fetch DBs for
         * @return {array|null} The array of DBs for the current entity
         */
        async fetchDatabasesFromEntity(entity = null) {
            const errorContext = 'Could not fetch databases from entity.';
            /* if no entity is provided, use the currently selected one */
            const url = '/entity/' + (entity || this.apiStateParams.entity) + '/databases';

            return await this.$api.get(url, errorContext);
        },
        /**
         * @async
         * Handle the selected entity from the current route
         * > Fetch DBs from the current entity & store them
         * > Set queries history & bookmarks for this entity
         */
        async handleRouteEntity() {
            /* redirect to the entity-picker if none is set */
            if (!this.apiStateParams.entity) {
                this.$router.replace('/entity-picker');
            } else {
                /* fetch the databases for the current entity */
                this.selectedEntity = this.apiStateParams.entity;
                this.entityDatabases = await this.fetchDatabasesFromEntity();
                this.storeEntityDatabases = this.entityDatabases;
                this.setSavedQueries('recent-queries');
            }
        },
        /**
         * Update the search query param in the route, and redirect
         * @param {boolean} forceInventory - If true, always redirect to the inventory page with the new search
         */
        redirectToUpdateSearch(forceInventory = false) {
            /* Update search history */
            this.setSavedQueries('recent-queries');

            const params = this.$route.params;
            const query = { ...this.$route.query };
            query.search = this.search;

            const redirection = {
                params,
                query,
                name: forceInventory ? 'ViewInventory' : this.routeName,
            };

            if (query.search !== '' || (this.apiStateParams.search && this.apiStateParams.search !== '')) {
                this.$router.push(redirection).catch(() => {});
            } else {
                /* If search was simply reset, replace the current route without redirecting */
                this.$router.replace(redirection).catch(() => {});
            }
        },
        /**
         * Update the url with a new inventory mode
         * @param {boolean} shouldReplace - Whether or not the redirect should be "silent" (url replace)
         */
        redirectToUpdateInventoryMode(shouldReplace = false) {
            const params = this.$route.params;
            const query = { ...this.$route.query };
            query.inventoryMode = this.inventoryMode;
            const redirection = {
                params,
                query,
                name: this.routeName,
            };

            if (shouldReplace) {
                this.$router.replace(redirection).catch(() => {});
            } else {
                this.$router.push(redirection).catch(() => {});
            }
        },
        /**
         * Select the latest available DB from the current entity,
         * and replace the query param in the current route
         * @param {boolean} shouldReplace - If true, replace the current route, otherwise redirect
         */
        selectLastAvailableDb(shouldReplace = false) {
            if (this.entityDatabases?.length > 0) {
                const lastDb = this.entityDatabases[this.entityDatabases.length - 1].id;

                if (lastDb !== this.apiStateParams.database) {
                    const newQuery = { ...this.$route.query };
                    newQuery.db = lastDb;

                    if (shouldReplace) {
                        this.$router.replace({ query: newQuery });
                    } else {
                        this.$router.push({ query: newQuery }).catch(() => {});
                    }
                }
            }
        },
        /**
         * Generate a full navigation link from a partial route
         * @param {object} navRoute - The partial route to generate the link from
         */
        getNavLinkFullRoute(navRoute) {
            if (!navRoute || !navRoute.name) {
                return;
            }

            const newRoute = {
                name: navRoute.name,
                query: this.$route.query,
                params: this.$route.params,
            };
            return newRoute;
        },
        /**
         * Handle the selection of another entity using the select menu :
         * Redirect to inventory if current view is a device view ;
         * Update URL params otherwise
         */
        async handleEntityPick() {
            const newEntityDatabases = await this.fetchDatabasesFromEntity(this.selectedEntity);
            const newLastDb = newEntityDatabases[newEntityDatabases.length - 1].id;
            const newQueryParams = { ...this.$route.query };
            newQueryParams.entity = this.selectedEntity;
            newQueryParams.db = newLastDb;

            if (this.$route.name === 'ViewSwitch' || this.$route.name === 'ViewHost') {
                const inventoryRedirect = {
                    name: 'ViewInventory',
                    query: newQueryParams,
                };
                this.$router.push(inventoryRedirect).catch(() => {});
            } else {
                const redirection = { ...this.$route };
                redirection.query = newQueryParams;
                this.$router.push(redirection).catch(() => {});
            }
        },
        /**
         * Handle a new search being typed in the input
         */
        handleSearchChange() {
            clearTimeout(this.searchTimeOutId);

            this.searchTimeOutId = setTimeout(() => {
                this.redirectToUpdateSearch(true);
            }, this.searchUpdateTimeOut);
        },
    },
    watch: {
        apiStateParams: {
            immediate: true,
            async handler(newParams, oldParams) {
                /* Only handle a new entity from the route if none was set,
                or if it's a different one */
                if (newParams.entity !== oldParams?.entity) {
                    await this.handleRouteEntity();
                }

                if (newParams.database && oldParams?.database && oldParams?.database !== newParams.database) {
                    if (
                        this.entityDatabases?.length > 0 &&
                        !this.entityDatabases?.some((db) => db.id === newParams.database)
                    ) {
                        const shouldReplace = !oldParams.database || oldParams.entity === newParams.entity;
                        this.selectLastAvailableDb(shouldReplace);
                    }
                }

                this.search = newParams.search ?? '';
            },
        },
        routeName: {
            immediate: true,
            handler(newRouteName) {
                if (newRouteName !== 'ViewInventory' && !this.keepSearch) {
                    this.search = '';
                }
            },
        },
        routeInventoryMode: {
            immediate: true,
            handler(newMode) {
                if (this.routeName === 'ViewInventory') {
                    this.inventoryMode = this.inventoryModes.includes(newMode) ? newMode : this.defaultInventoryMode;
                } else {
                    this.inventoryMode = newMode;
                }
            },
        },
        entityDatabases: {
            immediate: true,
            handler(newDatabases) {
                if (newDatabases?.length > 0) {
                    /* Select the appropriate database from the current entity, either the one from the URL, 
                    or the last available one */
                    if (
                        !this.apiStateParams.database ||
                        (this.apiStateParams.database &&
                            !newDatabases?.some((db) => db.id === this.apiStateParams.database))
                    ) {
                        this.selectLastAvailableDb(true);
                    }
                }
            },
        },
        inventoryMode: {
            immediate: true,
            handler(newMode, oldMode) {
                if (oldMode && oldMode !== newMode) {
                    /* If mode has changed, update the query param and redirect */
                    this.redirectToUpdateInventoryMode();
                } else {
                    /* Otherwise, just update the query param (silent redirect) */
                    this.redirectToUpdateInventoryMode(true);
                }
            },
        },
    },
    mounted() {
        this.$nextTick(function () {
            this.drawerValueByBreakpoint();
        });

        this.getRecentQueriesAndBookmarks();
    },
    beforeMount() {
        this.selectedEntity = this.apiStateParams.entity;
        clearTimeout(this.searchTimeOutId);
    },
    beforeUnmount() {
        clearTimeout(this.searchTimeOutId);
    },
};
</script>

<template>
    <div>
        <!-- ================== NAV BAR ============== -->
        <v-app-bar id="navbar" height="48" app elevation="0" color="#ffffff">
            <v-app-bar-nav-icon
                v-if="$vuetify.breakpoint.mdAndDown"
                @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
            <v-col cols="9" sm="4" md="4" lg="4" xl="5" class="pl-0 d-flex align-center">
                <SearchMenu
                    :entries="routerSearchMenu"
                    :value="search"
                    @submit="onSearchMenuSubmit"
                    class="flex-grow-1"
                />
                <v-btn icon small @click="toggleKeepSearch" class="ml-1" title="keep / disable your search">
                    <v-icon class="pt-1">
                        {{ keepSearch ? 'mdi-pin' : 'mdi-pin-off' }}
                    </v-icon>
                </v-btn>
            </v-col>
            <v-col cols="12" sm="4" md="4" lg="3" xl="4" class="d-flex justify-end">
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
            <v-col cols="12" sm="3" md="3" lg="4" xl="2" class="d-flex align-center">
                {{/* ref, :key and @blur: read comments in blur handler */}}
                <v-autocomplete
                    ref="refEntitySelector"
                    :items="storeEntities"
                    :value="selectedEntity"
                    :error="!isSelectedEntityValid"
                    :spellcheck="false"
                    @change="handleEntityPick"
                    :key="forceUpdateEntitySelector"
                    @blur="onEntitySelectorBlur"
                    placeholder="Entity..."
                    prepend-inner-icon="mdi-server-network"
                    dense
                    hide-details
                />
                <v-btn
                    :disabled="!$route.meta.buildBookmark"
                    @click="addBookmark()"
                    title="Add to Favorites"
                    icon small
                    class="mt-1 ml-1"
                >
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
                <v-list-item-group class="menu">
                    <v-list-item
                        v-for="(menuEntry, menuIndex) in routerMenu"
                        :key="menuIndex"
                        :to="getRelativeMenuRoute(menuEntry.route)"
                        :disabled="!menuEntry.route"
                        dense
                    >
                        <v-list-item-action class="mr-4">
                            <v-icon size="20">{{ menuEntry.icon }}</v-icon>
                        </v-list-item-action>
                        <v-list-item-title v-text="menuEntry.label" />
                    </v-list-item>
                </v-list-item-group>
            </v-list>
            <v-spacer></v-spacer>
            <v-list dense class="mt-5 mb-2">
                <p class="ml-5 mb-1 font-weight-light">Recent queries</p>
                <v-divider></v-divider>
                <v-list color="" class="mt-0" v-if="historyEntries && historyEntries.length > 0">
                    <v-list-item
                        v-for="(history, historyIndex) in historyEntries"
                        :key="historyIndex"
                        @click.native="$router.push($utils.deriveRoute(history.entry, $route)).catch(()=>{})"
                        class="list-item"
                    >
                        <v-list-item-icon class="mr-0 align-start item-icon">
                            <v-icon size="14">mdi-history</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            <v-list-item-title
                                :title="history.label"
                                v-text="history.label"
                                class="font-weight-regular"
                            />
                        </v-list-item-content>
                        <v-icon
                            @click.stop="$store.deleteLocalStorageSavedQuery('history', selectedEntity, historyIndex)"
                            size="14"
                            class="list-item-remove-icon"
                            >mdi-close</v-icon
                        >
                    </v-list-item>
                </v-list>
                <span v-else class="ml-5 caption"> Empty list </span>
            </v-list>

            <v-list dense>
                <p class="ml-5 mb-1 font-weight-light">Bookmarks</p>
                <v-divider></v-divider>
                <v-list color="" class="mt-0" v-if="bookmarkEntries && bookmarkEntries.length > 0">
                    <v-list-item
                        v-for="(bookmark, bookmarkIndex) in bookmarkEntries"
                        :key="bookmarkIndex"
                        @click.native="$router.push($utils.deriveRoute(bookmark.entry, $route)).catch(()=>{})"
                        class="list-item"
                    >
                        <v-list-item-icon class="mr-0 align-start item-icon">
                            <v-icon size="14">mdi-bookmark-outline</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            <v-list-item-title
                                :title="bookmark.label"
                                v-text="bookmark.label"
                                class="font-weight-regular"
                            />
                        </v-list-item-content>
                        <v-icon
                            @click.stop="$store.deleteLocalStorageSavedQuery('bookmark', selectedEntity, bookmarkIndex)"
                            size="14"
                            class="list-item-remove-icon"
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

        <v-bottom-navigation
            v-if="this.$route.meta.hasTimeline"
            id="bottombar"
            fixed hide-on-scroll grow height=""
            :style="this.bottomBarStyle"
        >
            <v-col cols="12">
                <v-card>
                    <TimeLine
                        :databases="$store.getEntityDatabases()"
                        :value="$route.query.db"
                        @click="onTimeLineClick"
                        class="bottom-timeline"
                    />
                </v-card>
            </v-col>
        </v-bottom-navigation>
    </div>
</template>

<!-- FIXME: check/remove, add scoped -->
<style lang="scss" scoped>
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

.menu .v-list-item {
    text-decoration: none;
}
.menu .v-list-item--disabled .v-list-item__action {
    opacity: 0.38;
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
    .list-item {
        height: 20px;
        min-height: 20px;
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
        .item-icon {
            margin-top: 2px;
        }
    }
}
</style>

<script>
import SearchMenu from '@/components/SearchMenu.vue';
import TimeLine from '@/components/TimeLine.vue';

export default {
    name: 'ViewMain',
    components: {
        SearchMenu,
        TimeLine,
    },
    data() {
        return {
            inventoryModes: ['devices', 'fdb'],
            defaultInventoryMode: 'devices',
            drawer: true,
            searchUpdateTimeOut: 500,
            keepSearch: true,
            entityDatabases: [],
            selectedEntity: null,
            search: '',
            inventoryMode: 'devices',
            forceUpdateEntitySelector: 0,
        };
    },
    computed: {
        /* Cached menus, they are not meant to change during app life. */
        routerMenu() {
            return this.$router.getMenu();
        },
        routerSearchMenu() {
            return this.$router.getSearchMenu();
        },

        historyEntries() {
            return this.$store.getLocalStorageSavedQuery('history', this.selectedEntity);
        },
        bookmarkEntries() {
            return this.$store.getLocalStorageSavedQuery('bookmark', this.selectedEntity);
        },

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
        /* Validates if the current entity is among the list of available
         * entities. Used to put the entity selector in error state. */
        isSelectedEntityValid() {
            return this.storeEntities.indexOf(this.selectedEntity) > -1;
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
        getRelativeMenuRoute(menuRoute) {
            if (!menuRoute)
                return undefined;
            const relativeRoute = this.$utils.deriveRoute(menuRoute, this.$route);
            /* always clear params */
            delete relativeRoute.params;
            /* keep search depending on the toggle button state */
            if (!this.keepSearch)
                delete relativeRoute.query?.search;
            return relativeRoute;
        },
        addBookmark() {
            if (this.$route.meta.buildBookmark) {
                const savedQuery = this.$route.meta.buildBookmark(this.$route);
                if (savedQuery) {
                    this.$store.addLocalStorageSavedQuery('bookmark', this.$route.query.entity,
                        savedQuery.label, savedQuery.entry);
                }
            }
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
            }
        },
        /**
         * Update the search query param in the route, and redirect
         * @param {boolean} forceInventory - If true, always redirect to the inventory page with the new search
         */
        onSearchMenuSubmit(searchValue, menuEntry) {
            /* Avoid the same entry twice in a row in browser history. */
            const routerFn = this.$route.query.search === searchValue ? 'replace' : 'push';
            /* Let the children handle if there is no change between current
             * and previous values, ignore NavigationDuplicated errors. */
            this.$route.query.search = undefined;
            this.$router[routerFn]({
                name: menuEntry.route.name,
                params: { _fromSearchMenu: true },
                query: { ...this.$route.query, ...menuEntry.route.query, search: searchValue },
            })
            .then((to) => {
                if (to.meta.buildHistory) {
                    const savedQuery = to.meta.buildHistory(to);
                    if (savedQuery) {
                        this.$store.addLocalStorageSavedQuery('history', to.query.entity,
                            savedQuery.label, savedQuery.entry);
                    }
                }
            });
        },
        onTimeLineClick(databaseId) {
            /* Let the children handle if there is no change between current
             * and previous values, ignore NavigationDuplicated errors. */
            this.$route.query.db = undefined;
            /* Trigger database change */
            this.$router.push({ query: { ...this.$route.query, db: databaseId } });
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
         * Handle the selection of another entity using the select menu :
         * Redirect to inventory if current view is a device view ;
         * Update URL params otherwise
         */
        async handleEntityPick(entity) {
            if (!entity) {
                console.log('handleEntityPick change event with no data, ignore');
                return;
            }
            const newEntityDatabases = await this.fetchDatabasesFromEntity(entity);
            const newLastDb = newEntityDatabases[newEntityDatabases.length - 1].id;
            const newQueryParams = { ...this.$route.query };
            newQueryParams.entity = entity;
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
         * Handle on blur of the entity selector. Used to fix an annoying
         * behavior, on blur, after the text input was made empty.
         *
         * When the autocomplete input value is made empty (eg: full manual
         * clear), the component emits a @change event with a null value. If
         * the user looses focus on the input, the current entity is not set
         * back in the selector. It works fine on partial clear/blur, but not
         * on full clear. To fix it, we just force a refresh of the entity
         * selector by updating its :key.
         */
        onEntitySelectorBlur() {
            if (!this.$refs.refEntitySelector.$refs.input.value &&
                this.$refs.refEntitySelector.value) {
                console.log('ViewMain: onEntitySelectorBlur: force update to restore input value');
                this.forceUpdateEntitySelector = Date.now();
            }
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
        this.$nextTick(() => this.drawerValueByBreakpoint());
    },
    beforeMount() {
        this.selectedEntity = this.apiStateParams.entity;
    },
};
</script>

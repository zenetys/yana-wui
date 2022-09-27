<template>
    <div>
        <!-- ================== NAV BAR ============== -->
        <v-app-bar id="navbar" height="48" app elevation="0" color="#ffffff">
            <v-app-bar-nav-icon
                v-if="$vuetify.breakpoint.mdAndDown"
                @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
            <v-col cols="9" sm="4" md="4" lg="4" xl="5" class="pl-0 d-flex align-center">
                <SearchMenu
                    ref="refSearchMenu"
                    :entries="routerSearchMenu"
                    :value="$route.query.search"
                    shortcutText="Ctrl+Shift+F"
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
            </v-col>

            <v-col cols="12" sm="3" md="3" lg="4" xl="2" class="d-flex align-center">
                {{/* ref, :key and @blur: read comments in blur handler */}}
                <v-autocomplete
                    ref="refEntitySelector"
                    :items="storeEntities"
                    :value="observableRouteEntity"
                    :error="!isSelectedEntityValid"
                    :spellcheck="false"
                    :key="forceUpdateEntitySelector"
                    @blur="onEntitySelectorBlur"
                    @change="onEntitySelectorChange"
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
                            @click.stop="$store.deleteLocalStorageSavedQuery('history', observableRouteEntity, historyIndex)"
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
                            @click.stop="$store.deleteLocalStorageSavedQuery('bookmark', observableRouteEntity, bookmarkIndex)"
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
            :style="this.bottomBarStyle"
            fixed hide-on-scroll grow
            height=""
            class="elevation-0"
        >
            <v-col cols="12">
                <v-card class="elevation-0">
                    <TimeLine
                        :databases="entityDatabases"
                        :value="$route.query.db"
                        @click="onTimeLineClick"
                        class="bottom-timeline"
                    />
                </v-card>
            </v-col>
        </v-bottom-navigation>

        <v-overlay
            :value="entityTransitionInProgress"
            color="#ffffff"
            opacity="0.5"
            z-index="6"
        />
    </div>
</template>

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

.v-bottom-navigation {
    border-top: 1px solid #00000008;
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
            drawer: true,
            keepSearch: true,
            entityDatabases: undefined,
            entityTransitionInProgress: false,
            forceUpdateEntitySelector: 0,

            /* Observable entity query parameter that can be used instead of
             * $route.query.entity. On navigation, vue-router creates a new
             * $route.query object and vue re-evaluates computed properties
             * depending on $route.query.entity, even if its value does not
             * change. The value of ($data.)observableRouteEntity is updated in
             * the watch on $route.query.
             * To avoid unnecessary refreshes in the UI, it should be preferred
             * over $route.query.entity in the template and in computed props.
             * Tests showed it would not be necessary to always use it, eg.
             * properties passed to components from the template. However, to
             * avoid confusion we stick to always use it instead of
             * $route.query.entity. */
            observableRouteEntity: undefined,
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

        /* Reactive bookmark and search history lists for the current entity.
         * The array returned from the store is observable. */
        historyEntries() {
            return this.$store.getLocalStorageSavedQuery('history',
                this.observableRouteEntity);
        },
        bookmarkEntries() {
            return this.$store.getLocalStorageSavedQuery('bookmark',
                this.observableRouteEntity);
        },

        /* Reactive list of available entities. The array returned from the
         * store is observable, yet it is not ment to change during app life. */
        storeEntities() {
            return this.$store.getEntities();
        },
        /* Validates if the current entity is among the list of available
         * entities. Used to put the entity selector in error state. */
        isSelectedEntityValid() {
            return this.storeEntities.indexOf(this.observableRouteEntity) > -1;
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
                    this.$store.addLocalStorageSavedQuery('bookmark', this.observableRouteEntity,
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
        onCtrlShiftF() {
            console.log('ViewMain: onCtrlShiftF: focusing search menu');
            this.$refs.refSearchMenu.focus();
        },
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
         * Handler on entity change from the entity selector.
         * Triggers update of the query parameters (redirection): entity, but
         * also database, which gets removed to provoke selection of the default
         * database for the new entity.
         */
        onEntitySelectorChange(entity) {
            if (!entity) {
                /* Strange behavior when the input is cleared, a @change event
                 * is triggered with a null value, ignore it. */
                console.log('ViewMain: onEntitySelectorChange: skip, no data, entity = ', entity);
                return;
            }
            this.$router.push({ query: { ...this.$route.query, entity: entity, db: undefined } });
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
        /**
         * Watch handler on the route query to handle changes of context in
         * the application, ie. current entity and database.
         *
         * In the context of a Vue application, avoid using async/await,
         * especially with immediate watches on $route.query and when there
         * are redirections in play updating the query parameters.
         *
         * Keep in mind that immediate watches are run at created() time
         * of the component, not at mounted time. In case of async handlers,
         * you may await in the function, but Vue - the caller - does not
         * await the promise returned implicitly by an async function. Unless
         * you just know what you do, this could lead to strange behaviors.
         *
         * Rules to stick with are:
         * - User interaction updates the query parameters, on which we react
         *   to update the context and data.
         * - Just avoid async/await on watches and computed, unless you know
         *   what you do!
         *
         * This route query handler has two purposes:
         * - Handle an entity change: fetch its databases, redirect to the last
         *   available, unless one is explicitly requested, which is the case
         *   when a proper URL is copied/pasted (link sharing).
         * - If for some reason there is no database parameter, redirect to the
         *   last available, unless... an entity transition is already in
         *   progress.
         */
        '$route.query': {
            immediate: true,
            handler(cur, prev) {
                const id = Date.now(); /* for debug logs */
                console.log(`ViewMain: watch/$route.query[${id}]: cur =`, cur, ', prev =', prev);
                this.observableRouteEntity = cur.entity; /* update, see doc in $data */

                if (this.$utils.eq(cur, prev)) {
                    console.log(`ViewMain: watch/$route.query[${id}]: no change`);
                    return;
                }

                /* code reused twice bellow */
                const redirectToLastDbIfPossible = (logMessage) => {
                    console.log(`ViewMain: watch/$route.query[${id}]: ${logMessage}`);

                    if (this.entityDatabases && this.entityDatabases.length > 0) {
                        this.$router.replace({ query: { ...this.$route.query,
                            db: this.entityDatabases.slice(-1)[0].id } });
                    }
                    else {
                        this.$ev.$emit('warning', 'No database available',
                            'CANNOT select a database because there is none available!');
                    }
                }

                /* entity transition */
                if (cur.entity !== prev?.entity) {
                    console.log(`ViewMain: watch/$route.query[${id}]: entity change`);
                    this.$ev.$emit('message', { type: 'info', title: 'Entity transition',
                        text: 'Entering entity ' + cur.entity, duration: 2000 });

                    this.entityTransitionInProgress = true;
                    this.$api.axiosData(
                        '/entity/' + encodeURIComponent(cur.entity) + '/databases',
                        'Failed to fetch entity databases'
                    )
                    .then((availableDbs) => {
                        this.entityDatabases = availableDbs;
                        if (!cur.db)
                            redirectToLastDbIfPossible('redirect to last database following entity change');
                    })
                    .catch(() => { /* notified by axios interceptor */ })
                    .finally(() => { this.entityTransitionInProgress = false; });
                }
                /* default database redirect */
                else if (!cur.db && !this.entityTransitionInProgress)
                    redirectToLastDbIfPossible('no database parameter, redirect to last available');
            },
        },
    },
    mounted() {
        this.$nextTick(() => this.drawerValueByBreakpoint());
        this.$ev.$on('ctrl-shift-f', this.onCtrlShiftF);
    },
};
</script>

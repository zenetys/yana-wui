<template>
  <div>
    <!-- ================== NAV BAR ============== -->
    <v-app-bar id="navbar" height="48" app class="" elevation="0" color="#ffffff">
      <v-app-bar-nav-icon v-if="$vuetify.breakpoint.mdAndDown" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
        <v-col cols="9" sm="5" md="4" lg="4" xl="5" class="pl-0 d-inline-flex">
          <v-text-field
              label="Search..."
              placeholder="Search..."
              v-model="search"
              solo
              dense
              flat
              background-color="#e8e8e8d6"
              prepend-inner-icon="mdi-magnify"
              :hide-details="true"
              clearable
              @click:clear="clearSearch"
              @mouseup.middle="onClickMouseMiddle(search)"
              @keyup="updateStoreSearchOnAnyKeyUp(search)"
              @keyup.enter="updateStoreSearchOnEnterPress(search)"
          ></v-text-field>
          <v-btn icon small @click="updateKeepSearch" class="mt-1 ml-1" title="keep / disable your search">
            <v-icon class="pt-1">
              {{keepSearch ? 'mdi-pin' : 'mdi-pin-off'}}
            </v-icon>
          </v-btn>
        </v-col>
        <v-col cols="12" sm="3" md="4" lg="3" xl="4" class="d-flex justify-end">
          <div v-if="this.$route.path=='/main/inventory'" class="pt-2 rounded select_inventory_mode">
            <v-checkbox
              v-for="(item, index) in inventoryModes" :key="index"
              v-model="storeInventoryMode"
              :label="item"
              :value="item"
              hide-details=""
              :ripple="false"
              tile
              class="px-3 font-weight-light"
            ></v-checkbox>
          </div>
        </v-col>

        <v-col cols="12" sm="3" md="3" lg="4" xl="2" class="d-flex">
          <v-autocomplete
              class="choose-entity-menu"
              :items="storeEntities"
              v-model="storeEntity"
              label="Chose Entity"
              placeholder="Chose Entity"
              solo
              dense
              hide-details=""
              flat
              background-color="#e8e8e8d6"
              prepend-inner-icon="mdi-server-network"
          ></v-autocomplete>
          <v-btn icon small @click="setBookmarks" class="mt-1 ml-1" title="Add to favorite">
            <v-icon class="">
              mdi-bookmark
            </v-icon>
          </v-btn>
        </v-col>

        <v-spacer></v-spacer>
        <v-col cols="1" sm="1" md="1" lg="1" xl="1" class="d-flex justify-end">
          <v-menu open-on-hover bottom>
          </v-menu>
          <v-avatar color="light">
            <v-icon size="30">
              mdi-account-circle
            </v-icon>
          </v-avatar>
        </v-col>
    </v-app-bar>

    <!-- ================== SIDE BAR ============== -->
    <v-navigation-drawer
        class="aside-navigation"
        app
        v-model="drawer"
      >
        <v-toolbar-title class="">
          <router-link to="/">
            <img class="py-1 pl-4 d-flex justify-start align-center" height="40" src="../assets/images/zenetys-fg-black-bg-full-transparent_LD.png" alt="">
          </router-link>
        </v-toolbar-title>
        <v-list class="pt-0 mt-0">
          <div v-for="(link, i) in menuSide" :key="i">
              <v-list-item
                  v-if="!link.subMenus"
                  :to="link.url"
                  active-class="deep-cyan--text text--accent-4"
                  class="v-list-item"
                  dense
                  :style="link.url ? '' : 'opacity:0.5'"
              >
                  <v-list-item-action class="mr-4">
                      <v-icon size="20">{{ link.icon }}</v-icon>
                  </v-list-item-action>
                  <v-list-item-title v-text="link.name" />
              </v-list-item>
          </div>
        </v-list>
        <v-spacer></v-spacer>
        <v-list dense class="mt-5 mb-2">
          <p class="ml-5 mb-1 font-weight-light">Recent queries</p>
          <v-divider></v-divider>
          <v-list
            color=""
            class="mt-0"
            v-if="recentQueries.length>0"
          >
            <v-list-item
              v-for="(item, i) in recentQueries"
              :key="i"
              active-class="black"
              class="list-item"
            >
              <v-list-item-icon class="mr-0 align-start item-icon">
                <v-icon size="14" class="">mdi-history</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title @click="loadRecentQuery(item)" class="font-weight-regular" :title="item.query.inventoryMode+' / '+item.query.search" v-text="item.query.inventoryMode+' / '+item.query.search"></v-list-item-title>
              </v-list-item-content>
              <v-icon @click="removeRecentQuery(item)" size="14" class="list-item-remove-icon algin-end justify-end">mdi-close</v-icon>
            </v-list-item>
          </v-list>
          <span v-else class="ml-5 caption">
            Empty list
          </span>
        </v-list>

        <v-list dense>
          <p class="ml-5 mb-1 font-weight-light">Bookmarks</p>
          <v-divider></v-divider>
          <v-list
            color=""
            class="mt-0"
            v-if="bookMarks.length>0"
          >
            <v-list-item
              v-for="(item, i) in bookMarks"
              :key="i"
              class="list-item"
            >
              <v-list-item-icon class="mr-0 align-start item-icon">
                <v-icon size="14">mdi-bookmark-outline</v-icon>
              </v-list-item-icon>
              <v-list-item-content @click="loadRecentQuery(item)">
                <v-list-item-title class="font-weight-regular" :title="item.query.inventoryMode + (item.query.search ? ' / '+item.query.search : '') + (item.label ? ' / '+item.label : '')" v-text="item.query.inventoryMode + (item.query.search ? ' / '+item.query.search : '') + (item.label ? ' / '+item.label : '')"></v-list-item-title>
              </v-list-item-content>
              <v-icon @click="removeBookmark(item)" size="14" class="list-item-remove-icon algin-end justify-end">mdi-close</v-icon>
            </v-list-item>
          </v-list>
          <span v-else class="ml-5 caption">
            Empty list
          </span>
        </v-list>
    </v-navigation-drawer>

    <!-- ================== MAIN CONTENT =========== -->
    <v-row>
      <v-col cols="12">
        <router-view class="mx-4 mt-4"></router-view>
        <Message/>
      </v-col>
    </v-row>

    <v-bottom-navigation id="bottombar" fixed hide-on-scroll grow height="" :style="this.bottomBarStyle()">
          <v-col cols="12" class="">
            <v-card>
              <TimeLine :key="timeLineKey" @error="onErrorOccurs" class="bottom_timeline"/>
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

::v-deep .v-navigation-drawer__content {
  margin-top: 47px;
  position: relative;
  border-top: solid 1px rgba(0,0,0,.12);
}

::v-deep .v-navigation-drawer__border {
  top: 47px;
}

::v-deep .v-toolbar__title {
  margin-top: -44px;
  position: fixed;
}

.list-item {
  height:20px;
  min-height:20px !important;
  cursor: pointer;
}

.list-item .list-item-remove-icon {
  visibility: hidden;
}

.list-item:hover {
  background-color: #f7f7f7;
}

.list-item:hover .list-item-remove-icon {
  visibility: visible;
}

.choose-entity-menu {
  z-index: 10;
}

header {
  border-bottom: solid 1px rgba(0,0,0,.12) !important;
}

.select_inventory_mode {
  display:flex;
  background-color:#e8e8e8d6;
  height:38px;
}

.bottom_timeline {
  height:80px;
}

.aside-navigation {
    // box-shadow: 0 2px 10px 0 rgb(94 86 105 / 10%);
    z-index: 10;
}

a {
  text-decoration: none;
}

.item-icon {
  margin-top: 2px !important;
}
</style>

<script>
import { mapActions, mapGetters } from 'vuex';
import TimeLine from '@/components/TimeLine.vue';
import Message from '@/components/Message.vue';
import * as queries from "@/plugins/queries";

export default {
    name: 'Home',
    components: {
        TimeLine,
        Message,
    },
    data() {
        return {
            inventoryModes: ['devices', 'fdb' ],
            defaultInventoryMode: 'devices',
            search: '',
            drawer: true,
            timeLineKey: 0,
            searchUpdateTimeOut: 500,
            searchTimeOutId: 0,
            keepSearch: true,
            menuSide: [
                {
                    "name": "Inventory",
                    "url": "/main/inventory",
                    "icon": "mdi-grid",
                },
                {
                    "name": "VLAN matrix",
                    "url": "/main/vlan-matrix",
                    "icon": "mdi-table",
                },
                {
                    "name": "L2 schema",
                    "icon": "mdi-graph",
                },
                {
                    "name": "OUI lookup",
                    "url": "/main/oui",
                    "icon": "mdi-help-network-outline",
                },
            ],
            recentQueries: [],
            bookMarks: [],
        }
    },
    computed: {
        ...mapGetters([
            'storeEntities',
        ]),
        /* like mapGetters + mapActions to be able to use v-model */
        storeEntity: {
            get() { return this.$store.getters.storeEntity },
            set(v) { this.$store.commit('EDIT_STORE_ENTITY', v) },
        },
        /* like mapGetters + mapActions to be able to use v-model */
        storeInventoryMode: {
            get() { return this.$store.getters.storeInventoryMode },
            set(v) { this.$store.commit('EDIT_STORE_INVENTORY_MODE', v) },
        },
        /* like mapGetters + mapActions to be able to use v-model */
        storeSearch: {
            get() { return this.$store.getters.storeSearch },
            set(v) { this.$store.commit('EDIT_STORE_SEARCH', v) },
        }
    },
    methods: {
        onClickMouseMiddle(){
          setTimeout( () => this.updateStoreSearchOnAnyKeyUp(this.search), 100 );
        },
        ...mapActions([
            'updateStoreDatabase',
        ]),
        drawerValueByBreakpoint() {
          this.drawer = !this.$vuetify.breakpoint.mdAndDown;
        },
        bottomBarStyle() {
            return (this.$vuetify.breakpoint.mdAndDown)
                ? 'padding-left:5px;padding-right:5px;'
                : 'padding-left:261px;padding-right:5px;';
        },
        updateStoreSearchOnEnterPress(searchValue) {
          clearTimeout(this.searchTimeOutId);
          this.$store.commit('EDIT_STORE_SEARCH', searchValue);
        },
        updateStoreSearchOnAnyKeyUp(searchValue) {
          clearTimeout(this.searchTimeOutId);
          this.searchTimeOutId = setTimeout(() => {
            this.$store.commit('EDIT_STORE_SEARCH', searchValue);
            this.setRecentQueries();
          }, this.searchUpdateTimeOut);
        },
        onErrorOccurs(payload) {
          this.$store.commit('EDIT_STORE_INFO_MESSAGE', payload);
          console.log(this.$store.state.storeInfoMessage);
        },
        updateKeepSearch() {
          this.keepSearch = !this.keepSearch;
        },
        clearSearch() {
          this.search = '';
          this.$store.commit('EDIT_STORE_SEARCH', this.search);
        },
        loadRecentQuery(item) {
          if (item.url=='/main/inventory') {
            this.storeSearch = this.search = item.query.search;
            this.storeInventoryMode = item.query.inventoryMode;
            this.$router.push('/main/inventory').catch(() => {});
          } else {
            this.storeSearch = this.search = item.query.search;
            this.$router.push(''+item.url).catch(() => {});
          }
        },
        getRecentQueries() {
          let rQueries = JSON.parse(localStorage.getItem('recent-queries'));
          let bookmarks = JSON.parse(localStorage.getItem('bookmarks'));
          rQueries ? this.recentQueries = this.filterQueries(rQueries) : localStorage.setItem('recent-queries', JSON.stringify([]));
          bookmarks ? this.bookMarks = this.filterQueries(bookmarks) : localStorage.setItem('bookmarks', JSON.stringify([]));
        },
        setRecentQueries() {
          let tab = JSON.parse(localStorage.getItem('recent-queries'));
          localStorage.setItem('recent-queries', JSON.stringify(this.newRecentQuery(tab)));
          this.getRecentQueries();
        },
        setBookmarks() {
          let bookmarks = JSON.parse(localStorage.getItem('bookmarks'));
          localStorage.setItem('bookmarks', JSON.stringify(this.newBookmark(bookmarks)));
          this.getRecentQueries();
        },
        newRecentQuery(tab) {
          let allQueries = tab;
          let currentEntityQueries = this.filterQueries(tab);
          let newQuery = {
            "entity": this.storeEntity,
            "query": {
              "inventoryMode": this.storeInventoryMode,
              "search": this.search,
            },
            "url": this.search ? '/main/inventory' : this.$route.path,
            "id": this.$route.params.id,
            "label": document.querySelector('#device-name') ? document.querySelector('#device-name').textContent : '',
            "index": new Date().getTime(),
          };
          if (this.search) {
            if (currentEntityQueries.findIndex(el => el.query.search==this.search && el.query.inventoryMode==this.storeInventoryMode)==-1) {
              if (currentEntityQueries.length>=5) {
                currentEntityQueries.pop();
              }
              currentEntityQueries.push(newQuery);
            }
          }
          return allQueries.filter(el => el.entity != this.storeEntity).concat(currentEntityQueries);
        },
        newBookmark(tab) {
          let allQueries = tab;
          let currentEntityQueries = this.filterQueries(tab);
          let newQuery = {
            "entity": this.storeEntity,
            "query": {
              "inventoryMode": this.$route.path == '/main/inventory' ? this.storeInventoryMode : this.$route.path.includes('switch') ? 'switch' : 'host',
              "search": (this.$route.path=='/main/inventory') ? this.storeSearch : '',
            },
            "url": this.$route.path,
            "id": this.$route.params.id,
            "label": document.querySelector('#device-name') ? document.querySelector('#device-name').textContent : '',
            "index": new Date().getTime(),
          };
          if (currentEntityQueries.findIndex(el => el.url==this.$route.path && el.query.search==this.search && el.id==this.$route.params.id && el.query.inventoryMode==newQuery.query.inventoryMode)==-1) {
            if (currentEntityQueries.length>=10) {
              currentEntityQueries.pop();
            }
            currentEntityQueries.push(newQuery);
          }
          return allQueries.filter(el => el.entity != this.storeEntity).concat(currentEntityQueries);
        },
        removeBookmark(item) {
          let bookmarks = JSON.parse(localStorage.getItem('bookmarks'));
          bookmarks.splice(bookmarks.findIndex(el=>el.index==item.index), 1);
          localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
          this.getRecentQueries()
        },
        removeRecentQuery(item) {
          let rQueries = JSON.parse(localStorage.getItem('recent-queries'));
          rQueries.splice(rQueries.findIndex(el=>el.index==item.index), 1);
          localStorage.setItem('recent-queries', JSON.stringify(rQueries));
          this.getRecentQueries()
        },
        filterQueries(queriesArray) {
          return queriesArray.filter( el => el.entity == this.storeEntity ).sort( (a, b) => b.index - a.index );
        }
     },
    watch: {
        /* FIXME: We could pass and update the api url to TimeLine like
         * for the AutoTable. */
        storeEntity() {
            this.updateStoreDatabase('');
            // Reset search field
            if (!this.keepSearch) {
              this.search = '';
              this.$store.commit('EDIT_STORE_SEARCH', '');
            }
            if (this.$route.name!="ViewVlanMatrix") {
              this.$router.push('/main/inventory').catch(() => {});
            }
            this.timeLineKey++;
            this.setRecentQueries();
        },
        '$route'(to) {
          if(to.path!='/main/inventory') {
            if (!this.keepSearch) {
              this.search = '';
              this.$store.commit('EDIT_STORE_SEARCH', '');
            }
          }
        },
    },
    mounted() {
        if (this.storeEntities.length == 0)
            queries.fetchUpdateStoreEntities();
        this.$nextTick(function () {
            this.drawerValueByBreakpoint();
        });
        this.getRecentQueries();
    },
    beforeMount() {
        if (this.inventoryModes.indexOf(this.storeInventoryMode) == -1)
            this.storeInventoryMode = this.defaultInventoryMode;
        /* redirect to the entity-chooser if none is set, at least for now */
        if (!this.storeEntity)
            this.$router.push('/entity-chooser');
    }
}
</script>

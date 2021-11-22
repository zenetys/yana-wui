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
          <div v-if="this.$route.path=='/main/inventory'" style="display:flex;background-color:#e8e8e8d6;height:38px;" class="pt-2 rounded">
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
              label="Chose Entitiy"
              placeholder="Chose Entitiy"
              solo
              dense
              hide-details=""
              flat
              background-color="#e8e8e8d6"
              prepend-inner-icon="mdi-server-network"
          ></v-autocomplete>
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
                  :key="i"
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
              <TimeLine :key="timeLineKey" @error="onErrorOccurs" style="height:80px"/>
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
                    "name": "L2 schema",
                    "icon": "mdi-graph",
                },
                {
                    "name": "OUI lookup",
                    "url": "/main/oui",
                    "icon": "mdi-help-network-outline",
                },
            ],
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
            if (this.$vuetify.breakpoint.mdAndDown) {
                this.drawer = false;
            } else if(!this.$vuetify.breakpoint.mdAndDown) {
                this.drawer = true;
            }
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
            this.timeLineKey++;
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

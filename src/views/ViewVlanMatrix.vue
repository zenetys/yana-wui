<template>
  <div>
    <v-card :width="tableWidth" class="elevation-2">
      <table id="table-vlan" :style="`height:${this.tableHeight}px;`">
        <tbody>
          <tr>
            <th rowspan="2"></th>
          </tr>
          <tr>
            <th class="vlan-number">#vlans</th>
            <th
              scope="col"
              v-for="item in vlansArray"
              :key="item.id"
              :class="'cell-' + item.id"
            >
              {{ item.id }}
            </th>
          </tr>
          <tr v-for="element in vlans" :key="element.id">
            <th scope="row" class="font-weight-regular">
              <router-link :to="'/main/inventory/switch/' + element.id">{{
                element.name
              }}</router-link>
            </th>
            <td
              class="vlan-number"
              :class="'cell-' + element.id"
              @mouseover="onOverCell(element.id)"
              @mouseout="onOutCell(element.id)"
            >
              {{ element.vlan.length }}
            </td>
            <td
              v-for="item in vlansArray"
              :key="item.id"
              :class="
                element.vlan.findIndex((el) => el.id === item.id) === -1
                  ? 'vlan-not-found cell-' + item.id
                  : 'vlan-found cell-' + item.id
              "
              @mouseover="onOverCell(item.id)"
              @mouseout="onOutCell(item.id)"
            >
              <span
                v-if="element.vlan.findIndex((el) => el.id === item.id) !== -1"
                :title="element.vlan.find((el) => el.id === item.id).name"
                >{{ element.vlan.find((el) => el.id === item.id).name }}</span
              >
            </td>
          </tr>
          <tr>
            <th>#switches</th>
            <td></td>
            <td v-for="element in vlansArray" :key="`el-${element.id}`">
              {{ switchesByVlan(element.id) }}
            </td>
          </tr>
        </tbody>
      </table>

      <v-overlay
        :absolute="true"
        :opacity="0.5"
        color="#ffffff"
        :value="isLoading"
        class="overlay"
        z-index="9"
      >
        <v-progress-circular
          indeterminate
          size="64"
          color="#a2a2a2"
        ></v-progress-circular>
      </v-overlay>
    </v-card>
  </div>
</template>

<style lang="scss" scoped>
.vlan-not-found {
  background-color: #f9cecc;
}

.vlan-found {
  background-color: #d9e8fc;
}

.vlan-number {
  background-color: #ffffff;
}

table {
  font-size: 12.8px;
  width: 99.99%;
  overflow: auto;
  display: block;
  white-space: nowrap;
  border-collapse: collapse;
}

tr td:last-child {
  width: 1%;
}

td {
  text-align: center;
  padding: 1px 15px 1px 15px;
  box-sizing: border-box;
  -moz-box-sizing: border-box;
  -webkit-box-sizing: border-box;
  box-shadow: inset 0 -1px 0 rgb(0 0 0 / 12%);
  box-shadow: inset 1px -1px 0 rgb(0 0 0 / 12%);
}

// Header left
table > tbody > tr > th:nth-child(1) {
  position: sticky;
  position: -webkit-sticky;
  left: 0;
  text-align: left;
  padding-left: 5px;
  padding-right: 15px;
  z-index: 7;
  color: rgba(0, 0, 0, 0.6);
  background: #fcfcfc;
  box-shadow: inset 0px -1px rgb(0 0 0 / 12%);
}

// Header top
table > tbody > tr:nth-child(2) > th {
  position: sticky;
  position: -webkit-sticky;
  top: 0;
  padding: 5px;
  z-index: 7;
  color: rgba(0, 0, 0, 0.6);
  text-align: center;
  background: #fcfcfc;
  box-shadow: inset 0 -1px 0 rgb(0 0 0 / 12%);
  box-shadow: inset 1px -1px 0 rgb(0 0 0 / 12%);
  box-sizing: border-box;
}

// #Vlans header cell
table > tbody > tr:nth-child(2) > th:first-child {
  text-align: center;
}

// on hover td cell
tbody > tr:hover {
  filter: grayscale(10%) brightness(95%);
  -webkit-filter: grayscale(10%) brightness(95%);
}

// Avoid filter on top left cell, top header, last row on hover
tbody > tr:nth-child(1):hover,
tbody > tr:nth-child(2):hover,
tbody > tr:last-child {
  filter: none;
  -webkit-filter: none;
}

// last row
tbody > tr:last-child,
tbody > tr:last-child > th:first-child {
  background-color: #ebebeb;
}
// first column
tbody > tr > td:nth-child(2),
tbody > tr:nth-child(2) > th:nth-child(1) {
  background-color: #ebebeb;
}

// top left cell
table > tbody > tr:nth-child(1) > th {
  position: sticky;
  position: -webkit-sticky;
  top: 0;
  left: 0;
  z-index: 8;
  background: rgb(255, 255, 255);
}
</style>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'ViewVlanMatrix',
  components: {},
  computed: {
    ...mapGetters(['storeDatabase', 'storeEntity', 'storeSearch']),
    apiStateParams() {
      return {
        entity: this.storeEntity,
        database: this.storeDatabase,
        search: this.storeSearch,
      };
    },
  },
  watch: {
    apiStateParams(cur, prev) {
      if (this.storeDatabase) {
        if (cur.database !== prev.database) {
          this.getVlans();
        }
        if (cur.search !== prev.search) {
          this.$router.push('/main/inventory');
        }
      }
    },
  },
  data() {
    return {
      vlans: [],
      headers: [
        { name: 'id', value: 'id' },
        { name: 'name', value: 'name' },
        { name: 'vlan', value: 'vlan' },
      ],
      vlansArray: [],
      tableHeight: 0,
      tableWidth: 0,
      isLoading: false,
    };
  },
  methods: {
    getVlansArray() {
      let tab = [];
      for (let i = 0; i < this.vlans.length; i++) {
        for (let j = 0; j < this.vlans[i].vlan.length; j++) {
          if (
            tab.findIndex((el) => el.id === this.vlans[i].vlan[j].id) === -1
          ) {
            tab.push(this.vlans[i].vlan[j]);
          }
        }
      }
      this.vlansArray = tab.sort((a, b) => {
        return a.id - b.id;
      });
    },
    getVlans() {
      this.isLoading = true;
      const url =
        '/entity/' +
        encodeURIComponent(this.storeEntity) +
        '/vlans?database=' +
        encodeURIComponent(this.storeDatabase);
      this.$api
        .get(url)
        .then((response) => {
          this.vlans = response.data.sort((a, b) => {
            if (a.name.toLowerCase() < b.name.toLowerCase()) {
              return -1;
            } else if (a.name.toLowerCase() > b.name.toLowerCase()) {
              return 1;
            }
            return 0;
          });
          this.getVlansArray();
          this.isLoading = false;
          // console.log(JSON.stringify(this.vlansArray));
        })
        .catch((error) => {
          console.log(error);
          this.$store.commit('EDIT_STORE_INFO_MESSAGE', {
            type: 'error',
            content: 'Can not load vlans, problem with the query.',
            error: error,
          });
        });
    },
    switchesByVlan(vlanId) {
      let number = 0;
      this.vlans.forEach((element) => {
        element.vlan.findIndex((el) => el.id === vlanId) !== -1
          ? (number += 1)
          : '';
      });
      return number;
    },
    setTableDimensions() {
      let tableVlan = document.getElementById('table-vlan');
      if (tableVlan) {
        let tableVlanRect = tableVlan.getBoundingClientRect();
        this.tableHeight = window.innerHeight - tableVlanRect.top - 130;
        if (window.innerWidth <= this.$vuetify.breakpoint.mdAndDown) {
          this.tableWidth = window.innerWidth - 300;
        } else {
          this.tableWidth = window.innerWidth;
        }
      }
    },
    onOverCell(id) {
      let cells = document.querySelectorAll('.cell-' + id);
      cells.forEach((element) => {
        if (!element.classList.contains('vlan-number')) {
          element.setAttribute(
            'style',
            'filter: grayscale(10%) brightness(95%);-webkit-filter:  grayscale(10%) brightness(95%);'
          );
        }
      });
    },
    onOutCell(id) {
      let cells = document.querySelectorAll('.cell-' + id);
      cells.forEach((element) => {
        if (element.classList.contains('vlan-number')) {
          document.querySelectorAll('.vlan-number').forEach((el) => {
            el.setAttribute('style', '');
          });
        }
        element.setAttribute('style', '');
      });
    },
  },
  mounted() {
    this.getVlans();
    this.setTableDimensions();
    window.addEventListener('resize', this.setTableDimensions);
  },
  destroyed() {
    window.removeEventListener('resize', this.setTableDimensions);
  },
};
</script>

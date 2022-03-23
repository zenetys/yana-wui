<template>
  <v-row>
    <v-col cols="6">
      <v-card :height="cardHeight" id="host-card">
        <table class="device-info mb-3">
          <tbody>
            <tr
              v-for="(propertyValue, propertyKey) in device"
              :key="propertyKey"
            >
              <template v-if="propertyKey !== 'iface'">
                <th class="text-left px-2">
                  {{
                    propertyKey.charAt(0).toUpperCase() + propertyKey.slice(1)
                  }}
                </th>
                <td class="text-left px-2" :id="'device-' + propertyKey">
                  <!-- Array -->
                  <template v-if="Array.isArray(propertyValue)">
                    <!-- Array and not object -->
                    <template v-if="!checkIfObject(propertyValue[0])">
                      {{ propertyValue[0] }}
                      <v-icon
                        v-if="propertyValue.length > 1"
                        size="18"
                        class="icon-chevron"
                        @click="openExpand(propertyKey)"
                        >mdi-chevron-down</v-icon
                      >
                      <div
                        v-if="propertyValue[0]"
                        :class="'expand_panel__' + propertyKey"
                      >
                        <template v-for="(subValue, subKey) in propertyValue">
                          <p
                            class="mb-0"
                            v-if="subKey !== 0"
                            :key="subValue + `-${subKey}`"
                          >
                            {{ subValue }}
                          </p>
                        </template>
                      </div>
                    </template>
                    <!-- Array and object -- route -->
                    <template
                      v-if="
                        checkIfObject(propertyValue[0]) &&
                        propertyKey === 'route'
                      "
                    >
                      <div v-if="propertyValue[0].dest">
                        dest {{ propertyValue[0].dest }}
                        <span v-if="propertyValue[0].via">
                          via {{ propertyValue[0].via }}
                        </span>
                        <span v-if="propertyValue[0].iface">
                          dev {{ propertyValue[0].iface }}
                        </span>
                        <v-icon
                          v-if="propertyValue.length > 1"
                          size="18"
                          class="icon-chevron"
                          @click="openExpand(propertyKey)"
                          >mdi-chevron-down</v-icon
                        >
                      </div>
                      <div
                        v-if="propertyValue[0]"
                        :class="'expand_panel__' + propertyKey"
                      >
                        <div
                          v-for="(subValue, subKey) in propertyValue"
                          :key="subKey"
                        >
                          <p v-if="subKey !== 0 && subValue.dest" class="mb-0">
                            dest {{ subValue.dest }}
                            <span v-if="subValue.via">
                              via {{ subValue.via }}
                            </span>
                            <span v-if="subValue.iface">
                              dev {{ subValue.iface }}
                            </span>
                          </p>
                        </div>
                      </div>
                    </template>
                    <!-- Array and object -- vlan -->
                    <template
                      v-if="
                        checkIfObject(propertyValue[0]) &&
                        propertyKey === 'vlan'
                      "
                    >
                      {{ propertyValue[0].id }} {{ propertyValue[0].name }}
                      <v-icon
                        v-if="propertyValue.length > 1"
                        size="18"
                        class="icon-chevron"
                        @click="openExpand(propertyKey)"
                        >mdi-chevron-down</v-icon
                      >
                      <div :class="'expand_panel__' + propertyKey">
                        <template v-for="(subValue, subKey) in propertyValue">
                          <p class="mb-0" v-if="subKey !== 0" :key="subKey">
                            {{ subValue.id }} {{ subValue.name }}
                          </p>
                        </template>
                      </div>
                    </template>
                  </template>
                  <!-- Not Array -->
                  <template v-else>
                    <span v-if="!checkIfObject(propertyValue)">{{
                      propertyValue
                    }}</span>
                  </template>
                </td>
              </template>
            </tr>
          </tbody>
        </table>
      </v-card>
    </v-col>
    <v-col cols="6">
      <v-card :height="cardHeight" id="host-ifaces-card">
        <table v-if="interfaces.length > 0">
          <tbody>
            <tr>
              <th rowspan="2"></th>
            </tr>
            <tr>
              <th v-for="header in interfaceHeaders" :key="header">
                {{ header }}
              </th>
            </tr>
            <tr v-for="(iface, ifaceIndex) in interfaces" :key="ifaceIndex">
              <th>{{ iface.name }}</th>
              <td
                v-for="(header, headerIndex) in interfaceHeaders"
                :key="headerIndex"
                :class="cellClass(header, iface.status)"
              >
                <span v-if="header !== 'ip'">
                  {{ iface[header] }}
                </span>
                <span v-else>
                  {{ formatIfaceIp(iface.name) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </v-card>
    </v-col>
  </v-row>
</template>

<style lang="scss" scoped>
* {
  font-size: 12.8px;
}

.cell-green {
  background-color: #b1e8b6;
}

.cell-red {
  background-color: #fac8d1;
}

.cell-ip {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
}

#host-card,
#host-ifaces-card {
  overflow-y: auto;
}

th {
  vertical-align: top;
}

#host-ifaces-card {
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
    text-align: left;
    padding: 1px 5px 1px 5px;
    box-sizing: border-box;
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
    box-shadow: inset 0 -1px 0 rgb(0 0 0 / 12%);
    box-shadow: inset 1px -1px 0 rgb(0 0 0 / 12%);
  }

  table > tbody > {
    // Header left
    tr > th:nth-child(1) {
      left: 0;
      text-align: left;
      vertical-align: middle;
      padding-left: 5px;
      padding-right: 15px;
      color: rgba(0, 0, 0, 0.6);
      background: #fcfcfc;
      box-shadow: inset 0px -1px rgb(0 0 0 / 12%);
    }

    // Header top
    tr:nth-child(2) > th {
      position: sticky;
      position: -webkit-sticky;
      top: 0;
      padding: 5px;
      z-index: 7;
      color: rgba(0, 0, 0, 0.6);
      text-align: left;
      background: #fcfcfc;
      box-shadow: inset 0 -1px 0 rgb(0 0 0 / 12%);
      box-shadow: inset 1px -1px 0 rgb(0 0 0 / 12%);
      box-sizing: border-box;
    }

    // top left cell
    tr:nth-child(1) > th {
      position: sticky;
      position: -webkit-sticky;
      top: 0;
      left: 0;
      background: rgb(255, 255, 255);
    }
  }
}

::v-deep .v-expansion-panels {
  z-index: inherit;

  .v-expansion-panel-header {
    padding-left: 0px;
    padding-top: 0px;
  }
}

.device-info th {
  background-color: #fcfcfc !important;
  color: rgba(0, 0, 0, 0.6);
}

.accordion {
  cursor: pointer;
}

.ifaces,
.iface-row {
  background-color: #f1f1f1 !important;
}

.icon-chevron,
.icon-chevron:focus {
  position: relative;
  vertical-align: top;
  background-color: none !important;
}

.expand_panel {
  &__ip,
  &__mac {
    display: none;
  }
}
</style>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'ViewHost',
  components: {},
  data() {
    return {
      device: {},
      interfaces: [],
      columnDefinition: {},
      cardHeight: 0,
      interfaceHeaders: ['status', 'speed', 'hwAddr', 'ip'],
    };
  },
  computed: {
    ...mapGetters(['storeDatabase', 'storeEntity', 'storeSearch']),
  },
  watch: {
    /* FIXME: workaround bug on entity change
     * also add redirect to inventory main view on search
     * this is probably not the right way to do it, need to check */
    storeEntity() {
      this.$router.push('/main/inventory');
    },
    storeSearch() {
      this.$router.push('/main/inventory');
    },
    '$route.params.id': {
      immediate: true,
      handler() {
        this.getDeviceInfo();
      },
    },
  },
  methods: {
    getDeviceInfo() {
      const deviceUrl =
        '/entity/' +
        encodeURIComponent(this.storeEntity) +
        '/' +
        'devices?database=' +
        encodeURIComponent(this.storeDatabase) +
        '&id=' +
        encodeURIComponent(this.$route.params.id);
      const ifaceUrl =
        '/entity/' +
        encodeURIComponent(this.storeEntity) +
        '/' +
        'interfaces?database=' +
        encodeURIComponent(this.storeDatabase) +
        '&id=' +
        encodeURIComponent(this.$route.params.id);

      this.$api
        .all([deviceUrl, ifaceUrl].map((query) => this.$api.get(query)))
        .then(
          this.$api.spread((deviceResponse, interfaceResponse) => {
            this.device = deviceResponse.data;
            if (this.device.vlan) {
              this.device.vlan = Object.values(this.device.vlan);
            }
            this.interfaces = interfaceResponse.data;
          })
        )
        .catch((error) => {
          console.log(error);
          this.$store.commit('EDIT_STORE_INFO_MESSAGE', {
            type: 'error',
            content: 'Can not load host informations, problem with the query.',
            error: error,
          });
        });
    },
    setCardHeight() {
      const hostCard = document.getElementById('host-card');
      const extraHeight = 120;
      if (hostCard) {
        const hostCardRect = hostCard.getBoundingClientRect();
        this.cardHeight = window.innerHeight - hostCardRect.top - extraHeight;
      }
    },
    /**
     * Expand information panel for the targeted item
     * @param {string} val - The item object key label
     */
    openExpand(val) {
      const expandedPanel = document.querySelector('.expand_panel__' + val);
      if (expandedPanel) {
        const displayValue = window
          .getComputedStyle(expandedPanel)
          .getPropertyValue('display');
        if (displayValue === 'block') {
          expandedPanel.style.display = 'none';
        } else if (displayValue === 'none') {
          expandedPanel.style.display = 'block';
        }
      }
    },
    checkIfObject(item) {
      return typeof item === 'object';
    },
    /**
     * Get a cell color class depending on the status of the interface
     * @param {string} header - Current header
     * @param {string} interfaceStatus - Status of the current interface
     * @returns {string} Class name assigning cell color
     */
    cellClass(header, interfaceStatus) {
      return interfaceStatus && header === 'status'
        ? interfaceStatus.includes('down')
          ? 'cell-red'
          : 'cell-green'
        : '';
    },
    cellContent(element, item) {
      return element[item];
    },
    /**
     * Return the ip list
     * @param {string} ifname - Element name
     * @returns {string|array} The equivalent ip format
     */
    formatIfaceIp(ifname) {
      if (
        this.device.iface &&
        this.device.iface[ifname] &&
        this.device.iface[ifname].ip
      )
        return Array.isArray(this.device.iface[ifname].ip)
          ? this.device.iface[ifname].ip.join(', ')
          : this.device.iface[ifname].ip;
      return '';
    },
  },
  mounted() {
    this.setCardHeight();
    window.addEventListener('resize', this.setCardHeight);
  },
  destroyed() {
    window.removeEventListener('resize', this.setCardHeight);
  },
};
</script>

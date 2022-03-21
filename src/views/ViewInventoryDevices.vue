<template>
  <div>
    <auto-table
      v-if="apiUrl !== ''"
      id="table-inventory-devices"
      :pagination="true"
      :api="apiUrl"
      array-data=""
      height="auto"
      :auto-table-height-extra="[-120]"
      :column-definition="columnDefinition"
      :custom-headers-computation="computeHeaders"
      @error="onErrorOccurs"
    >
    </auto-table>
  </div>
</template>

<style lang="scss" scoped>
/* color of icons in column flag */
::v-deep .col_flag .mdi:not(.cp-span) {
  color: gray;
}

/* color of icons in swport column */
::v-deep .col_swPort .mdi:not(.cp-span) {
  color: #1eb8ce;
}

/* column default max width */
::v-deep .v-data-table__divider {
  max-width: 100px;
}

::v-deep .v-data-table__divider.col_flag {
  width: 1px;
}
::v-deep .v-data-table__divider.col_ip {
  max-width: 130px;
  width: 130px;
}
::v-deep .v-data-table__divider.col_mac {
  max-width: 130px;
  width: 130px;
}
::v-deep .v-data-table__divider.col_swPort {
  max-width: inherit;
}

@media (min-width: 1200px) {
  ::v-deep .v-data-table__divider.col_name {
    max-width: 200px;
  }
  ::v-deep .v-data-table__divider.col_description {
    max-width: 200px;
  }
  ::v-deep .v-data-table__divider.col_macVendor {
    max-width: 100px;
  }
  ::v-deep .v-data-table__divider.col_type {
    max-width: 100px;
  }
}

@media (min-width: 1500px) {
  ::v-deep .v-data-table__divider.col_description {
    max-width: 500px;
  }
}

/* truncate text in columns */
::v-deep .v-data-table__divider > span:not(.cp-span) {
  /* nowrap is set by default in autotable */
  overflow: hidden;
  text-overflow: ellipsis;
}

::v-deep .more {
  font-size: 10px;
  font-style: italic;
  color: #666;
}
</style>

<script>
import AutoTable from '@/components/AutoTable';
import { mapGetters } from 'vuex';
import { unArray } from '@/plugins/utils';

export default {
  name: 'ViewInventoryDevices',
  components: {
    AutoTable,
  },
  data() {
    return {
      apiUrl: '',
      columnDefinition: {
        flag: {
          format: (v, o) => {
            v = unArray(v);
            const type = unArray(o.type) ? unArray(o.type).toLowerCase() : '';
            const descr = unArray(o.description)
              ? unArray(o.description).toLowerCase()
              : '';
            if (type) {
              if (type.indexOf('switch') > -1)
                return '<span class="mdi mdi-swap-horizontal-bold"></span>';
              if (type.indexOf('router') > -1)
                return '<span class="mdi mdi-router"></span>';
              if (type.indexOf('wlan') > -1)
                return '<span class="mdi mdi-wifi"></span>';
              if (type.indexOf('phone') > -1)
                return '<span class="mdi mdi-phone"></span>';
              if (type.indexOf('print') > -1)
                return '<span class="mdi mdi-printer"></span>';
            }
            if (descr) {
              if (descr.indexOf('linux') > -1)
                return '<span class="mdi mdi-linux"></span>';
              if (descr.indexOf('windows') > -1)
                return '<span class="mdi mdi-microsoft-windows"></span>';
              if (descr.indexOf('print') > -1)
                return '<span class="mdi mdi-printer"></span>';
            }
            return '<span class="mdi mdi-monitor-small"></span>';
          },
          isHtml: true,
          getClass: () => 'nocp',
        },
        id: {
          format: (v) => unArray(v),
          hidden: true,
        },
        ip: {
          format: (v, o) => {
            v = unArray(v);
            if (v) {
              const type = unArray(o.type);
              if (type && type.toLowerCase().indexOf('switch') > -1)
                return (
                  '<a href="#/main/inventory/switch/' + o.id + '">' + v + '</a>'
                );
              return (
                '<a href="#/main/inventory/host/' + o.id + '">' + v + '</a>'
              );
            }
            return '';
          },
          onHover: (value) => {
            if (unArray(value)) {
              let res = '';
              for (let i = 0; i < value.length; i++) {
                res += value[i] + '\n';
              }
              return res;
            }
            return '' + value;
          },
          label: 'IP',
          isHtml: true,
        },
        name: {
          format: (v, o) => {
            v = unArray(v);
            if (v) {
              const type = unArray(o.type);
              if (type && type.toLowerCase().indexOf('switch') > -1)
                return (
                  '<a href="#/main/inventory/switch/' + o.id + '">' + v + '</a>'
                );
              return (
                '<a href="#/main/inventory/host/' + o.id + '">' + v + '</a>'
              );
            }
            return '';
          },
          isHtml: true,
        },
        location: {
          format: (v) => unArray(v),
        },
        description: {
          format: (v) => unArray(v),
          getTooltip: (v) => {
            return Array.isArray(v) ? v.join('\n') : '';
          },
        },
        type: {
          format: (v) => unArray(v),
        },
        mac: {
          format: (v) => unArray(v),
        },
        capabilities: {
          format: (v) => unArray(v),
        },
        swPort: {
          format: (v) => {
            const total = Array.isArray(v) ? v.length : v ? 1 : 0;
            const first = unArray(v);
            let out = '<span class="nowrap">';
            if (first) {
              out +=
                '<span class="mdi mdi-swap-horizontal-bold"></span> <a href="#/main/inventory/switch/' +
                first.id +
                '">' +
                first.name +
                '</a> ' +
                first.iface;
              if (total > 1)
                out += ` <span class="more">(+${total - 1})</span>`;
            }
            out += '</span>';
            return out;
          },
          getTooltip: (v) => {
            let out = [];

            if (v) {
              for (let i of v) {
                let current = i.name + ' ' + i.iface;
                if (i.count !== undefined)
                  current +=
                    ' (' + i.count + ' mac' + (i.count > 1 ? 's' : '') + ')';
                out.push(current);
              }
            }
            return out.join('\n');
          },
          isHtml: true,
        },
        macVendor: {
          format: (v) => unArray(v),
        },
      },
    };
  },
  methods: {
    /**
     * Update the query api link to make the query
     */
    updateApiUrl() {
      let params = this.apiStateParams;
      let url = '';
      if (params.entity && params.database)
        url +=
          '/entity/' +
          encodeURIComponent(params.entity) +
          '/devices?database=' +
          encodeURIComponent(params.database) +
          '&q=' +
          encodeURIComponent(params.search) +
          '&short';
      console.log('updateApiUrl', url);
      this.apiUrl = url;
    },
    /**
     * Let edit the headers
     * @param {array} headers
     */
    computeHeaders(headers) {
      headers.unshift({ value: 'flag' });
    },
    /**
     * Add error object in the store
     * @param {object} payload
     */
    onErrorOccurs(payload) {
      this.$store.commit('EDIT_STORE_INFO_MESSAGE', payload);
    },
  },
  computed: {
    ...mapGetters(['storeEntity', 'storeDatabase', 'storeSearch']),
    apiStateParams() {
      return {
        entity: this.storeEntity,
        database: this.storeDatabase,
        search: this.storeSearch,
      };
    },
  },
  watch: {
    apiStateParams: {
      immediate: true,
      handler(cur, prev) {
        console.log('watch apiStateParams', cur, prev);
        this.updateApiUrl();
      },
    },
  },
  mounted() {},
};
</script>

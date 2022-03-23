<template>
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
</template>

<style lang="scss" scoped>
::v-deep {
  /* color of icons in column flag */
  .col_flag .mdi:not(.cp-span) {
    color: gray;
  }

  /* color of icons in swport column */
  .col_swPort .mdi:not(.cp-span) {
    color: #1eb8ce;
  }

  /* column default max width */
  .v-data-table__divider {
    max-width: 100px;

    &.col_flag {
      width: 1px;
    }

    &.col_ip,
    &.col_mac {
      max-width: 130px;
      width: 130px;
    }

    &.col_swPort {
      max-width: inherit;
    }

    > span:not(.cp-span) {
      overflow: hidden;
      text-overflow: ellipsis;
    }

    @media (min-width: 1200px) {
      &.col_name,
      &.col_description {
        max-width: 200px;
      }

      &.col_macVendor,
      &.col_type {
        max-width: 100px;
      }
    }

    @media (min-width: 1500px) {
      &.col_description {
        max-width: 500px;
      }
    }
  }
  .additional-ports-counter {
    font-size: 10px;
    font-style: italic;
    color: #666;
  }
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
            if (Array.isArray(value)) {
              return value.map((v) => v + '\n').join('');
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
            const firstValue = unArray(v);
            let formatted = '<span class="nowrap">';
            if (firstValue) {
              formatted +=
                '<span class="mdi mdi-swap-horizontal-bold"></span> <a href="#/main/inventory/switch/' +
                firstValue.id +
                '">' +
                firstValue.name +
                '</a> ' +
                firstValue.iface;
              if (total > 1)
                formatted += ` <span class="additional-ports-counter">(+${
                  total - 1
                })</span>`;
            }
            formatted += '</span>';
            return formatted;
          },
          getTooltip: (v) => {
            const tooltip = [];

            if (v) {
              for (let i of v) {
                let current = i.name + ' ' + i.iface;
                if (i.count !== undefined)
                  current +=
                    ' (' + i.count + ' mac' + (i.count > 1 ? 's' : '') + ')';
                tooltip.push(current);
              }
            }
            return tooltip.join('\n');
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
      const params = this.apiStateParams;
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
      this.apiUrl = url;
    },
    /**
     * Compute the headers
     * @param {array<object>} headers
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
      handler() {
        this.updateApiUrl();
      },
    },
  },
  mounted() {},
};
</script>

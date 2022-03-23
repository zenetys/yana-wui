<template>
  <div>
    <AutoTable
      v-if="apiUrl !== '' && storeSearch !== ''"
      id="table-inventory-fdb"
      :isPaginated="true"
      :api="apiUrl"
      array-data=""
      height="auto"
      :auto-table-height-extra="[-120]"
      :column-definition="columnDefinition"
    />
    <span v-if="storeSearch === ''">Please enter something to search</span>
  </div>
</template>

<style scoped>
::v-deep .v-data-table__divider {
  position: relative;
}
</style>

<script>
import AutoTable from '@/components/AutoTable';
import { mapGetters } from 'vuex';
import { unArray } from '@/plugins/utils';

export default {
  name: 'ViewInventoryFdb',
  components: {
    AutoTable,
  },
  data() {
    return {
      apiUrl: '',
      columnDefinition: {
        swId: {
          hidden: true,
        },
        fdbMacDid: {
          hidden: true,
        },
        fdbMacDip: {
          format: (v) => {
            return unArray(v);
          },
          getTooltip: (v) => {
            if (Array.isArray(v)) {
              return v.join('\n');
            } else if (v) {
              return v;
            }
            return '';
          },
          getStyle: () => 'color: #666;',
        },
        swName: {
          format: (v, o) => {
            v = unArray(v);
            return (
              '<a href="#/main/inventory/switch/' + o.swId + '"> ' + v + ' </a>'
            );
          },
          isHtml: true,
        },
        swIfUplink: {
          format: (v) => {
            v = unArray(v);
            if (v) {
              return (
                '<a href="#/main/inventory/switch/' +
                v.id +
                '"> ' +
                v.name +
                '</a> ' +
                v.iface
              );
            }
            return v;
          },
          getTooltip: (v) => {
            const tooltip = [];
            if (v) {
              for (let i of v) {
                const current = i.name + ' ' + i.iface;
                tooltip.push(current);
              }
            }
            return tooltip.join('\n');
          },
          isHtml: true,
        },
      },
    };
  },
  methods: {
    updateApiUrl() {
      const params = this.apiStateParams;
      let url = '';
      if (params.entity && params.database)
        url +=
          '/entity/' +
          encodeURIComponent(params.entity) +
          '/fdb?database=' +
          encodeURIComponent(params.database) +
          '&q=' +
          encodeURIComponent(params.search);
      this.apiUrl = url;
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
    apiStateParams(cur, prev) {
      if (cur.entity !== prev.entity) {
        return;
      }
      this.updateApiUrl();
    },
  },
  mounted() {
    this.updateApiUrl();
  },
};
</script>

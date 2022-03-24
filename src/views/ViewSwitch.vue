<template>
  <div class="device-info">
    <table class="mb-3">
      <tbody>
        <tr>
          <th class="text-left px-2">Name</th>
          <td class="text-left pl-2">
            <router-link :to="'/main/inventory/host/' + this.device.id" id="device-name">{{
              this.deviceName
            }}</router-link>
            <span class="secondary-names">{{ this.deviceSecondaryNames }}</span>
          </td>
        </tr>
        <tr>
          <th class="text-left px-2">Description</th>
          <td class="text-left pl-2">{{ this.deviceDescription }}</td>
        </tr>
        <tr>
          <th class="text-left px-2">IP</th>
          <td class="text-left pl-2">{{ this.deviceIp }}</td>
        </tr>
      </tbody>
    </table>

    <AutoTable
      id="table-switch"
      :pagination="false"
      :api="apiUrl"
      array-data=""
      height="auto"
      :auto-table-height-extra="[-120]"
      :column-definition="columnDefinition"
      :item-class="itemClass"
    />
  </div>
</template>

<style scoped lang="scss">
.device-info table {
  font-size: 12.8px;
  border-collapse: collapse;
  line-height: 1.4;

  th {
    border-right: thin solid rgba(0, 0, 0, 0.12);
    background-color: #fcfcfc !important;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.6);
    font-weight: 700;
    vertical-align: top;
  }

  span.secondary-names {
    color: #666;
  }
}

::v-deep {
  #table-switch tr:not(.status-up---up) td {
    color: #aaa;
  }

  .level-1 {
    /* orange */
    background-color: #ffe4a8 !important;
    border-color: #f2dfab !important;
  }

  .level-2 {
    /* red */
    background-color: #fac8d1 !important;
    border-color: #ebbfbb !important;
  }

  .col_peers .mdi:not(.cp-span) {
    color: #1eb8ce;
  }
}
</style>

<script>
import AutoTable from '@/components/AutoTable';
import { mapGetters } from 'vuex';
import { unArray } from '../plugins/utils';

export default {
  name: 'SwitchView',
  components: {
    AutoTable,
  },
  data() {
    return {
      // deviceInfo: {},
      columnDefinition: {
        did: {
          hidden: true,
        },
        dname: {
          hidden: true,
        },
        hwAddr: {},
        name: {},
        description: {
          getClass: (tableItem) => this.getClass('description', tableItem),
          getTitle: (tableItem) => this.getTitle('description', tableItem),
        },
        status: {
          getClass: (tableItem) => this.getClass('status', tableItem),
          getTitle: (tableItem) => this.getTitle('status', tableItem),
        },
        speed: {
          getClass: (tableItem) => this.getClass('speed', tableItem),
          getTitle: (tableItem) => this.getTitle('speed', tableItem),
        },
        group: {},
        mode: {
          getClass: (tableItem) => this.getClass('mode', tableItem),
          getTitle: (tableItem) => this.getTitle('mode', tableItem),
        },
        pvlan: {
          getClass: (tableItem) => this.getClass('pvlan', tableItem),
          getTitle: (tableItem) => this.getTitle('pvlan', tableItem),
        },
        untagged: {
          getClass: (tableItem) => this.getClass('untagged', tableItem),
          getTitle: (tableItem) => this.getTitle('untagged', tableItem),
        },
        tagged: {
          getClass: (tableItem) => this.getClass('tagged', tableItem),
          getTitle: (tableItem) => this.getTitle('tagged', tableItem),
          getStyle: () => {
            return 'white-space: normal;';
          },
        },
        peers: {
          getStyle: () => {
            return 'white-space: normal;';
          },
          format: (values) => {
            const formatted = values.map((value) => {
              let label = value.label;

              if (value.type?.includes('switch')) {
                if (value.id) {
                  label = `<a href="#/main/inventory/switch/${value.id}">${label}</a>`;
                }

                label = '<span class="mdi mdi-swap-horizontal-bold"></span> ' + label;
              }

              const tab = [];
              Object.keys(value).forEach((key) => {
                if (key !== 'label' && key !== 'id') {
                  tab.push(key + ': ' + value[key]);
                }
              });

              return '<span class="nowrap" title="' + tab.join('\n') + '">' + label + '</span>';
            });

            return formatted.join(', ');
          },
          isHtml: true,
        },
        _meta: {
          hidden: true,
        },
      },
      tableHeight: 0,
      device: {},
    };
  },
  computed: {
    apiUrl() {
      return (
        '/entity/' +
        encodeURIComponent(this.storeEntity) +
        '/' +
        'interfaces?database=' +
        encodeURIComponent(this.storeDatabase) +
        '&id=' +
        encodeURIComponent(this.$route.params.id)
      );
    },
    ...mapGetters(['storeDatabase', 'storeEntity', 'storeSearch']),
    deviceName() {
      return unArray(this.device.name);
    },
    deviceSecondaryNames() {
      if (Array.isArray(this.device.name) && this.device.name.length > 1)
        return ', ' + this.device.name.slice(1).join(', ');
      return '';
    },
    deviceDescription() {
      return unArray(this.device.description);
    },
    deviceIp() {
      return Array.isArray(this.device.ip) ? this.device.ip.join(', ') : this.device.ip;
    },
  },
  methods: {
    getDeviceInfo() {
      const url =
        '/entity/' +
        encodeURIComponent(this.storeEntity) +
        '/' +
        'devices?database=' +
        encodeURIComponent(this.storeDatabase) +
        '&id=' +
        encodeURIComponent(this.$route.params.id);
      this.$api
        .get(url)
        .then((response) => {
          this.device = response.data;
        })
        .catch((error) => {
          console.log(error);
          this.$store.commit('EDIT_STORE_INFO_MESSAGE', {
            type: 'error',
            content: 'Cannot load device informations, problem with the query.',
            error: error,
          });
        });
    },
    itemClass(item) {
      let classes = '';

      if (item.status) classes += 'status-' + item.status.toLowerCase().replace(/[^a-z0-9]/g, '-');
      return classes;
    },
    getClass(itemKey, tableItem) {
      if (tableItem && tableItem._meta && tableItem._meta[itemKey])
        return tableItem._meta[itemKey].level !== undefined
          ? 'level-' + tableItem._meta[itemKey].level
          : '';
      return '';
    },
    getTitle(itemKey, tableItem) {
      if (
        tableItem &&
        tableItem._meta &&
        tableItem._meta[itemKey] &&
        tableItem._meta[itemKey].text
      ) {
        return Array.isArray(tableItem._meta[itemKey].text)
          ? tableItem._meta[itemKey].text.join('\n')
          : tableItem._meta[itemKey].text;
      }
      return '';
    },
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
    '$route.params.id': function () {
      this.getDeviceInfo();
    },
  },
  beforeMount() {
    /* redirect to the entity-picker if none is set, at least for now */
    if (!this.storeEntity) this.$router.push('/entity-picker');
  },
  mounted() {
    this.getDeviceInfo();
  },
  updated() {
    window.dispatchEvent(new Event('resize'));
  },
};
</script>

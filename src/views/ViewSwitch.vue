<template>
    <div class="device-info">
        <table class="mb-3">
            <tbody>
                <tr>
                    <th class="text-left px-2">Name</th>
                    <td class="text-left pl-2">
                        <router-link
                            v-if="device.id"
                            :to="$utils.getDeviceRoute(device.id, 'host', $route, false)"
                            id="device-name"
                            >{{ deviceName }}</router-link
                        >
                        <span class="secondary-names">{{ deviceSecondaryNames }}</span>
                    </td>
                </tr>
                <tr>
                    <th class="text-left px-2">Description</th>
                    <td class="text-left pl-2">{{ deviceDescription }}</td>
                </tr>
                <tr>
                    <th class="text-left px-2">IP</th>
                    <td class="text-left pl-2">{{ deviceIp }}</td>
                </tr>
            </tbody>
        </table>

        <AutoTable
            id="table-switch"
            :pagination="false"
            :api="apiUrl"
            array-data=""
            height="auto"
            :height-offsets="[-120]"
            :column-definition="columnDefinition"
            :item-class="itemClass" />
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
import AutoTable from '@/components/AutoTable.vue';

export default {
    name: 'SwitchView',
    components: {
        AutoTable,
    },
    data() {
        return {
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
                    getStyle: () => 'white-space: normal;',
                },
                peers: {
                    getStyle: () => 'white-space: normal;',
                    /**
                     * Format peers to generate a links to devices
                     * @param {array} peers - array of peers
                     * @return {string} - joined HTML links of formatted peers
                     */
                    format: (peers) => {
                        const peerRouteBase = { name: 'ViewSwitch' };
                        peerRouteBase.query = this.$route.query;
                        peerRouteBase.params = { ...this.$route.params };

                        const formattedPeers = peers.map((peer) => {
                            let label = peer.label;

                            if (peer.type?.includes('switch')) {
                                if (peer.id) {
                                    const peerRoute = peerRouteBase;
                                    peerRoute.params.id = peer.id;
                                    /** Working URL fully generated with params & query params */
                                    const peerLink = this.$router.resolve(peerRoute).href;
                                    label = `<a href="${peerLink}">${label}</a>`;
                                }
                                label = '<span class="mdi mdi-swap-horizontal-bold"></span> ' + label;
                            }

                            const tab = [];
                            Object.keys(peer).forEach((key) => {
                                if (key !== 'label' && key !== 'id') {
                                    tab.push(key + ': ' + peer[key]);
                                }
                            });

                            return '<span class="nowrap" title="' + tab.join('\n') + '">' + label + '</span>';
                        });

                        return formattedPeers.join(', ');
                    },
                    isHtml: true,
                },
                _meta: {
                    hidden: true,
                },
            },
            tableHeight: 0,
            device: {},
            apiUrl: '',
        };
    },
    computed: {
        apiStateParams() {
            return {
                entity: this.$route.query.entity,
                database: this.$route.query.db,
                id: this.$route.params.id,
            };
        },
        deviceName() {
            return this.$utils.unArray(this.device.name);
        },
        deviceSecondaryNames() {
            if (Array.isArray(this.device.name) && this.device.name.length > 1)
                return ', ' + this.device.name.slice(1).join(', ');
            return '';
        },
        deviceDescription() {
            return this.$utils.unArray(this.device.description);
        },
        deviceIp() {
            return Array.isArray(this.device.ip) ? this.device.ip.join(', ') : this.device.ip;
        },
    },
    methods: {
        /**
         * Get all the information about the switch from the API
         */
        getDeviceInfo() {
            this.apiUrl = this.$utils.getUpdatedApiUrl(this.apiStateParams, 'interface');
            const url = this.$utils.getUpdatedApiUrl(this.apiStateParams, 'device');

            this.$api.axiosData(url)
                .then((data) => { this.device = data; })
                .catch(() => { this.device = {}; })
        },
        /**
         * Get the class for a table item depending on its status
         * @param {string} item - the item to get the class for
         * @return {string} - classes to apply to the table item
         */
        itemClass(item) {
            let classes = '';

            if (item.status) classes += 'status-' + item.status.toLowerCase().replace(/[^a-z0-9]/g, '-');

            return classes;
        },
        /**
         * Get a custom class for table items that have a meta field
         * @param {string} itemKey - the key of the table item
         * @param {object} tableItem - the table item
         * @return {string} class to apply
         */
        getClass(itemKey, tableItem) {
            if (tableItem && tableItem._meta && tableItem._meta[itemKey])
                return tableItem._meta[itemKey].level !== undefined ? 'level-' + tableItem._meta[itemKey].level : '';
            return '';
        },
        /**
         * Get a custom title for table items that have a meta field
         * @param {string} itemKey - the key of the table item
         * @param {object} tableItem - the table item
         * @return {string} title to apply
         */
        getTitle(itemKey, tableItem) {
            if (tableItem?._meta[itemKey]?.text) {
                return Array.isArray(tableItem._meta[itemKey].text)
                    ? tableItem._meta[itemKey].text.join('\n')
                    : tableItem._meta[itemKey].text;
            }

            return '';
        },
    },
    watch: {
        apiStateParams: {
            immediate: true,
            handler(cur, prev) {
                console.log('ViewSwitch: watch/apiStateParams: cur =', cur, ', prev =', prev);

                if (this.$utils.eq(cur, prev)) {
                    console.log('ViewSwitch: watch/apiStateParams: no change');
                    return;
                }
                if (prev && (cur.entity !== prev.entity)) {
                    console.log('ViewSwitch: watch/apiStateParams: entity change, redirect');
                    this.$router.replace({ name: 'ViewMain', query: { ...this.$route.query } });
                    return;
                }
                if (!cur.entity || !cur.database || !cur.id) {
                    console.log('ViewSwitch: watch/apiStateParams: skip required data');
                    return;
                }

                this.getDeviceInfo();
            },
        },
    },
    updated() {
        /* trigger window.resize event so the table can adjust its
         * height if the info panel is updated */
        window.dispatchEvent(new Event('resize'));
    },
};
</script>

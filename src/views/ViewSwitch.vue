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
                        <template v-for="(rl, i) in infoButtons">
                            <router-link
                                :key="i"
                                :title="rl.label"
                                v-if="rl.to && rl.if()"
                                :to="rl.to()"
                                class="z-flag elevation-1"
                                ><span class="mdi" :class="rl.icon"/></router-link
                            >
                            <a v-else-if="rl.click && rl.if()"
                                :key="i"
                               :title="rl.label"
                                @click="rl.click"
                                class="z-flag elevation-1"
                                ><span class="mdi" :class="rl.icon"></span></a
                            >
                        </template>
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

        <div :class="`switch_container ${isShown ? '' : 'expand'}`" v-if="slots.length !== 1">
            <span :class="`expand_arrow ${isShown ? 'active' : ''}`" @click="isShown = !isShown">
                <span></span>
                <span></span>
            </span>
            <ZSwitch :groups="slot.groups" v-for="(slot, i) in slots" :isDefault="slot.isDefault" :key="i" :style="i < slots.length ? 'margin-bottom: 0.25rem' : ''"/>
        </div>
        <ZSwitch v-else :groups="slots[0].groups" :isDefault="slots[0].isDefault" style="margin-bottom: 0.25rem"/>


        <AutoTable :config="config" />
    </div>
</template>

<style scoped lang="scss">
.expand_arrow {
    width: 1.25rem;
    height: 1.25rem;
    display: inline-block;
    margin: 0 1rem;

    outline: none;
    position: absolute;
    right: 0;
    top: 2.5rem;

    span {
        top: 0.5rem;
        position: absolute;
        width: 0.75rem;
        height: 0.1rem;
        background-color: rgba(0,0,0,0.5);
        display: inline-block;
        transition: all .3s ease!important;

        &:first-of-type {
            left: 0;
            transform: rotate(45deg);

        }

        &:last-of-type {
            right: 0;
            transform: rotate(-45deg);
        }
    }

    &.active {
        span {
            &:first-of-type {
                transform: rotate(-45deg);
            }

            &:last-of-type {
                transform: rotate(45deg);
            }
        }
    }



}
.switch_container {
    width: 57rem;
    max-width: 100%;
    position: relative;
    &.expand {
        max-height: 5rem;
        overflow-y: hidden;
    }
}
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
        & + * {
            margin-left: 10px;
        }
    }

    .z-flag {
        color: grey;
        padding: 0px 1px;
        & + * {
            margin-left: 3px;
        }
        &:hover {
            background-color: #f7f7f7;
        }
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
    .cell_peers .mdi:not(.cp-span) {
        color: #1eb8ce;
    }

    .sizable {
        .col_description {
            min-width: 9vw;
        }
        .col_group {
            width: 1vw;
        }
        .col_tagged {
            min-width: 10vw;
        }
        .col_peers {
            min-width: 10vw;
        }
    }
}
</style>

<script>
/**
 * Get a custom class for table items that have a meta field
 * @param {string} itemKey - the key of the table item
 * @param {object} tableItem - the table item
 * @return {string} class to apply
 */
function getClass(itemKey, tableItem) {
    if (tableItem && tableItem._meta && tableItem._meta[itemKey])
        return tableItem._meta[itemKey].level !== undefined ? 'level-' + tableItem._meta[itemKey].level : '';
    return '';
}

/**
 * Get a custom title for table items that have a meta field
 * @param {string} itemKey - the key of the table item
 * @param {object} tableItem - the table item
 * @return {string} title to apply
 */
function getTitle(itemKey, tableItem) {
    if (tableItem?._meta[itemKey]?.text) {
        return Array.isArray(tableItem._meta[itemKey].text)
            ? tableItem._meta[itemKey].text.join('\n')
            : tableItem._meta[itemKey].text;
    }

    return '';
}

/**
 * Get the class for a table item depending on its status
 * @param {string} item - the item to get the class for
 * @return {string} - classes to apply to the table item
 */
function itemClass(item) {
    let classes = '';

    if (item.status) {
        classes += 'status-' + item.status.toLowerCase().replace(/[^a-z0-9]/g, '-');
    }

    return classes;
}

import AutoTable from '@/components/AutoTable.vue';
import ZSwitch from '@/components/ZSwitch.vue'

export default {
    name: 'SwitchView',
    components: {
        AutoTable,
        ZSwitch,
    },
    data() {
        return {
            slots: [],
            isShown: false,
            device: {},
            infoButtons: [],
            config: {
                id: 'table-switch',
                api: '',
                height: 'auto',
                paginated: false,
                heightOffsets: [-120],
                itemClass: itemClass,
                columns: {
                    hwAddr: {
                        sortable: false,
                        truncable: false,
                    },
                    name: {
                        sortable: false,
                        truncable: false,
                    },
                    did: {
                        enabled: false,
                        sortable: false,
                    },
                    dname: {
                        enabled: false,
                        sortable: false,
                    },
                    description: {
                        cssClass: (tableItem) => getClass('description', tableItem),
                        getTitle: (tableItem) => getTitle('description', tableItem),
                        sortable: false,
                        truncable: true,
                    },
                    status: {
                        cssClass: (tableItem) => getClass('status', tableItem),
                        getTitle: (tableItem) => getTitle('status', tableItem),
                        sortable: false,
                        truncable: false,
                    },
                    speed: {
                        cssClass: (tableItem) => getClass('speed', tableItem),
                        getTitle: (tableItem) => getTitle('speed', tableItem),
                        sortable: false,
                        truncable: false,
                    },
                    group: {
                        sortable: false,
                        truncable: false,
                    },
                    mode: {
                        cssClass: (tableItem) => getClass('mode', tableItem),
                        getTitle: (tableItem) => getTitle('mode', tableItem),
                        sortable: false,
                        truncable: false,
                    },
                    pvlan: {
                        cssClass: (tableItem) => getClass('pvlan', tableItem),
                        getTitle: (tableItem) => getTitle('pvlan', tableItem),
                        sortable: false,
                        truncable: false,
                    },
                    untagged: {
                        cssClass: (tableItem) => getClass('untagged', tableItem),
                        getTitle: (tableItem) => getTitle('untagged', tableItem),
                        sortable: false,
                        truncable: false,
                    },
                    tagged: {
                        cssClass: (tableItem) => getClass('tagged', tableItem),
                        getTitle: (tableItem) => getTitle('tagged', tableItem),
                        cssStyle: () => 'white-space: normal;',
                        sortable: false,
                        truncable: false,
                    },
                    peers: {
                        cssStyle: () => 'white-space: normal;',
                        formatText: (peers) => {
                            peers ||= []; /* may be null */
                            return peers.map((peer) => peer.label).join(', ');
                        },
                        /**
                         * Format peers to generate a links to devices
                         * @param {array} peers - array of peers
                         * @return {string} - joined HTML links of formatted peers
                         */
                        formatHtml: (peers) => {
                            peers ||= []; /* may be null */
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
                        sortable: false,
                        truncable: false,
                    },
                    _meta: {
                        enabled: false,
                        sortable: false,
                    },
                }
            },
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
            return this.$utils.arrayLongest(this.device.description);
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
            this.config.api = this.$api.base._getInterfaces(this.apiStateParams.entity,
                this.apiStateParams.database, this.apiStateParams.id);

            this.$api.base.getDevice(this.apiStateParams.entity,
                this.apiStateParams.database, this.apiStateParams.id)
                .then((data) => { this.device = data;console.warn(data) })
                .catch(() => { this.device = {}; })

           this.$api.base.getSwitch(this.apiStateParams.entity,
              this.apiStateParams.database, this.apiStateParams.id)
              .then((data) => { this.slots = data;console.warn(data) })
              .catch((e) => { console.warn(e) })
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

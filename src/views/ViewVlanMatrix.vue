<template>
    <v-card class="elevation-2">
        <table id="table-vlan" :height="tableHeight">
            <tbody>
                <tr>
                    <th rowspan="2"></th>
                </tr>
                <tr>
                    <th class="vlan-number">#vlans</th>
                    <th
                        scope="col"
                        v-for="vid in vlanIds"
                        :key="vid"
                        :class="'cell-' + vid">
                        {{ vid }}
                    </th>
                </tr>
                <tr v-for="device in devices" :key="device.id">
                    <th scope="row" class="font-weight-regular">
                        <router-link :to="$utils.getDeviceRoute(device.id, 'switch', $route, false)">
                            {{ device.name }}
                        </router-link>
                    </th>
                    <td
                        class="vlan-number"
                        :class="'cell-' + device.id"
                        @mouseover="onOverCell(device.id)"
                        @mouseout="onOutCell(device.id)">
                        {{ device.vlan.length }}
                    </td>
                    <td
                        v-for="vid in vlanIds"
                        :key="vid"
                        :class="getDeviceVlanClass(device, vid)"
                        @mouseover="onOverCell(vid)"
                        @mouseout="onOutCell(vid)">
                        <span
                            v-if="findDeviceVlanEntry(device, vid)"
                            :title="findDeviceVlanEntry(device, vid).name">
                            {{ findDeviceVlanEntry(device, vid).name }}
                        </span>
                    </td>
                </tr>
                <tr>
                    <th>#switches</th>
                    <td></td>
                    <td v-for="vid in vlanIds" :key="`el-${vid}`">
                        {{ countDevicesHavingVlanId(vid) }}
                    </td>
                </tr>
            </tbody>
        </table>

        <v-overlay :absolute="true" :opacity="0.3" color="#ffffff" :value="isLoading">
            <v-progress-circular indeterminate size="64" color="#a2a2a2"></v-progress-circular>
        </v-overlay>
    </v-card>
</template>

<style lang="scss" scoped>
table {
    font-size: 12.8px;
    width: 99.99%;
    overflow: auto;
    display: block;
    white-space: nowrap;
    border-collapse: collapse;

    .vlan-not-found {
        background-color: #f9cecc;
    }

    .vlan-found {
        background-color: #d9e8fc;
    }

    .vlan-number {
        background-color: #ffffff;
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

    > tbody {
        // first row and first column headers
        > tr > th:nth-child(1),
        > tr:nth-child(2) > th {
            position: sticky;
            position: -webkit-sticky;
            z-index: 1;
            box-shadow: inset -1px -1px rgb(0 0 0 / 12%);
            color: rgba(0, 0, 0, 0.6);
            background: #fcfcfc;
        }

        > tr > th:nth-child(1) {
            left: 0;
            text-align: left;
            padding-left: 5px;
            padding-right: 15px;
        }

        > tr:nth-child(2) > th {
            top: 0;
            text-align: center;
            padding: 5px;
            box-shadow: inset 1px -1px 0 rgb(0 0 0 / 12%);
            box-sizing: border-box;

            &:first-child {
                text-align: center;
            }
        }

        > tr:hover {
            filter: grayscale(10%) brightness(95%);
            -webkit-filter: grayscale(10%) brightness(95%);
        }

        > tr:nth-child(1):hover,
        > tr:nth-child(2):hover,
        > tr:last-child {
            filter: none;
            -webkit-filter: none;
        }

        // last row
        > tr:last-child,
        > tr:last-child > th:first-child {
            background-color: #ebebeb;
        }

        // first column
        > tr > td:nth-child(2),
        > tr:nth-child(2) > th:nth-child(1) {
            background-color: #ebebeb;
            box-shadow: inset 0px -1px 0 rgb(0 0 0 / 12%);
        }

        // top left cell
        > tr:nth-child(1) > th {
            position: sticky;
            position: -webkit-sticky;
            top: 0;
            left: 0;
            z-index: 2;
        }
    }
}
</style>

<script>
export default {
    name: 'ViewVlanMatrix',
    computed: {
        apiStateParams() {
            return {
                entity: this.$route.query.entity,
                database: this.$route.query.db,
            };
        },
    },
    watch: {
        apiStateParams: {
            immediate: true,
            handler(cur, prev) {
                console.log('ViewVlanMatrix: watch/apiStateParams: cur =', cur, ', prev =', prev);

                if (this.$utils.eq(cur, prev)) {
                    console.log('ViewVlanMatrix, watch/apiStateParams: no change');
                    return;
                }
                if (!cur.entity || !cur.database) {
                    console.log('ViewVlanMatrix, watch/apiStateParams: skip required data');
                    return;
                }

                this.getData();
            },
        },
    },
    data() {
        return {
            devices: [],
            vlanIds: [],
            isLoading: false,
            tableHeight: undefined,
        };
    },
    methods: {
        /**
         * Lookup an entry by vlan id in the vlans array of a device.
         * @param {object} device - Device object, element of $data.devices
         * @param {number} vid - Vlan id to lookup in <device>
         * @returns {object|undefined} - Element of <device>.vlan matching
         *      the vlan id given in <vid>, undefined if not found
         */
        findDeviceVlanEntry(device, vid) {
            return device.vlan.find((vlanEntry) => vlanEntry.id === vid);
        },
        /**
         * Build the list of unique vlan ids accross all devices.
         * This function updates the $data.vlanIds array.
         */
        buildVlanIdsList() {
            let uniqVlanIds = {};

            this.devices.forEach((device) => {
                device.vlan.forEach((vlan) => {
                    uniqVlanIds[vlan.id] = vlan.id;
                })
            });

            this.vlanIds = Object.values(uniqVlanIds).sort((a, b) => a - b);
        },
        /**
         * Fetch data from the API, process it to make suitable for building
         * the vlan matrix.
         */
        getData() {
            const cmpDevice = (a, b) => {
                const aName = a.name?.toLowerCase();
                const bName = b.name?.toLowerCase();
                return aName === bName ? 0 : (aName < bName ? -1 : 1);
            };
            const url = this.$utils.getUpdatedApiUrl(this.apiStateParams, 'vlans');

            this.isLoading = true;
            this.$api.axiosData(url)
                .then((vlansResponse) => {
                    this.devices = vlansResponse.sort(cmpDevice);
                    this.buildVlanIdsList();
                })
                .catch(() => { /* use error handler from the api plugin */ })
                .finally(() => { this.isLoading = false; });
        },
        /**
         * Get class names for a device + vlan id cell.
         * @param {object} device - Device object, element of $data.devices (row)
         * @param {number} vid - Vlan id, element of $data.vlanIds (column)
         * @returns {string} - Class names to apply to the cell
         */
        getDeviceVlanClass(device, vid) {
            return device.vlan.find((vlanEntry) => vlanEntry.id === vid)
                ? 'vlan-found cell-' + vid
                : 'vlan-not-found cell-' + vid;
        },
        /**
         * Count devices having a given vlan id.
         * @param {number} vid - Vlan id to lookup on devices
         * @returns {number} - Number of switches having the given vlan id
         */
        countDevicesHavingVlanId(vid) {
            let amount = 0;

            this.devices.forEach((device) => {
                if (this.findDeviceVlanEntry(device, vid)) {
                    amount++;
                }
            });

            return amount;
        },
        /**
         * Handle the hovering of a VLAN cell
         * @param {string} cellId - The id of the cell to handle
         */
        onOverCell(cellId) {
            const columnCells = document.querySelectorAll('.cell-' + cellId);

            columnCells.forEach((element) => {
                if (!element.classList.contains('vlan-number')) {
                    element.setAttribute(
                        'style',
                        'filter: grayscale(10%) brightness(95%);-webkit-filter:  grayscale(10%) brightness(95%);'
                    );
                }
            });
        },
        /**
         * Handle the mouse leaving a VLAN cell
         * @param {string} cellId - The id of the cell to handle
         */
        onOutCell(cellId) {
            const columnCells = document.querySelectorAll('.cell-' + cellId);

            columnCells.forEach((element) => {
                if (!element.classList.contains('vlan-number')) {
                    element.removeAttribute('style');
                }
            });
        },
        /**
         * Compute and update optimal table height.
         */
        setTableHeight() {
            const tableVlan = document.getElementById('table-vlan');
            this.tableHeight = tableVlan
                ? window.innerHeight - tableVlan.getBoundingClientRect().top - 120
                : '100%';
        },
    },
    mounted() {
        this.$nextTick(() => this.setTableHeight());
        window.addEventListener('resize', this.setTableHeight);

        /* remove if this is too annoying */
        if (this.$route.query.search) {
            this.$ev.$emit('message', { type: 'info', title: 'VLAN matrix',
                text: 'Module does not support search', duration: 2000 });
        }
    },
    destroyed() {
        window.removeEventListener('resize', this.setTableHeight);
    },
};
</script>

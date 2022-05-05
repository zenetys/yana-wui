<template>
    <v-card class="elevation-2">
        <table id="table-vlan" :height="tableDimensions.height">
            <tbody>
                <tr>
                    <th rowspan="2"></th>
                </tr>
                <tr>
                    <th class="vlan-number">#vlans</th>
                    <th
                        scope="col"
                        v-for="formattedVlan in formattedVlans"
                        :key="formattedVlan.id"
                        :class="'cell-' + formattedVlan.id">
                        {{ formattedVlan.id }}
                    </th>
                </tr>
                <tr v-for="vlan in vlans" :key="vlan.id">
                    <th scope="row" class="font-weight-regular">
                        <router-link :to="$utils.getDeviceRoute(vlan.id, 'switch', $route, false)">
                            {{ vlan.name }}
                        </router-link>
                    </th>
                    <td
                        class="vlan-number"
                        :class="'cell-' + vlan.id"
                        @mouseover="onOverCell(vlan.id)"
                        @mouseout="onOutCell(vlan.id)">
                        {{ vlan.vlan.length }}
                    </td>
                    <td
                        v-for="formattedVlan in formattedVlans"
                        :key="formattedVlan.id"
                        :class="getVlanClass(vlan, formattedVlan)"
                        @mouseover="onOverCell(formattedVlan.id)"
                        @mouseout="onOutCell(formattedVlan.id)">
                        <span
                            v-if="findMatchingVlan(vlan.vlan, formattedVlan)"
                            :title="findMatchingVlan(vlan.vlan, formattedVlan).name">
                            {{ findMatchingVlan(vlan.vlan, formattedVlan).name }}
                        </span>
                    </td>
                </tr>
                <tr>
                    <th>#switches</th>
                    <td></td>
                    <td v-for="formattedVlan in formattedVlans" :key="`el-${formattedVlan.id}`">
                        {{ amountOfswitchesFromVlan(formattedVlan) }}
                    </td>
                </tr>
            </tbody>
        </table>

        <v-overlay :absolute="true" :opacity="0.5" color="#ffffff" :value="isLoading" class="overlay" z-index="9">
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
        > tr > th:nth-child(1),
        > tr:nth-child(2) > th {
            position: sticky;
            position: -webkit-sticky;
            z-index: 7;
            box-shadow: inset 0px -1px rgb(0 0 0 / 12%);
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
        }

        // top left cell
        > tr:nth-child(1) > th {
            position: sticky;
            position: -webkit-sticky;
            top: 0;
            left: 0;
            z-index: 8;
            background: rgb(255, 255, 255);
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
                search: this.$route.query.search,
            };
        },
        storeEntityDatabases() {
            return this.$mystore.getEntityDatabases();
        },
    },
    watch: {
        apiStateParams: {
            immediate: true,
            handler(newParams, oldParams) {
                if (oldParams) {
                    if (oldParams.database !== newParams.database) {
                        this.getVlans();
                    }
                }
            },
        },
        storeEntityDatabases: {
            immediate: true,
            async handler(newDatabases) {
                if (
                    this.apiStateParams.database &&
                    newDatabases.length > 0 &&
                    newDatabases.some((db) => db.id === this.apiStateParams.database)
                ) {
                    await this.getVlans();
                }
            },
        },
    },
    data() {
        return {
            vlans: [],
            formattedVlans: [],
            isLoading: false,
            tableDimensions: {},
        };
    },
    methods: {
        /**
         * Find a matching VLAN from an array of VLANs
         * @param {object[]} vlanArray - The array to search
         * @param {Object} vlanToMatch - The VLAN to match against
         * @returns {object|undefined} - If found in the array, the VLAN object
         */
        findMatchingVlan(vlanArray, vlanToMatch) {
            return vlanArray.find((vlan) => vlan.id === vlanToMatch.id);
        },
        /**
         * Format VLANs into a unique sorted array
         */
        formatVlans() {
            let filteredVlans = [];

            /* Push all unique VLANs into a filtered array */
            this.vlans.forEach((vlan) => {
                vlan.vlan.filter((subVlan) => {
                    if (!filteredVlans.some((fVlan) => fVlan.id === subVlan.id)) {
                        filteredVlans.push(subVlan);
                    }
                });
            });

            /* Sort the array */
            this.formattedVlans = filteredVlans.sort((a, b) => {
                return a.id - b.id;
            });
        },
        /**
         * @async
         * Fetch all VLANs from the API
         */
        async getVlans() {
            this.isLoading = true;

            const url = this.$utils.getUpdatedApiUrl(this.apiStateParams, 'vlans');
            const errorContext = 'Could not fetch VLANs from the server.';

            const vlansResponse = await this.$api.get(url, errorContext);

            this.vlans = vlansResponse.sort((a, b) => {
                if (a.name.toLowerCase() < b.name.toLowerCase()) {
                    return -1;
                } else if (a.name.toLowerCase() > b.name.toLowerCase()) {
                    return 1;
                }

                return 0;
            });

            this.formatVlans();
            this.isLoading = false;
        },
        /**
         * Get a class for a VLAN depending on its matching against another VLAN
         * @param {object} vlan - The VLAN to match
         * @param {object} formattedVlan - The VLAN to match against
         * @returns {string} - The class to apply to the VLAN
         */
        getVlanClass(vlan, formattedVlan) {
            return vlan.vlan.find((subVlan) => subVlan.id === formattedVlan.id)
                ? 'vlan-found cell-' + formattedVlan.id
                : 'vlan-not-found cell-' + formattedVlan.id;
        },
        /**
         * Calculate the number of switches for a given VLAN
         * @param {object} vlan - The VLAN to count
         * @returns {number} - The number of switches
         */
        amountOfswitchesFromVlan(vlan) {
            let amount = 0;

            this.vlans.forEach((subVlan) => {
                if (this.findMatchingVlan(subVlan.vlan, vlan)) {
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
         * Calculate and set the dimensions of the data table
         */
        setTableDimensions() {
            const tableVlan = document.getElementById('table-vlan');

            this.tableDimensions = tableVlan
                ? {
                      height: window.innerHeight - tableVlan.getBoundingClientRect().top - 130,
                  }
                : { height: '100%' };
        },
    },
    mounted() {
        this.setTableDimensions();

        window.addEventListener('resize', this.setTableDimensions);
    },
    destroyed() {
        window.removeEventListener('resize', this.setTableDimensions);
    },
};
</script>

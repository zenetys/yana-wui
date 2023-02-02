<template>
    <AutoTable
        :config="config"
    />
</template>

<style lang="scss" scoped>
::v-deep {
    /* color of icons in column flag */
    .cell_flag .mdi:not(.cp-span) {
        color: gray;
    }

    /* color of icons in swport column */
    .cell_swPort .mdi:not(.cp-span) {
        color: #1eb8ce;
    }

    /* personnalizable column width */
    .sizable {
        /* default max column width */
        .v-data-table__divider {
            max-width: 100px;
        }

        /* column specific constraints */
        .col_flag {
            width: 1px;
        }

        .col_ip,
        .col_mac {
            max-width: 130px;
            width: 130px;
        }

        .col_swPort {
            max-width: inherit;
        }

        @media (min-width: 1200px) {
            .col_name,
            .col_description {
                max-width: 200px;
            }

            .col_macVendor,
            .col_type {
                max-width: 100px;
            }
        }

        @media (min-width: 1500px) {
            .col_description {
                max-width: 500px;
            }
        }

    }

    .additional-ports-counter {
        font-size: 10px;
        font-style: italic;
        color: #666;
    }

    .z-flag + .z-flag {
        margin-left: 2px;
    }
}
</style>

<script>
import AutoTable from '@/components/AutoTable.vue';

/**
 * Compute the headers
 * @param {array<object>} headers
 */
function computeHeaders(headers) {
    headers.unshift({ value: 'flag' });
}

export default {
    name: 'ViewInventory',
    components: {
        AutoTable,
    },
    data() {
        return {
            config: {
                id: 'table-inventory-devices',
                api: '',
                height: 'auto',
                paginated: true,
                heightOffsets: [-120],
                customHeadersComputation: computeHeaders,
                dataReady: [],
                path: '',
                columns: {
                    flag: {
                        /**
                         * Format the flag column and apply different icons depending on device type
                         * @param {*} input -
                         * @param {object} tableItem - The table item to format the flag for
                         * @return {string} - An HTML element with the corresponding icon
                         */
                        formatHtml: (input, tableItem) => {
                            const type = this.$utils.unArray(tableItem.type)
                                ? this.$utils.unArray(tableItem.type).toLowerCase()
                                : '';
                            const descr = this.$utils.unArray(tableItem.description)
                                ? this.$utils.unArray(tableItem.description).toLowerCase()
                                : '';

                            const flags = [];
                            let flagType;

                            if (type) {
                                if (type.includes('switch'))
                                    flagType = '<span class="z-flag mdi mdi-swap-horizontal-bold"></span>';
                                else if (type.includes('router'))
                                    flagType = '<span class="z-flag mdi mdi-router"></span>';
                                else if (type.includes('wlan'))
                                    flagType = '<span class="z-flag mdi mdi-wifi"></span>';
                                else if (type.includes('phone'))
                                    flagType = '<span class="z-flag mdi mdi-phone"></span>';
                                else if (type.includes('print'))
                                    flagType = '<span class="z-flag mdi mdi-printer"></span>';
                            }
                            if (!flagType && descr) {
                                if (descr.includes('linux'))
                                    flagType = '<span class="z-flag mdi mdi-linux"></span>';
                                else if (descr.includes('windows'))
                                    flagType = '<span class="z-flag mdi mdi-microsoft-windows"></span>';
                                else if (descr.includes('print'))
                                    flagType = '<span class="z-flag mdi mdi-printer"></span>';
                            }
                            if (!flagType)
                                flagType = '<span class="z-flag mdi mdi-monitor-small"></span>';
                            flags.push(flagType);

                            for (let cb of this.flagFormatCallbacks)
                                cb(tableItem, flags);

                            return flags.join('');
                        },
                        formatText: this.$utils.unArray,
                        isHtml: true,
                        cssClass: () => 'nocp',
                        label: '',
                        sortable: false,
                        truncable: false,
                    },
                    id: {
                        formatText: this.$utils.unArray,
                        enabled: false,
                    },
                    ip: {
                        /**
                         * Format the IP and create a link to the corresponding device
                         * @param {string} input
                         * @param {object} tableItem - the corresponding table item
                         * @return {string} - The formatted IP as an anchor tag linking to a device
                         */
                        formatHtml: (input, tableItem) => {
                            const inputValue = this.$utils.unArray(input);

                            if (inputValue) {
                                const type = this.$utils.unArray(tableItem.type);

                                if (type && type.toLowerCase().includes('switch')) {
                                    return this.fetchDeviceAnchorTag(tableItem.id, inputValue, 'switch');
                                }
                                return this.fetchDeviceAnchorTag(tableItem.id, inputValue, 'host');
                            }
                            return '';
                        },
                        formatText: this.$utils.unArray,
                        tooltip: (input) => {
                            if (Array.isArray(input)) {
                                return input.map((val) => val + '\n').join('');
                            }
                            return String(input);
                        },
                        sortable: (a, b, sortBy) => {
                            const ipA = a[sortBy]? a[sortBy][0] : "";
                            const ipB = b[sortBy] ? b[sortBy][0] : "";
                            const num1 = Number(ipA.split(".").map((num) => (`000${num}`).slice(-3) ).join(""));
                            const num2 = Number(ipB.split(".").map((num) => (`000${num}`).slice(-3) ).join(""));
                            return num1 < num2 ? 1 : -1;
                        },
                        label: 'IP',
                        isHtml: true,
                    },
                    name: {
                        /**
                         * Format the name and create a link to the corresponding device
                         * @param {string} input
                         * @param {object} tableItem - the corresponding table item
                         * @return {string} - The formatted name as an anchor tag linking to a device
                         */
                        formatHtml: (input, tableItem) => {
                            input = this.$utils.unArray(input);

                            if (input) {
                                const type = this.$utils.unArray(tableItem.type);

                                if (type && type.toLowerCase().includes('switch')) {
                                    return this.fetchDeviceAnchorTag(tableItem.id, input, 'switch');
                                }
                                return this.fetchDeviceAnchorTag(tableItem.id, input, 'host');
                            }
                            return '';
                        },
                        formatText: this.$utils.unArray,
                        isHtml: true,
                    },
                    location: {
                        formatText: this.$utils.unArray,
                    },
                    description: {
                        formatText: (input) => this.$utils.arrayLongest(input),
                        tooltip: (input) => this.$utils.arrayLongest(input),
                    },
                    type: {
                        formatText: this.$utils.unArray,
                    },
                    mac: {
                        formatText: this.$utils.unArray,
                    },
                    capabilities: {
                        formatText: this.$utils.unArray,
                    },
                    swPort: {
                        formatText: (input) => {
                            const item = this.$utils.unArray(input);
                            return item ? item['name'] + " " + item['iface'] : "";
                        },
                        /**
                         * Format the switch port value, create a link to the corresponding device,
                         * display the interface and the amount of additional ports
                         * @param {string} input
                         * @return {string} - The formatted switch port as an anchor tag linking to a device
                         */
                        formatHtml: (input) => {
                            const total = Array.isArray(input) ? input.length : input ? 1 : 0;
                            const firstValue = this.$utils.unArray(input);
                            let formatted = '<span class="nowrap">';

                            if (firstValue) {
                                formatted +=
                                    '<span class="mdi mdi-swap-horizontal-bold"></span>' +
                                    this.fetchDeviceAnchorTag(firstValue.id, firstValue.name, 'switch') +
                                    firstValue.iface;
                                if (total > 1)
                                    formatted += ` <span class="additional-ports-counter">(+${total - 1})</span>`;
                            }
                            formatted += '</span>';

                            return formatted;
                        },
                        /**
                         * Generate a tooltip for the switch port
                         * @param {any[]} inputs -
                         * @return {string} - The generated tooltip
                         */
                        tooltip: (inputs) => {
                            let tooltip = [];

                            if (inputs) {
                                tooltip = inputs.map((value) => {
                                    let current = value.name + ' ' + value.iface;

                                    if (value.count) {
                                        current += ' (' + value.count + ' mac' + (value.count > 1 ? 's' : '') + ')';
                                    }

                                    return current;
                                });
                            }
                            return tooltip.join('\n');
                        },
                        isHtml: true,
                    },
                    macVendor: {
                        formatText: this.$utils.unArray,
                    },
                }
            },
            /* allow hooking from mixins */
            flagFormatCallbacks: [],
        };
    },
    methods: {
        /**
         * Fetch an anchor tag for a given device
         * @param {string} deviceId - The device id
         * @param {string} label - The label to display in the anchor tag
         * @param {string} type - The type of the device
         * @return {string} The anchor tag generated for the device
         */
        fetchDeviceAnchorTag(deviceId, label, type) {
            return this.$utils.generateDeviceAnchorTag(deviceId, label, type, this.$route, this.$router);
        },
    },
    computed: {
        apiStateParams() {
            return {
                entity: this.$route.query.entity,
                database: this.$route.query.db,
                search: this.$route.query.search,
            };
        },
    },
    watch: {
        apiStateParams: {
            immediate: true,
            handler(cur, prev) {
                console.log('ViewInventory: watch/apiStateParams: cur =', cur, ', prev = ', prev);

                if (this.$utils.eq(cur, prev)) {
                    console.log('ViewInventory: watch/apiStateParams: no change');
                    return;
                }
                if (!cur.entity || !cur.database) {
                    console.log('ViewInventory: watch/apiStateParams: skip required data');
                    return;
                }

                this.config.api = this.$api.base._getInventory(cur.entity, cur.database, cur.search);
            },
        },
    },
};
</script>

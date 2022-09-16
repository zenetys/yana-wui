<template>
    <auto-table
        id="table-inventory-devices"
        :isPaginated="true"
        :api="apiUrl"
        array-data=""
        height="auto"
        :height-offsets="[-120]"
        :column-definition="columnDefinition"
        :custom-headers-computation="computeHeaders"
    />
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
import AutoTable from '@/components/AutoTable.vue';

export default {
    name: 'ViewInventory',
    components: {
        AutoTable,
    },
    data() {
        return {
            apiUrl: '',
            columnDefinition: {
                flag: {
                    /**
                     * Format the flag column and apply different icons depending on device type
                     * @param {*} input -
                     * @param {object} tableItem - The table item to format the flag for
                     * @return {string} - An HTML element with the corresponding icon
                     */
                    format: (input, tableItem) => {
                        const type = this.$utils.unArray(tableItem.type)
                            ? this.$utils.unArray(tableItem.type).toLowerCase()
                            : '';
                        const descr = this.$utils.unArray(tableItem.description)
                            ? this.$utils.unArray(tableItem.description).toLowerCase()
                            : '';

                        if (type) {
                            if (type.includes('switch')) return '<span class="mdi mdi-swap-horizontal-bold"></span>';
                            if (type.includes('router')) return '<span class="mdi mdi-router"></span>';
                            if (type.includes('wlan')) return '<span class="mdi mdi-wifi"></span>';
                            if (type.includes('phone')) return '<span class="mdi mdi-phone"></span>';
                            if (type.includes('print')) return '<span class="mdi mdi-printer"></span>';
                        }

                        if (descr) {
                            if (descr.includes('linux')) return '<span class="mdi mdi-linux"></span>';
                            if (descr.includes('windows')) return '<span class="mdi mdi-microsoft-windows"></span>';
                            if (descr.includes('print')) return '<span class="mdi mdi-printer"></span>';
                        }

                        return '<span class="mdi mdi-monitor-small"></span>';
                    },
                    isHtml: true,
                    getClass: () => 'nocp',
                },
                id: {
                    format: this.$utils.unArray,
                    hidden: true,
                },
                ip: {
                    /**
                     * Format the IP and create a link to the corresponding device
                     * @param {string} input
                     * @param {object} tableItem - the corresponding table item
                     * @return {string} - The formatted IP as an anchor tag linking to a device
                     */
                    format: (input, tableItem) => {
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
                    onHover: (input) => {
                        if (Array.isArray(input)) {
                            return input.map((val) => val + '\n').join('');
                        }
                        return String(input);
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
                    format: (input, tableItem) => {
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
                    isHtml: true,
                },
                location: {
                    format: this.$utils.unArray,
                },
                description: {
                    format: this.$utils.unArray,
                    getTooltip: (input) => {
                        return Array.isArray(input) ? input.join('\n') : '';
                    },
                },
                type: {
                    format: this.$utils.unArray,
                },
                mac: {
                    format: this.$utils.unArray,
                },
                capabilities: {
                    format: this.$utils.unArray,
                },
                swPort: {
                    /**
                     * Format the switch port value, create a link to the corresponding device,
                     * display the interface and the amount of additional ports
                     * @param {string} input
                     * @return {string} - The formatted switch port as an anchor tag linking to a device
                     */
                    format: (input) => {
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
                    getTooltip: (inputs) => {
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
                    format: this.$utils.unArray,
                },
            },
        };
    },
    methods: {
        /**
         * Compute the headers
         * @param {array<object>} headers
         */
        computeHeaders(headers) {
            headers.unshift({ value: 'flag' });
        },
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

                this.apiUrl = this.$utils.getUpdatedApiUrl(cur, 'devices');
            },
        },
    },
};
</script>

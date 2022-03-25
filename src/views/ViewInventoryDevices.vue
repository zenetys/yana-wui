<template>
    <auto-table
        v-if="apiUrl !== ''"
        id="table-inventory-devices"
        :pagination="true"
        :api="apiUrl"
        array-data=""
        height="auto"
        :height-offsets="[-120]"
        :column-definition="columnDefinition"
        :custom-headers-computation="computeHeaders"
        @error="onError"
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
                    format: (input, tableItem) => {
                        const type = unArray(tableItem.type) ? unArray(tableItem.type).toLowerCase() : '';
                        const descr = unArray(tableItem.description)
                            ? unArray(tableItem.description).toLowerCase()
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
                    format: unArray,
                    hidden: true,
                },
                ip: {
                    format: (input, tableItem) => {
                        const inputValue = unArray(input);

                        if (inputValue) {
                            const type = unArray(tableItem.type);

                            if (type && type.toLowerCase().includes('switch')) {
                                return '<a href="#/main/inventory/switch/' + tableItem.id + '">' + inputValue + '</a>';
                            }
                            return '<a href="#/main/inventory/host/' + tableItem.id + '">' + inputValue + '</a>';
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
                    format: (input, tableItem) => {
                        input = unArray(input);

                        if (input) {
                            const type = unArray(tableItem.type);

                            if (type && type.toLowerCase().includes('switch')) {
                                return '<a href="#/main/inventory/switch/' + tableItem.id + '">' + input + '</a>';
                            }
                            return '<a href="#/main/inventory/host/' + tableItem.id + '">' + input + '</a>';
                        }
                        return '';
                    },
                    isHtml: true,
                },
                location: {
                    format: unArray,
                },
                description: {
                    format: unArray,
                    getTooltip: (input) => {
                        return Array.isArray(input) ? input.join('\n') : '';
                    },
                },
                type: {
                    format: unArray,
                },
                mac: {
                    format: unArray,
                },
                capabilities: {
                    format: unArray,
                },
                swPort: {
                    format: (input) => {
                        const total = Array.isArray(input) ? input.length : input ? 1 : 0;
                        const firstValue = unArray(input);
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
                                formatted += ` <span class="additional-ports-counter">(+${total - 1})</span>`;
                        }
                        formatted += '</span>';

                        return formatted;
                    },
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
                    format: unArray,
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

            if (params.entity && params.database) {
                url +=
                    '/entity/' +
                    encodeURIComponent(params.entity) +
                    '/devices?database=' +
                    encodeURIComponent(params.database) +
                    '&q=' +
                    encodeURIComponent(params.search) +
                    '&short';
            }

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
        onError(payload) {
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

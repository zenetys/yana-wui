<template>
    <div>
        <AutoTable
            v-if="apiUrl !== '' && storeSearch !== ''"
            id="table-inventory-fdb"
            :isPaginated="true"
            :api="apiUrl"
            array-data=""
            height="auto"
            :height-offsets="[-120]"
            :column-definition="columnDefinition" />
        <span v-if="storeSearch === ''">Please enter something to search</span>
    </div>
</template>

<style scoped>
::v-deep .v-data-table__divider {
    position: relative;
}
</style>

<script>
import { mapGetters } from 'vuex';
import AutoTable from '@/components/AutoTable.vue';

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
                    format: this.$utils.unArray,
                    getTooltip: (input) => {
                        return input ? (Array.isArray(input) ? input.join('\n') : input) : '';
                    },
                    getStyle: () => 'color: #666;',
                },
                swName: {
                    /**
                     * Format the switch name to generate an anchor tag linking to the device
                     * @param {string} input - The switch name
                     * @param {object} tableItem - The corresponding table item
                     * @return {string} - The anchor tag for the switch name
                     */
                    format: (input, tableItem) => {
                        input = this.$utils.unArray(input);
                        return this.$utils.generateDeviceAnchorTag(
                            tableItem.swId,
                            input,
                            'switch',
                            this.$route,
                            this.$router
                        );
                    },
                    isHtml: true,
                },
                swIfUplink: {
                    /**
                     * Format the swIfUplink value to generate an anchor tag linking to the device
                     * @param {string} input - The device name
                     * @return {string} - The anchor tag generated
                     */
                    format: (input) => {
                        input = this.$utils.unArray(input);

                        let output = '';

                        if (input) {
                            output =
                                this.$utils.generateDeviceAnchorTag(
                                    input.id,
                                    input.name,
                                    'switch',
                                    this.$route,
                                    this.$router
                                ) + input.iface;
                        }
                        return output;
                    },
                    getTooltip: (inputs) => {
                        let tooltip = [];

                        if (inputs) {
                            tooltip = inputs.map((input) => input.name + ' ' + input.iface);
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

            if (params.entity && params.database) {
                url +=
                    '/entity/' +
                    encodeURIComponent(params.entity) +
                    '/fdb?database=' +
                    encodeURIComponent(params.database) +
                    '&q=' +
                    encodeURIComponent(params.search);
            }

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
        this.apiUrl = this.$utils.getUpdatedApiUrl(this.apiStateParams, 'fdb');
    },
};
</script>

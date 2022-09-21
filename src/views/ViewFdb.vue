<template>
    <div>
        <AutoTable
            v-if="apiUrl && apiStateParams.search"
            id="table-inventory-fdb"
            :isPaginated="true"
            :api="apiUrl"
            array-data=""
            height="auto"
            :height-offsets="[-120]"
            :column-definition="columnDefinition" />
        <span v-if="!apiStateParams.search">Please enter something to search</span>
    </div>
</template>

<style scoped>
::v-deep .v-data-table__divider {
    position: relative;
}
</style>

<script>
import AutoTable from '@/components/AutoTable.vue';

export default {
    name: 'ViewFdb',
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
                console.log('ViewFdb: watch/apiStateParams: cur =', cur, ', prev =', prev);

                if (this.$utils.eq(cur, prev)) {
                    console.log('ViewFdb: watch/apiStateParams: no change');
                    return;
                }
                if (!cur.entity || !cur.database || (cur.search ?? '') === '') {
                    console.log('ViewFdb: watch/apiStateParams: skip required data');
                    return;
                }

                this.apiUrl = this.$utils.getUpdatedApiUrl(cur, 'fdb');
            },
        },
    },
};
</script>

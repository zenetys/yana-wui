<template>
    <div>
        <AutoTable
            v-if="apiStateParams.search"
            :config="config"
        />
        <span v-if="!apiStateParams.search">Please enter something to search</span>
    </div>
</template>

<style scoped>
/* default sizing */
::v-deep .sizable .col_swName {
    width: 15%;
}
::v-deep .sizable .col_fdbMac {
    width: 8%;
}
::v-deep .sizable .col_fdbVlan {
    width: 5%;
}
::v-deep .sizable .col_fdbMacDip {
    width: 8%;
}
::v-deep .sizable .col_swIfTotalMac {
    width: 5%;
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
            config: {
                id: 'table-inventory-fdb',
                api: '',
                height: 'auto',
                paginated: true,
                heightOffsets: [-120],
                path: '',
                columns: {
                    swId: {
                        enabled: false,
                    },
                    fdbMacDid: {
                        enabled: false,
                    },
                    fdbMacDip: {
                        formatText: this.$utils.unArray,
                        tooltip: (input) => {
                            return input ? (Array.isArray(input) ? input.join('\n') : input) : '';
                        },
                        cssStyle: () => 'color: #666;',
                    },
                    swName: {
                        formatText: this.$utils.unArray,
                        /**
                         * Format the switch name to generate an anchor tag linking to the device
                         * @param {string} input - The switch name
                         * @param {object} tableItem - The corresponding table item
                         * @return {string} - The anchor tag for the switch name
                         */
                        formatHtml: (input, tableItem) => {
                            input = this.$utils.unArray(input);
                            return this.$utils.generateDeviceAnchorTag(
                                tableItem.swId,
                                input,
                                'switch',
                                this.$route,
                                this.$router
                            );
                        },
                    },
                    swIfUplink: {
                        formatText: (input) => {
                            const item = this.$utils.unArray(input)
                            return item ? item.name + ' ' + item.iface : '';
                        },
                        /**
                         * Format the swIfUplink value to generate an anchor tag linking to the device
                         * @param {string} input - The device name
                         * @return {string} - The anchor tag generated
                         */
                        formatHtml: (input) => {
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
                        tooltip: (inputs) => {
                            let tooltip = [];

                            if (inputs) {
                                tooltip = inputs.map((input) => input.name + ' ' + input.iface);
                            }

                            return tooltip.join('\n');
                        },
                    },
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

                this.config.api = this.$api.base._getFdb(cur.entity, cur.database, cur.search);
            },
        },
    },
};
</script>

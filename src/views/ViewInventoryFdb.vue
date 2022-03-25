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
            :column-definition="columnDefinition"
        />
        <span v-if="storeSearch === ''">Please enter something to search</span>
    </div>
</template>

<style scoped>
::v-deep .v-data-table__divider {
    position: relative;
}
</style>

<script>
import AutoTable from '@/components/AutoTable';
import { mapGetters } from 'vuex';
import { unArray } from '@/plugins/utils';

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
                    format: unArray,
                    getTooltip: (input) => {
                        return input ? (Array.isArray(input) ? input.join('\n') : input) : '';
                    },
                    getStyle: () => 'color: #666;',
                },
                swName: {
                    format: (input, tableItem) => {
                        input = unArray(input);

                        return '<a href="#/main/inventory/switch/' + tableItem.swId + '"> ' + input + ' </a>';
                    },
                    isHtml: true,
                },
                swIfUplink: {
                    format: (input) => {
                        input = unArray(input);

                        let output = '';

                        if (input) {
                            output =
                                '<a href="#/main/inventory/switch/' +
                                input.id +
                                '"> ' +
                                input.name +
                                '</a> ' +
                                input.iface;
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
        this.updateApiUrl();
    },
};
</script>

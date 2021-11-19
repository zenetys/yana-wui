<template>
    <div>
        <AutoTable
            v-if="apiUrl != '' && storeSearch!==''"
            id="table-inventory-fdb"
            :pagination="true"
            :api="apiUrl"
            array_data=""
            table_height="auto"
            :auto_table_height_extra="[-120]"
            :column_definition="columnDefinition" />
            <span v-if="storeSearch==''">Please enter something to search</span>
    </div>
</template>

<style  scoped>
    ::v-deep .v-data-table__divider {
        position: relative;
    }
</style>

<script>
import AutoTable from '@/components/AutoTable';
import { mapGetters } from 'vuex';

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
                    format: (v) => {
                        return Array.isArray(v) ? v[0] : v;
                    },
                    tooltip: (v) => {
                        if (Array.isArray(v)) {
                            return v.join('\n');
                        }
                        else if (v) {
                            return v;
                        }
                        return '';
                    },
                    style: () => 'color: #666;'
                },
                swName: {
                    format: (v, o) => {
                        v = Array.isArray(v) ? v[0] : v;
                        return '<a href="#/main/inventory/switch/'+o.swId+'"> '+ v +' </a>';
                    },
                    html: true,
                },
                swIfUplink: {
                    format: (v) => {
                        v = Array.isArray(v) ? v[0] : v;
                        if (v) {
                            return '<a href="#/main/inventory/switch/'+ v.id +'"> '+ v.name +'</a> ' + v.iface;
                        }
                        return v;
                    },
                    tooltip: (v) => {
                        let out = [];
                        if (v) {
                            for (let i of v) {
                                var current = i.name+ ' ' + i.iface;
                                out.push(current);
                            }
                        }
                        return out.join('\n');
                    },
                    html: true,
                },
            },
        }
    },
    methods: {
        updateApiUrl() {
            let params = this.apiStateParams;
            let url = '';
            if (params.entity && params.database)
                url += '/entity/' + encodeURIComponent(params.entity) +
                    '/fdb?database=' + encodeURIComponent(params.database) +
                    '&q=' + encodeURIComponent(params.search);
            this.apiUrl = url;
        },
    },
    computed: {
        ...mapGetters([
            'storeEntity',
            'storeDatabase',
            'storeSearch',
        ]),
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
            if (cur.entity != prev.entity) {
                return;
            }
            this.updateApiUrl();
        }
    },
    mounted() {
        this.updateApiUrl();
    }
}
</script>

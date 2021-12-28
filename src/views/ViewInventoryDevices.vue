<template>
    <div>
        <auto-table
            v-if="apiUrl != ''"
            id="table-inventory-devices"
            :pagination="true"
            :api="apiUrl"
            array-data=""
            height="auto"
            :auto-table-height-extra="[-120]"
            :column-definition="columnDefinition"
            :headers-computation="onHeadersComputation"
            @error="onErrorOccurs">
        </auto-table>
    </div>
</template>

<style lang="scss" scoped>
/* color of icons in column flag */
::v-deep .col_flag .mdi:not(.cp-span) {
    color: gray;
}

/* color of icons in swport column */
::v-deep .col_swPort .mdi:not(.cp-span) {
    color: #1eb8ce;
}

/* column default max width */
::v-deep .v-data-table__divider {
    max-width:100px;
}

::v-deep .v-data-table__divider.col_flag { width: 1px; }
::v-deep .v-data-table__divider.col_ip { max-width: 130px; width: 130px; }
::v-deep .v-data-table__divider.col_mac { max-width: 130px; width: 130px; }
::v-deep .v-data-table__divider.col_swPort { max-width: inherit; }

@media (min-width: 1200px) {
::v-deep .v-data-table__divider.col_name { max-width:200px; }
::v-deep .v-data-table__divider.col_description { max-width: 200px; }
::v-deep .v-data-table__divider.col_macVendor { max-width: 100px; }
::v-deep .v-data-table__divider.col_type { max-width: 100px; }
}

@media (min-width: 1500px) {
::v-deep .v-data-table__divider.col_description { max-width: 500px; }
}


/* truncate text in columns */
::v-deep .v-data-table__divider > span:not(.cp-span) {
    /* nowrap is set by default in autotable */
    overflow: hidden;
    text-overflow: ellipsis;
}

::v-deep .more {
    font-size: 10px;
    font-style: italic;
    color: #666;
}
</style>

<script>
import AutoTable from '@/components/AutoTable';
import { mapGetters } from 'vuex';

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
                    format: (v, o) => {
                        v = Array.isArray(v) ? v[0] : v;
                        let type = Array.isArray(o.type) ? o.type[0] : o.type;
                        let descr = Array.isArray(o.description) ? o.description[0] : o.description;
                        if (type) {
                            if (type.toLowerCase().indexOf('switch') > -1)
                                return '<span class="mdi mdi-swap-horizontal-bold"></span>';
                            if (type.toLowerCase().indexOf('router') > -1)
                                return '<span class="mdi mdi-router"></span>';
                            if (type.toLowerCase().indexOf('wlan') > -1)
                                return '<span class="mdi mdi-wifi"></span>';
                            if (type.toLowerCase().indexOf('phone') > -1)
                                return '<span class="mdi mdi-phone"></span>';
                            if (type.toLowerCase().indexOf('print') > -1)
                                return '<span class="mdi mdi-printer"></span>';
                        }
                        if (descr) {
                            if (descr.toLowerCase().indexOf('linux') > -1)
                                return '<span class="mdi mdi-linux"></span>';
                            if (descr.toLowerCase().indexOf('windows') > -1)
                                return '<span class="mdi mdi-microsoft-windows"></span>';
                            if (descr.toLowerCase().indexOf('print') > -1)
                                return '<span class="mdi mdi-printer"></span>';
                        }
                        return '<span class="mdi mdi-monitor-small"></span>';
                    },
                    html: true,
                    tdClass: () => 'nocp'
                },
                id: {
                    format: (v) => Array.isArray(v) ? v[0] : v,
                    hidden: true,
                },
                ip: {
                    format: (v, o) => {
                        v = Array.isArray(v) ? v[0] : v;
                        if (v) {
                            let type = Array.isArray(o.type) ? o.type[0] : o.type;
                            if (type) {
                                if (type.toLowerCase().indexOf('switch') > -1)
                                    return '<a href="#/main/inventory/switch/'+o.id+'">' + v + '</a>';
                            }
                            return '<a href="#/main/inventory/host/'+o.id+'">' + v + '</a>';
                        }
                        return '';
                    },
                    onHover: (value) => {
                        if (Array.isArray(value)) {
                            let res = '';
                            for (let i = 0; i < value.length; i++) {
                                res+= value[i]+'\n'
                            }
                            return res;
                        }
                        return ''+value;
                    },
                    label: 'IP',
                    html: true,
                },
                name: {
                    format: (v, o) => {
                        v = Array.isArray(v) ? v[0] : v;
                        if (v) {
                            let type = Array.isArray(o.type) ? o.type[0] : o.type;
                            if (type) {
                                if (type.toLowerCase().indexOf('switch') > -1)
                                    return '<a href="#/main/inventory/switch/'+o.id+'">' + v + '</a>';
                            }
                            return '<a href="#/main/inventory/host/'+o.id+'">' + v + '</a>';
                        }
                        return '';
                    },
                    html: true,
                },
                location: {
                    format: (v) => Array.isArray(v) ? v[0] : v,
                },
                description: {
                    format: (v) => {
                        v = Array.isArray(v) ? v[0] : v;
                        return v;
                    },
                    tooltip: (v) => {
                        return (Array.isArray(v)) ? v.join('\n') : '';
                    }
                },
                type: {
                    format: (v) => Array.isArray(v) ? v[0] : v,
                },
                mac: {
                    format: (v) => Array.isArray(v) ? v[0] : v,
                },
                capabilities: {
                    format: (v) => Array.isArray(v) ? v[0] : v,
                },
                swPort: {
                    format: (v) => {
                        let total = Array.isArray(v) ? v.length : (v ? 1 : 0);
                        let first = Array.isArray(v) ? v[0] : v;
                        let out = '<span class="nowrap">';
                        if (first) {
                            out += '<span class="mdi mdi-swap-horizontal-bold"></span> <a href="#/main/inventory/switch/' + first.id +'">' + first.name + '</a> ' + first.iface;
                            if (total > 1)
                                out += ` <span class="more">(+${total-1})</span>`;
                        }
                        out += '</span>';
                        return out;
                    },
                    tooltip: (v) => {
                        let out = [];
                        // v = Array.isArray(v) ? v[0] : v;
                        if (v) {
                            for (let i of v) {
                                var current = i.name+ ' ' + i.iface;
                                if (i.count!==undefined)
                                    current+=' ('+i.count+' mac'+ (i.count>1?'s':'') +')';
                                out.push(current);
                            }
                        }
                        return out.join('\n');
                    },
                    html: true,
                },
                macVendor: {
                    format: (v) => Array.isArray(v) ? v[0] : v,
                }
            },
        }
    },
    methods: {
        updateApiUrl() {
            let params = this.apiStateParams;
            let url = '';
            if (params.entity && params.database)
                url += '/entity/' + encodeURIComponent(params.entity) +
                    '/devices?database=' + encodeURIComponent(params.database) +
                    '&q=' + encodeURIComponent(params.search) + '&short';
            console.log('updateApiUrl', url);
            this.apiUrl = url;
        },
        onHeadersComputation(headerArray/*, items*/) {
            headerArray.unshift({ text: '', value: 'flag' });
        },
        onErrorOccurs(payload) {
            this.$store.commit('EDIT_STORE_INFO_MESSAGE', payload);
        }
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
            console.log('watch apiStateParams', cur, prev);
            if (cur.entity != prev.entity) {
                console.log('watch apiStateParams: entity changed, discard event');
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

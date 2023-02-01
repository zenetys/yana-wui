<template>
    <AutoTable
        :config="config"
    />
</template>

<style lang="scss" scoped>
::v-deep {
    .z-warning {
        background-color: #ffe4a8 !important;
        border-color: #f2dfab !important;
    }
    .z-critical {
        background-color: #fac8d1 !important;
        border-color: #ebbfbb !important;
    }
}
</style>

<script>
import AutoTable from '@/components/AutoTable.vue';

export default {
    name: 'ViewBackupIndex',
    components: {
        AutoTable,
    },
    data() {
        return {
            config: {
                id: 'table-backup-index',
                api: '',
                height: 'auto',
                paginated: true,
                heightOffsets: [-13],
                search: '',
                dataReady: [ this.onTableDataReady ],
                columns: {
                    device: {
                        order: 200,
                        formatHtml: (input) => {
                            const linkRoute = {
                                name: 'ViewBackupDetail',
                                params: { name: input },
                                query: this.$route.query,
                            };
                            const linkText = this.$utils.simplifyDeviceName(input);
                            return `<a href="${this.$router.resolve(linkRoute).href}">${linkText}</a>`;
                        },
                    },
                    mtime: {
                        order: 300,
                        label: 'Last run',
                        formatText: (input) => this.$utils.formatDate(input * 1000, {
                            tzOffset: false,
                            timeSeparator: ' ',
                            milliseconds: false,
                        }),
                        sortable: AutoTable.utils.cmpInt,
                    },
                    age: {
                        order: 400,
                        formatText: (input, tableItem) => this.$utils.formatDuration(tableItem.age),
                        cssClass: (tableItem) => {
                            if (tableItem.age > 86400*3)
                                return 'z-critical';
                            if (tableItem.age > 86400*2)
                                return 'z-warning';
                            return '';
                        },
                        sortable: AutoTable.utils.cmpInt,
                    },
                    size: {
                        order: 500,
                        formatText: (input) => this.$utils.formatNumber(input, 1024, ' ') + 'iB',
                        cssClass: (tableItem) => (tableItem.size == 0) ? 'z-critical' : '',
                        sortable: AutoTable.utils.cmpInt,
                    },
                    type: {
                        order: 600,
                        label: 'Mode',
                    },
                    state: {
                        order: 700,
                        cssClass: (tableItem) => (tableItem.state == 'active') ? '' : 'z-critical',
                    },
                    comment: {
                        order: 800,
                    },
                },
            },
        };
    },
    methods: {
        onTableDataReady(data) {
            const now = new Date().getTime() / 1000;
            data.forEach((e) => {
                e.age = now - e.mtime;
                switch (e.state) {
                    case 'active': break;
                    case 'up': e.state = 'active'; break;
                    default: e.state = 'disabled'; break;
                }
            });
        },
    },
    computed: {
        apiStateParams() {
            return {
                entity: this.$route.query.entity,
            };
        },
    },
    watch: {
        apiStateParams: {
            immediate: true,
            handler(cur, prev) {
                console.log('ViewBackupIndex: watch/apiStateParams: cur =', cur, ', prev =', prev);

                if (this.$utils.eq(cur, prev)) {
                    console.log('ViewBackupIndex: watch/apiStateParams: no change');
                    return;
                }
                if (!cur.entity) {
                    console.log('ViewBackupIndex: watch/apiStateParams: skip required data');
                    return;
                }

                this.config.api = this.$api.backup._getStats(this.$route.query.entity);
            },
        },
        '$route.query.search': {
            immediate: true,
            handler(cur) {
                this.config.search = cur;
            }
        },
    },
};
</script>

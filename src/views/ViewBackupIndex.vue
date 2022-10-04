<template>
    <AutoTable
        id="table-backup-index"
        :isPaginated="true"
        :api="api"
        height="auto"
        :height-offsets="[-13]"
        :column-definition="columnDefinition"
        :search="$route.query.search"
        :on-data-ready-sync="[ onTableDataReady ]"
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
            api: undefined,
            columnDefinition: {
                device: {
                    order: 200,
                    isHtml: true,
                    format: (input) => {
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
                    format: (input) => this.$utils.formatDate(input * 1000, {
                        tzOffset: false,
                        timeSeparator: ' ',
                        milliseconds: false,
                    }),
                },
                age: {
                    order: 400,
                    format: (input, tableItem) => this.$utils.formatDuration(tableItem.age),
                    getClass: (tableItem) => {
                        if (tableItem.age > 86400*3)
                            return 'z-critical';
                        if (tableItem.age > 86400*2)
                            return 'z-warning';
                        return '';
                    },
                },
                size: {
                    order: 500,
                    format: (input) => this.$utils.formatNumber(input, 1024, ' ') + 'iB',
                    getClass: (tableItem) => (tableItem.size == 0) ? 'z-critical' : '',
                },
                type: {
                    order: 600,
                    label: 'Mode',
                },
                state: {
                    order: 700,
                    getClass: (tableItem) => (tableItem.state == 'active') ? '' : 'z-critical',
                },
                comment: {
                    order: 800,
                },
            },
        };
    },
    methods: {
        onTableDataReady(data) {
            const now = new Date().getTime() / 1000;
            data.forEach((e) => {
                e.age = now - e.mtime;
                e.state = (e.state === 'up') ? 'active' : 'disabled';
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

                this.api = this.$api.backup._getStats(this.$route.query.entity);
            },
        },
    },
};
</script>

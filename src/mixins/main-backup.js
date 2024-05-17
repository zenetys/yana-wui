export default {
    methods: {
        storeBackupStats(data) {
            console.log('main-backup: storeBackupStats: data =', data);
            this.$set(this.$store.observable, 'entityBackupStats', data);
        }
    },
    watch: {
        '$route.query.entity': {
            immediate: true,
            handler(cur, prev) {
                /* skip if entity did not change */
                if (cur === prev)
                    return;

                /* reset */
                this.$set(this.$store.observable, 'entityBackupStats', undefined);

                /* skip if entity is empty or undefined */
                if ((cur ?? '') === '')
                    return;

                /* fetch backup data and store it */
                this.$api.backup.getStats(cur)
                    .then(this.storeBackupStats)
                    .catch(() => { /* notified by axios interceptor */ })
            },
        },
    },
    created() {
        if (!window.openTerminal) {
            const url = this.$api.jsonConfig.TTYD_URL || './ttyd';
            window.openTerminal = function (escapedTarget) {
                window.open(
                    url + '?arg=' + escapedTarget,
                    'ttyd: ' + unescape(escapedTarget),
                    'location=no,toolbar=no,directories=no,menubar=no,resizable=yes,' +
                        'scrollbars=yes,status=no,width=800,height=600');
            }
        }
    },
}

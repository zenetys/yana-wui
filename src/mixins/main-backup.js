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
}

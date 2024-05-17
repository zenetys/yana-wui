export default {
    data: () => ({
        backupKey: undefined,
    }),

    watch: {
        backupJoinParams(cur) {
            if (!cur.deviceName || !cur.backupStats)
                return; // not ready, both must be set

            const key = this.$utils.simplifyDeviceName(cur.deviceName);
            for (const b of cur.backupStats) {
                const bkey = this.$utils.simplifyDeviceName(b.device);
                if (bkey === key) {
                    this.backupKey = b.device;
                    break;
                }
            }
        },
    },
    computed: {
        backupJoinParams() {
            return {
                deviceName: this.deviceName,
                backupStats: this.$store.observable.entityBackupStats
            };
        },
    },
    created() {
        this.infoButtons.push({
            label: 'Go to backups',
            if: () => this.backupKey,
            icon: 'mdi-history',
            to: () => this.$utils.deriveRoute(
                {
                    name: 'ViewBackupDetail',
                    params: { name: this.backupKey, id: undefined }
                },
                this.$route),
        });
        if (this.$api.jsonConfig.TTYD_ENABLED) {
            this.infoButtons.push({
                label: 'Open terminal',
                if: () => this.backupKey,
                icon: 'mdi-console-line',
                click: () => window.openTerminal(escape(this.backupKey)),
            });
        }
    },
}

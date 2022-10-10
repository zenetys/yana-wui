export default {
    data: () => ({
        tableIndexForBackup: {},
        columnDefinition: {
            /* hide added property from the table */
            backup: { hidden: true },
        },
    }),

    watch: {
        '$store.observable.entityBackupStats'(cur) {
            if (cur)
                this.attachBackupInfo();
        }
    },
    methods: {
        onTableDataReadyForBackup(data) {
            data.forEach((e) => {
                const name = this.$utils.unArray(e.name);
                if (name) {
                    const key = this.$utils.simplifyDeviceName(name);
                    this.tableIndexForBackup[key] = e;
                }
            });
            this.attachBackupInfo();
        },

        attachBackupFlag(tableItem, flags) {
            if (tableItem.backup) {
                const linkRoute = {
                    name: 'ViewBackupDetail',
                    params: { name: tableItem.backup },
                    query: this.$route.query,
                };
                flags.push(`<a href="${this.$router.resolve(linkRoute).href}">` +
                    '<span class="z-flag mdi mdi-history"/></a>');

                if (this.$api.jsonConfig.TTYD_ENABLED) {
                    // FIXME: ugly escape...
                    flags.push(`<a href="javascript:openTerminal('${escape(tableItem.backup)}');">` +
                        '<span class="z-flag mdi mdi-console-line"/></a>');
                }
            }
        },

        /**
         * Attach backup info to table items.
         *
         * The backup data is coming from the backup API, table items are coming
         * from the base API. For each backup entry, lookup of its corresponding
         * table object is made using the <tableIndexForBackup> index. Device
         * names in both API do not necessarily match, hence the normalization
         * of each names with simplifyDeviceName() to get a join key.
         */
        attachBackupInfo() {
            if (!this.$store.observable.entityBackupStats) {
                console.log('inventory-backup: attachBackupInfo: backup data not ready');
                return;
            }
            if (!this.tableIndexForBackup) {
                console.log('inventory-backup: attachBackupInfo: table data not ready');
                return;
            }
            this.$store.observable.entityBackupStats.forEach((e) => {
                const key = this.$utils.simplifyDeviceName(e.device);
                if (this.tableIndexForBackup[key])
                    this.$set(this.tableIndexForBackup[key], 'backup', e.device);
            });
        },
    },
    created() {
        console.log('inventory-backup: register callbacks');
        this.dataReadyCallbacks.push(this.onTableDataReadyForBackup);
        this.flagFormatCallbacks.push(this.attachBackupFlag);
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

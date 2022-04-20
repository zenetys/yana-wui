<template>
    <div>
        <v-row no-gutters>
            <v-col cols="5">
                <v-card class="elevation-1 mb-3">
                    <div class="intro" style="">
                        configs/{{ $route.params.name }}
                    </div>

                    <AutoTable
                        :api="apiLog"
                        height=""
                        width=""
                        :column-definition="columnsLog"
                        :custom-headers-computation="computeLogHeaders"
                        :on-data-ready-sync="[ onLogDataReady ]"
                        :activeCopyCellContent="false"
                        class="commit-log"
                        :item-class="getLogRowClass"
                        :item-click="onLogRowClick"
                    >
                        <template v-slot:render-cell-lines="{ value, item }">
                            <span class="removed">{{ item.deletion }}</span>
                            <span>/</span>
                            <span class="added">{{ item.insertion }}</span>
                        </template>
                    </AutoTable>
                </v-card>

                <v-card class="elevation-1">
                    <pre
                        class="commit-diff"
                        v-html="diff2html(dataDiff)"
                    />
                    <v-overlay
                        :value="isLoading"
                        :absolute="true"
                        :opacity="0.3"
                        color="#ffffff"
                    />
                </v-card>
            </v-col>

            <v-col cols="7">
                <v-card class="elevation-1 ml-3">
                    <v-btn
                        @click="$utils.copyToClipboard(dataShow)"
                        :disabled="!dataShow || dataShow.length === 0"
                        :style="getCopyButtonStyle()"
                        @mousedown="$event.preventDefault()"
                        fab
                        x-small
                        color="secondary"
                        class="copy-button elevation-0"
                    >
                        <v-icon small>mdi-content-copy</v-icon>
                    </v-btn>

                    <pre
                        class="commit-show"
                        ref="refCommitShow"
                        v-html="lines2html(dataShow)"
                    />
                    <v-overlay
                        :value="isLoading"
                        :absolute="true"
                        :opacity="0.3"
                        color="#ffffff"
                    />
                </v-card>
            </v-col>
        </v-row>
    </div>
</template>

<style scoped lang="scss">
.intro {
    background-color: #e5e5e5;
    font-weight: bold;
    height: 25px;
    display: flex;
    align-items: center;
    padding: 0px 6px;
    font-size: 0.8rem;
}

.commit-log ::v-deep .v-data-table__wrapper {
    height: 25vh;
    height: calc(25vh - 25px);
}

/* XXX It is difficult to customize AutoTable style because of how styles
 * XXX are wrtitten in AutoTable. Need style cleanup in AutoTable! */
.commit-log ::v-deep .auto-table td * {
    font-size: 0.7rem;
    line-height: 0.7rem;
}
.commit-log ::v-deep .auto-table td {
    padding-top: 4px !important;
    padding-bottom: 3px !important;
}

.commit-log ::v-deep .auto-table tr {
    cursor: pointer;
}
.commit-log ::v-deep .auto-table tr.active-commit td.col_date {
    border-right-color: #0f6e84;
    border-right-width: 2px;
}
.commit-log ::v-deep .auto-table tr.active-commit td.col_subject {
    color: #0f6e84;
}

.commit-log ::v-deep .col_date { color: #444; }
.commit-log ::v-deep .col_author { color: #444; }
.commit-log .col_lines .added { color: green; }
.commit-log .col_lines .removed { color: red; }

.commit-diff {
    height: calc(75vh - 76px - 12px);
    font-size: 0.66rem;
    line-height: 0.8rem;
    padding: 6px;
    overflow: auto;
}

.commit-diff ::v-deep .diff-meta { color: gray; }
.commit-diff ::v-deep .diff-file { font-weight: bold; }
.commit-diff ::v-deep .diff-hunk { color: #0000B6; }
.commit-diff ::v-deep .diff-del { color: red; }
.commit-diff ::v-deep .diff-add { color: green; }

.commit-show {
    height: calc(100vh - 76px);
    font-size: 0.66rem;
    line-height: 0.8rem;
    padding: 6px;
    overflow: auto;
}

.commit-show ::v-deep .lines {
    display: table-row;
}
.commit-show ::v-deep .lines > ul {
    display: table-cell;
    list-style-type: none;
    padding: 0;
}
.commit-show ::v-deep .lines > ul:first-child {
    text-align: right;
    color: #b8b8b8;
    border-right: 1px solid #ccc;
    padding-right: 6px;
}
.commit-show ::v-deep .lines > :not(ul:first-child) {
    padding-left: 10px;
}
.commit-show ::v-deep .lines > ul > li {
    display: inline;
}

.copy-button {
    position: absolute;
    /* bottom: <dynamic>; */
    /* right: <dynamic>; */
    color: #fff;
}
</style>

<script>
import AutoTable from '@/components/AutoTable.vue';

const htmlize = (raw) => raw.replace(/&/g, '&amp;')
                            .replace(/>/g, '&gt;')
                            .replace(/</g, '&lt;')
                            .replace(/"/g, '&quot;');

export default {
    name: 'ViewBackupDetail',
    components: {
        AutoTable,
    },
    data() {
        return {
            apiLog: undefined,
            columnsLog: {
                id: { hidden: true },
                deletion: { hidden: true },
                insertion: { hidden: true },
                date: {
                    label: 'Age',
                    order: 100,
                    format: (value) => {
                        value = value.replace(' ', 'T').replace(' ', '');
                        const now = new Date().getTime();
                        const commitDate = new Date(value).getTime();
                        return this.$utils.formatDuration((now - commitDate) / 1000);
                    },
                    getTooltip: (value) => this.$utils.formatDate(value, {
                        tzOffset: false,
                        timeSeparator: ' ',
                        milliseconds: false,
                    }),
                },
                subject: {
                    order: 200,
                },
                author: {
                    order: 300,
                },
                lines: {
                    order: 400,
                    slotName: 'render-cell-lines',
                },
            },
            dataDiff: undefined,
            dataShow: undefined,
            isLoading: false,
        };
    },
    methods: {
        /**
         * Add headers for custom columns
         * @param {array<object>} Headers precomputed from data.
         */
        computeLogHeaders(headers) {
            headers.push({ value: 'lines' });
        },
        /* Dynamic positionning of the copy button.
         * It does not get (re)evaluated that often... */
        getCopyButtonStyle() {
            const scrollHeight = this.$refs.refCommitShow?.scrollHeight;
            const clientHeight = this.$refs.refCommitShow?.clientHeight;
            const scrollWidth = this.$refs.refCommitShow?.scrollWidth;
            const clientWidth = this.$refs.refCommitShow?.clientWidth;
            return (scrollHeight > clientHeight ? 'right: 27px;' : 'right: 11px;') +
                ' ' + (scrollWidth > clientWidth ? 'bottom: 27px;' : 'bottom: 11px;');
        },
        diff2html(rawDiff) {
            if (typeof rawDiff !== 'string' || rawDiff.length === 0)
                return 'No commit diff';
            const lines = htmlize(rawDiff).split('\n');
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].startsWith('--- ') || lines[i].startsWith('+++ '))
                    lines[i] = '<span class="diff-file">' + lines[i] + '</span>';
                else if (lines[i].startsWith('@@ '))
                    lines[i] = '<span class="diff-hunk">' + lines[i] + '</span>';
                else if (lines[i].charAt(0) === '-')
                    lines[i] = '<span class="diff-del">' + lines[i] + '</span>';
                else if (lines[i].charAt(0) === '+')
                    lines[i] = '<span class="diff-add">' + lines[i] + '</span>';
                else if (lines[i].length > 0 && lines[i].charAt(0) !== ' ')
                    lines[i] = '<span class="diff-meta">' + lines[i] + '</span>';
            }
            return lines.join('\n');
        },
        lines2html(rawData) {
            if (typeof rawData !== 'string' || rawData.length === 0)
                return 'No commit data';
            const lines = htmlize(rawData).split('\n');
            if (rawData.endsWith('\n'))
                lines.pop();
            return '<div class="lines">' +
                   '<ul>' + lines.map((e, i) => `<li>${i+1}</li>`).join('\n') + '</ul>' +
                   '<ul>' + lines.map((e) => `<li>${e}</li>`).join('\n') + '</ul>' +
                   '</div>';
        },
        getLogRowClass(rowItem) {
            return (rowItem.id === this.$route.params.id)
                ? 'active-commit' : '';
        },
        onLogRowClick(item) {
            this.$router.push(this.$utils.deriveRoute({ params: { id: item.id } }, this.$route))
                .catch(() => { /* ignore NavigationDuplicated, would prefer force refresh */ });
        },
        onLogDataReady(data) {
            if (!this.$route.params.id && data.length > 0 && data[0].id)
                this.$router.replace(this.$utils.deriveRoute({ params: { id: data[0].id } }, this.$route));
        },
        onCtrlA(event) {
            if (!window.getSelection) {
                console.log('ViewBackupDetail: onCtrlA: window.getSelection not supported');
                return;
            }
            console.log('ViewBackupDetail: onCtrlA: select commit data, prevent default');
            event.preventDefault();
            window.getSelection().removeAllRanges();
            const node = document.querySelector('.commit-show .lines > :not(ul:first-child)');
            const range = document.createRange();
            range.selectNode(node);
            window.getSelection().addRange(range);
        },
    },
    computed: {
        commitStateParams() {
            return {
                name: this.$route.params.name,
                id: this.$route.params.id,
            };
        },
    },
    watch: {
        '$route.query.entity'() {
            console.log('ViewBackupDetail: watch/$route.query.entity: entity change, redirect to backup index');
            this.$router.replace({ name: 'ViewBackupIndex', query: { ...this.$route.query } });
        },
        '$route.params.name': {
            immediate: true,
            handler(cur) {
                console.log('ViewBackupDetail: watch/$route.params.name: cur =', cur);
                this.apiLog = this.$api.backup.getLog(cur);
            }
        },
        commitStateParams: {
            immediate: true,
            handler(cur, prev) {
                console.log('ViewBackupDetail: watch/commitStateParams: cur =', cur, ', prev =', prev);

                if (this.$utils.eq(cur, prev)) {
                    console.log('ViewBackupDetail: watch/commitStateParams: no change');
                    return;
                }
                if (!cur.name || !cur.id) {
                    console.log('ViewBackupDetail: watch/commitStateParams: skip required data');
                    return;
                }

                this.isLoading = true;
                Promise.all([
                    this.$api.backup.getDiff(this.$route.params.name, this.$route.params.id),
                    this.$api.backup.getShow(this.$route.params.name, this.$route.params.id),
                ])
                .then(([dataDiff, dataShow]) => {
                    this.dataDiff = dataDiff;
                    this.dataShow = dataShow;
                })
                .catch(() => { /* notified by axios interceptor */ })
                .finally(() => { this.isLoading = false });
            },
        }
    },
    mounted() {
        this.$ev.$on('ctrl-a', this.onCtrlA);
    },
    destroyed() {
        this.$ev.$off('ctrl-a', this.onCtrlA);
    },
};
</script>

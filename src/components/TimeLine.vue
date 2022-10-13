<style scoped>
::v-deep .timeline-no-data {
    position: absolute;
    top: 0; bottom: 0; left: 0; right: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #fefefebb;
    padding-bottom: 25px;
}
::v-deep .timeline-no-data::before {
    content: "There is no database available!"
}
</style>

<script>
import 'chartjs-plugin-colorschemes';
import 'chartjs-plugin-zoom';
import { Line } from 'vue-chartjs';

/* 20211028: chartjs commit 484f0d1e518963436d5013f61001558ef9788edf in 2.9.4
 * breaks option scales.xAxes[0].maxRotation = 0. Use version 2.9.3 for now. */

export default {
    extends: Line,
    props: {
        databases: {
            type: Array,
            required: false,
        },
        value: {
            type: String,
            required: false,
        },
    },
    data() {
        return {
            chartdata: {
                datasets: [
                    {
                        data: [],
                        radius: 6,
                        fill: false,
                        borderWidth: 5,
                        backgroundColor: '#17b8ce',
                        borderColor: '#17b8ce',
                        pointHoverBackgroundColor: '#D100E4',
                        pointHoverBorderColor: '#D100E4',
                        pointHoverRadius: 13,
                        pointBackgroundColor: this.pointColorSetter,
                        pointBorderColor: this.pointColorSetter,
                    },
                ],
            },
            options: {
                animation: false,
                maintainAspectRatio: false,
                responsive: true,
                onClick: this.onTimeLineClick,
                title: { display: false },
                tooltips: {
                    titleMarginBottom: -2,
                    titleFontSize: 10,
                    xPadding: 4,
                    yPadding: 4,
                    caretPadding: 6,
                    callbacks: {
                        /* disable series value in tooltips */
                        label: () => undefined,
                    },
                    xAlign: 'center',
                    yAlign: 'bottom',
                },
                legend: {
                    display: false,
                },
                scales: {
                    xAxes: [
                        {
                            type: 'time',
                            time: {
                                displayFormats: {
                                    millisecond: 'HH:mm:ss.SSS',
                                    second: 'HH:mm:ss',
                                    minute: 'HH:mm',
                                    hour: 'D MMM, HH:mm',
                                    day: 'D MMM, HH:mm',
                                    week: 'MMM D',
                                    month: 'MMM YYYY',
                                    quarter: 'MMM YYYY',
                                    year: 'MMM YYYY',
                                },
                                tooltipFormat: 'ddd, D MMM YYYY, HH:mm:ss Z',
                            },
                            ticks: {
                                min: 0,
                                max: 0,
                                maxRotation: 0,
                                autoSkipPadding: 25,
                                fontSize: 10,
                                fontFamily: 'Roboto, sans-serif',
                            },
                        },
                    ],
                    yAxes: [
                        {
                            display: false,
                            ticks: {
                                max: 20,
                                min: 0,
                                display: false,
                            },
                        },
                    ],
                },
                plugins: {
                    colorschemes: {
                        scheme: 'brewer.Paired12',
                    },
                    zoom: {
                        pan: {
                            enabled: true,
                            mode: 'x',
                        },
                        zoom: {
                            enabled: true,
                            drag: false,
                            mode: () => 'x',
                        },
                    },
                },
                elements: {
                    line: {
                        tension: 0,
                    },
                },
            },
            selectedDatabaseId: undefined,
            pointIndexFromDatabaseId: {},
            windowInDays: 15,
            timeMarginInDays: 1,
        };
    },
    methods: {
        /**
         * Scriptable option function to define point colors. It returns
         * an array indexed like the chart's dataset. Only the color
         * of the selected point gets customized, others use the default
         * color, so the array returned has maximum one element.
         * @returns {Array}
         */
        pointColorSetter() {
            const colors = [];
            if (this.selectedDatabaseId &&
                this.pointIndexFromDatabaseId[this.selectedDatabaseId] !== undefined) {
                colors[this.pointIndexFromDatabaseId[this.selectedDatabaseId]] = '#D100E4';
            }
            return colors;
        },
        /**
         * Graph click event handler used to trigger selection of a database.
         * The parent component gets notified of the selected database id.
         * It is up to the parent component to update our value props in
         * order to make the change visible.
         * @param {PointerEvent} event - DOM event object.
         * @param {ChartElement[]} points - Array of active elements.
         * @param {number} points[]._datasetIndex - Chart's dataset index.
         * @param {number} points[]._index - Point index in the chart's dataset.
         */
        onTimeLineClick(event, points) {
            console.log('TimeLine: onPointClick: points =', points);
            if (points.length < 1)
                return; /* not a click on a point */
            if (this.chartdata.datasets[points[0]._datasetIndex] === undefined ||
                this.chartdata.datasets[points[0]._datasetIndex].data[points[0]._index] === undefined)
                return; /* better be safe */
            const databaseId = this.chartdata.datasets[points[0]._datasetIndex].data[points[0]._index].databaseId;
            console.log('TimeLine: onPointClick: emit click,', databaseId);
            this.$emit('click', databaseId);
        },
        /**
         * Set new bounds for the timeline. If the last available DB is in the
         * last n days (time window set in data), use this as a time window.
         * Otherwise, use a n-days time window leading up to the last available
         * DB + a margin.
         *
         * This function is a no-op when there is no database, at least one
         * is required to compute X-axis boundaries.
         *
         * @param {object[]} databases - See onWatchDatabases() documentation,
         *      except it is assumed here the parameter won't be undefined.
         */
        updateTimeLineBounds(databases) {
            if (databases.length == 0)
                return; /* need at least one database for computations */

            const now = new Date().getTime();
            const timeWindow = this.windowInDays * 86400 * 1000;
            const lastDbTime = databases[databases.length - 1].ts * 1000;

            if (now - timeWindow < lastDbTime && lastDbTime < now) {
                this.$data._chart.config.options.scales.xAxes[0].ticks.min = now - timeWindow;
                this.$data._chart.config.options.scales.xAxes[0].ticks.max = now;
            }
            else {
                const timeMargin = this.timeMarginInDays * 86400 * 1000;
                this.$data._chart.config.options.scales.xAxes[0].ticks.min = lastDbTime + timeMargin - timeWindow;
                this.$data._chart.config.options.scales.xAxes[0].ticks.max = lastDbTime + timeMargin;
            }
        },
        /**
         * Watch handler for the databases props. It updates the data points
         * on the graph and adjusts the X-axis boundaries.
         *
         * @param {object[]|undefined} databases - Array of database entries,
         *      as fetched from API. This parameter may be undefined.
         * @param {number} databases[].ts - Entry date in epoch seconds
         * @param {string} databases[].id - Entry identifier
         */
        onWatchDatabases(databases) {
            console.log('TimeLine: onWatchDatabases: current =', databases);
            /* The no-data message get displayed if there is no database
             * in the array. It is not displayed when the databases props is
             * undefined because we assume it is initialization time. */
            const ndHideClassFn = (databases && databases.length == 0) ? 'remove' : 'add';
            this.noDataElement.classList[ndHideClassFn]('d-none');

            databases ??= [];
            this.pointIndexFromDatabaseId = {};
            this.chartdata.datasets[0].data = databases.map((db, index) => {
                this.pointIndexFromDatabaseId[db.id] = index;
                return { x: db.ts * 1000, y: 9, databaseId: db.id };
            });
            this.updateTimeLineBounds(databases);
            this.$data._chart.update();
        },
        /**
         * Watch handler for the value props. It updates the selected data
         * point on the graph.
         */
        onWatchValue(value) {
            console.log('TimeLine: onWatchValue: current =', value);
            /* <value> may be undefined or invalid (no match on the points).
             * If so, none of the points will be selected on the timeline */
            this.selectedDatabaseId = value;
            this.$data._chart.update();
        },
    },
    mounted() {
        console.log('TimeLine: mounted: $props.databases =', this.databases);
        console.log('TimeLine: mounted: $props.value =', this.value);
        this.noDataElement = document.createElement('div');
        this.noDataElement.className = 'timeline-no-data red--text d-none';
        console.log('TimeLine: mounted: this.noDataElement =', this.noDataElement);
        this.$el.appendChild(this.noDataElement);
        this.renderChart(this.chartdata, this.options);
        this.$watch('databases',  this.onWatchDatabases, { immediate: true });
        this.$watch('value',  this.onWatchValue, { immediate: true });
    },
    destroyed() {
        console.log('TimeLine: destroyed: this.noDataElement =', this.noDataElement);
        if (this.noDataElement && this.noDataElement.parentElement)
            this.noDataElement.parentElement.removeChild(this.noDataElement);
        this.noDataElement = null;
    },
};
</script>

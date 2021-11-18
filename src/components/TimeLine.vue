<script>
import axios from 'axios';
import 'chartjs-plugin-colorschemes';
import 'chartjs-plugin-zoom';
import { Line } from 'vue-chartjs';
import { mapActions, mapGetters } from 'vuex';

/* 20211028: chartjs commit 484f0d1e518963436d5013f61001558ef9788edf in 2.9.4
 * breaks option scales.xAxes[0].maxRotation = 0. Use version 2.9.3 for now. */

export default {
    extends: Line,
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
                    },
                ]
            },
            options: {
                maintainAspectRatio: false,
                responsive: true,
                onClick:  this.handleClick,
                title: { display: false },
                tooltips: {
                    titleMarginBottom: -2,
                    titleFontSize: 10,
                    xPadding: 4,
                    yPadding: 4,
                    caretPadding: 5,
                    callbacks: {
                        label: function(tooltipItems, data) {
                            return data.labels[tooltipItems.index];
                        }
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
                            type: "time",
                            time: {
                                // unit: "day",
                                // stepSize: 6,
                                // minUnit: 'day',
                                displayFormats: {
                                    millisecond: 'hh:mm:ss.SSS',
                                    second: 'hh:mm:ss',
                                    minute: 'hh:mm',
                                    hour: 'MMM D hh:mm',
                                    day: 'MMM D hh:mm',
                                    week: 'MMM D',
                                    month: 'MMM YYYY',
                                    quarter: 'MMM - YYYY',
                                    year: 'MMM YYYY',
                                },
                            },
                            ticks: {
                                min: new Date().getTime() - 15 * 86400 * 1000,
                                max: new Date().getTime(),
                                maxRotation: 0,
                                autoSkipPadding: 25,
                                fontSize: 10,
                                fontFamily: 'Roboto, sans-serif'
                            },
                            // distribution: 'series',
                        }
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
                        scheme: "brewer.Paired12"
                    },
                    zoom: {
                        pan: {
                            enabled: true,
                            mode: "x",
                        },
                        zoom: {
                            enabled: true,
                            drag: false,
                            mode: () => {
                                return "x";
                            },
                        },
                    },
                },
                elements: {
                    line: {
                        tension: 0
                    },
                },
            },
            selectedIndex: null,
            database: '',
        };
    },
    methods: {
        updateTimeLine(data) {
            this.chartdata.datasets[0].data = data.map(
                function (d) {
                    return {
                        x: d.ts * 1000,
                        y: 9,
                        databaseId: d.id,
                    };
                }
            );

            let findIndex = this.chartdata.datasets[0].data.findIndex((element) => {
                return element.databaseId == this.database;
            });

            if (findIndex == -1)
                this.selectedIndex = this.chartdata.datasets[0].data.length - 1;
            else
                this.selectedIndex = findIndex;
            this.database = this.chartdata.datasets[0].data[this.selectedIndex].databaseId;

            this.chartdata.datasets[0].pointBackgroundColor = () => this.colorOnClick();
            this.chartdata.datasets[0].pointBorderColor = () => this.colorOnClick();
            this.$data._chart.update();
            //this.renderChart(this.chartdata, this.options);
        },
        colorOnClick() {
            let colors = [];
            colors[this.selectedIndex] = '#D100E4';
            return colors;
        },
        handleClick(point, event) {
            const item = event[0];
            if (!item) {
                console.log('timeline: cancel click, not on a point');
                return;
            }
            this.selectedIndex = item._index;
            this.database = this.chartdata.datasets[0].data[item._index].databaseId;
            this.updateStoreDatabase(this.database);
            this.$data._chart.update();
        },
        ...mapActions([
            'updateStoreDatabase', 'updateStoreInfoMessage'
        ]),
    },
    computed: {
        ...mapGetters([
            'storeEntity',
        ]),
    },
    watch: {
        database() {
            this.updateStoreDatabase(this.database);
        },
    },
    mounted () {
        this.updateStoreDatabase(this.database);
        if (this.storeEntity) {
            axios.get(`/entity/${this.storeEntity}/databases`)
                .then((response) => { this.updateTimeLine(response.data); this.updateStoreInfoMessage({}); })
                .catch((err) => { console.log(err); this.updateStoreInfoMessage({type: 'error', content: 'Cannot load databases, problem with the query.', error: err }); });
        }
        this.renderChart(this.chartdata, this.options);
    },
}

/*
Notes:
- Force update the grph: 
*/
</script>

<style>
</style>
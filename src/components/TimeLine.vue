<script>
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
        ],
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        onClick: this.handleClick,
        title: { display: false },
        tooltips: {
          titleMarginBottom: -2,
          titleFontSize: 10,
          xPadding: 4,
          yPadding: 4,
          caretPadding: 5,
          callbacks: {
            label: function (tooltipItems, data) {
              return data.labels[tooltipItems.index];
            },
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
              mode: () => {
                return 'x';
              },
            },
          },
        },
        elements: {
          line: {
            tension: 0,
          },
        },
      },
      selectedIndex: null,
      database: '',
    };
  },
  methods: {
    /**
     * Update the timeline with our data
     * @param {Array} data - Data array fetched from api
     */
    updateTimeLine(data) {
      this.chartdata.datasets[0].data = data.map(function (d) {
        return {
          x: d.ts * 1000,
          y: 9,
          databaseId: d.id,
        };
      });

      const findIndex = this.chartdata.datasets[0].data.findIndex((element) => {
        return element.databaseId === this.database;
      });

      if (findIndex === -1 && this.chartdata.datasets[0].data)
        this.selectedIndex = this.chartdata.datasets[0].data.length - 1;
      else this.selectedIndex = findIndex;
      this.database =
        this.chartdata.datasets[0].data[this.selectedIndex].databaseId;

      this.chartdata.datasets[0].pointBackgroundColor = () =>
        this.colorOnClick();
      this.chartdata.datasets[0].pointBorderColor = () => this.colorOnClick();
      this.$data._chart.update();
    },
    /**
     * Return colors array
     * The array returned is used to match the selected timeline point to be different
     * @returns {Array}
     */
    colorOnClick() {
      const colors = [];
      colors[this.selectedIndex] = '#D100E4';
      return colors;
    },
    /**
     * Update store database value
     * @param {Object} point - PointerEvent
     * @param {Array} event - ChartElement
     */
    handleClick(point, event) {
      let clickedItem = null;
      if (Array.isArray(event)) clickedItem = event[0];
      if (!clickedItem) {
        return;
      } else {
        this.selectedIndex = clickedItem._index;
        this.database =
          this.chartdata.datasets[0].data[clickedItem._index].databaseId;
        this.updateStoreDatabase(this.database);
        this.$data._chart.update();
      }
    },
    ...mapActions(['updateStoreDatabase', 'updateStoreInfoMessage']),
  },
  computed: {
    ...mapGetters(['storeEntity']),
  },
  watch: {
    database() {
      this.updateStoreDatabase(this.database);
    },
  },
  mounted() {
    this.updateStoreDatabase(this.database);
    if (this.storeEntity) {
      this.$api
        .get(`/entity/${this.storeEntity}/databases`)
        .then((response) => {
          this.updateTimeLine(response.data);
          this.updateStoreInfoMessage({});
        })
        .catch((err) => {
          console.log(err);
          this.updateStoreInfoMessage({
            type: 'error',
            content: 'Cannot load databases, problem with the query.',
            error: err,
          });
        });
    }
    this.renderChart(this.chartdata, this.options);
  },
};

/*
Notes:
- Force update the grph: 
*/
</script>

<style></style>

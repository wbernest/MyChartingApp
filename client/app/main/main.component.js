import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './main.routes';
import Chart from 'chart.js';
import * as _ from 'lodash';
import moment from 'moment';

const timeFormat = 'MM/DD/YYYY HH:mm';

export class MainController {
  awesomeThings = [];
  newThing = '';
  chart;
  /*@ngInject*/
  constructor($http, $scope, socket) {
    this.$http = $http;
    this.socket = socket;

    $scope.$on('$destroy', function() {
      socket.unsyncUpdates('thing');
    });

    this.createChart();
  }

  $onInit() {
    this.$http.get('/api/things')
      .then(response => {
        this.awesomeThings = response.data;
        this.socket.syncUpdates('thing', this.awesomeThings, (msg)=>{ 
          _.each(this.awesomeThings, (thing, index)=>{
              this.$http.get('/api/stocks/'+thing.name).then(response=>{
                thing.data = response.data.chart.result[0].timestamp.map((x,i) => new Object({x: moment.unix(x).format('MM/DD/YY'), y: response.data.chart.result[0].indicators.adjclose[0].adjclose[i]}));
                this.createChart();
              });  
            });
          });
        _.each(this.awesomeThings, (thing, index)=>{
          this.$http.get('/api/stocks/'+thing.name).then(response=>{
            thing.data = response.data.chart.result[0].timestamp.map((x,i) => new Object({x: moment.unix(x).format('MM/DD/YY'), y: response.data.chart.result[0].indicators.adjclose[0].adjclose[i]}));
            this.createChart();
          });  
        });
      });
  }

  addThing() {
    if(this.newThing) {
      this.$http.post('/api/things', {
        name: this.newThing,
        color: this.getRandomColor()
      });  
  
      this.newThing = '';
    }
  }

  deleteThing(thing) {
    this.$http.delete(`/api/things/${thing._id}`);
  }

  createChart(){
    if(this.chart != null) this.chart.destroy();

    var color = Chart.helpers.color;
    var ctx = document.getElementById("myChart");
    this.chart = new Chart(ctx, {
    type: 'line',
    data: {
        datasets: this.awesomeThings.map(x=>{ 
          return {
            label: x.name, 
            data: x.data,
            backgroundColor: color(x.color).alpha(0.5).rgbString(),
            borderColor: x.color,
  					fill: false,
          }
        })
    },
    options: {
      maintainAspectRatio: false,
      width: 400,
      height: 300,
      responsive: true,
      scales: {
        xAxes: [{
          type: 'time',
          time: {
            //format: timeFormat,
            // round: 'day'
            tooltipFormat: 'll'
          },
          scaleLabel: {
            display: true,
            labelString: 'Date'
          }
        }],
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Adj Close ($)'
          }
        }]
      },
    }
  });
  }

  getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}

export default angular.module('myChartingAppApp.main', [uiRouter])
  .config(routing)
  .component('main', {
    template: require('./main.html'),
    controller: MainController
  })
  .name;

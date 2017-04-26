app.controller('LocationStatsCtrl', ['$scope', 'Stats', '$stateParams', 'moment', function($scope, Stats, $stateParams, moment) {
    $scope.stats;

    $scope.averageEventUtulization = 0;

    //Year Chart
    $scope.chartOptions = {
        colors: ['#DCDCDC', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360', '#803690', '#00ADF9'],
        scales: {
            xAxes: [{
                gridLines: {
                    display: false
                },
                ticks: {
                    autoSkip: true,
                    maxTicksLimit: 20
                }
            }],
            yAxes: [{
                gridLines: {
                    display: false
                }
            }]
        }
    }
    $scope.preColors = ['#febe05', '#f3f3f3'];
    $scope.pieChartOptions = {
        legend: {
            display: true
        }
    };

    //Stats on Events / Day of the week
    $scope.eventDayOfWeek = {}
    $scope.eventDayOfWeek.labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    $scope.eventDayOfWeek.data = [
        [0, 0, 0, 0, 0, 0, 0]
    ];


    //Stats on weekly usage
    var today = moment();
    var dateRange = new Array(7).join('0').split('').map(parseFloat);
    for (var i = 0; i < 7; i++) {
        dateRange[i] = moment().subtract(6 - i, "days").format("DD/MM/YYYY");
    }
    $scope.eventsOverPastSevenDays = {};
    $scope.eventsOverPastSevenDays.data = [
        [0, 0, 0, 0, 0, 0, 0, 0]
    ];
    $scope.eventsOverPastSevenDays.labels = dateRange;

    //Stats on Events / Day of the week
    $scope.eventsWeekly = {}
    $scope.eventsWeekly.labels = new Array(52);
    $scope.eventsWeekly.data = [new Array(52).join('0').split('').map(parseFloat)];
    for (var i = 0; i < $scope.eventsWeekly.labels.length; i++) {
        $scope.eventsWeekly.labels[i] = moment().startOf('week').subtract(i, "weeks").format("DD/MM");
    }

    //Stats on time of the day
    $scope.eventPunchCard = {}
    $scope.eventPunchCard.labels = new Array(24);
    $scope.eventPunchCard.data = [new Array(24).join('0').split('').map(parseFloat)];
    for (var i = 0; i < 24; i++) {
        $scope.eventPunchCard.labels[i] = [i];
    }

    $scope.eventPunchCard.data = [[]];
    $scope.punchCardOptions = {
        colors: ['#DCDCDC', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360', '#803690', '#00ADF9'],
        scales: {
            xAxes: [{
                gridLines: {
                    display: false
                },
                ticks: {
                    max: 24,
                    min: 0,
                    stepSize: 1,
                    callback: function(value, index, values) {
                      return value+":00";
                    }
                }
            }],
            yAxes: [{
                gridLines: {
                    display: false
                },
                ticks: {
                    max: 6,
                    min: 0,
                    stepSize: 1,
                    callback: function(value, index, values) {
                        return $scope.eventDayOfWeek.labels[value];
                    }
                }
            }]
        }
    }

    //Invited
    $scope.eventInviteUsage = {}
    $scope.eventInviteUsage.labels = new Array(24);
    $scope.eventInviteUsage.data = [new Array(24).join('0').split('').map(parseFloat)];
    for (var i = 0; i < 24; i++) {
        $scope.eventPunchCard.labels[i] = [i];
    }

    //Time of Day
    $scope.eventTimeOfDay = {}
    $scope.eventTimeOfDay.labels = new Array(24);
    $scope.eventTimeOfDay.data = [new Array(24).join('0').split('').map(parseFloat)];
    for (var i = 0; i < 24; i++) {
        $scope.eventTimeOfDay.labels[i] = [i];
    }
    $scope.refresh = function() {
        Stats.location($stateParams.id, function(stats) {
            $scope.stats = stats.data;
            console.log(stats.data);

            //Loop through each event
            for (var i = 0; i < stats.data.stats.length; i++) {

                //averageEventUtulization
                $scope.averageEventUtulization+=stats.data.stats[i].inviteUsage;

                //Calcutate Daily Data
                $scope.eventDayOfWeek.data[0][moment(stats.data.stats[i].eventStart).day()]++;

                //Stats on last 7 days
                for (var dr = 0; dr < dateRange.length; dr++) {
                    var date = moment(stats.data.stats[i].eventStart).startOf('day').format('DD/MM/YYYY');
                    var day = moment(stats.data.stats[i].eventStart).startOf('day').format('DD');
                    //If DD-MM-YYYY(Event eventStart) == DD-MM-YYYY(Date Range)
                    if (date == dateRange[dr]) {
                        $scope.eventsOverPastSevenDays.data[0][dr]++;
                    }
                }

                //Stats on events/week
                //This code looks up the current dates start of week formated as DD/MM and get's the index to increment data from the labels made above
                $scope.eventsWeekly.data[0][$scope.eventsWeekly.labels.indexOf(moment(stats.data.stats[i].eventStart).startOf("week").format('DD/MM'))]++;

                //Stats on time of the day it's used
                var object = {
                    x: moment(stats.data.stats[i].eventStart).format("H"),
                    y: moment(stats.data.stats[i].eventStart).day(),
                    r: 1
                };
                for (var c = 0; c < $scope.eventPunchCard.data[0].length; c++) {
                    if ($scope.eventPunchCard.data[0][c].x == object.x && $scope.eventPunchCard.data[0][c].y == object.y) {
                        $scope.eventPunchCard.data[0][c].r++;
                        delete object;
                        break;
                    }
                }
                //If the object was not added and deleted
                if (object != undefined) {
                    $scope.eventPunchCard.data[0].push(object);
                }

                //Plot inviteUsage

                //Time of Day
                $scope.eventTimeOfDay.data[0][moment(stats.data.stats[i].eventStart).format('H')]++

            } //END OF LOOP
            $scope.eventsWeekly.data[0].reverse();
            $scope.eventsWeekly.labels.reverse();

            $scope.averageEventUtulization = Math.round(($scope.averageEventUtulization / stats.data.stats.length) * 100);
        });



    };



    $scope.refresh();
}]);

var app = angular.module('MATBLDashboard', ['ui.router', 'angular-flot', 'LocalStorageModule', 'naif.base64', 'angularModalService', 'ngMap', 'ui.bootstrap.datetimepicker', 'multipleSelect', 'chart.js']);

app.config(['$httpProvider', '$stateProvider', '$urlRouterProvider',
    function($httpProvider, $stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('common', {
                abstract: true,
                views: {
                    'common': {
                        controller: 'CommonCtrl',
                        templateUrl: 'app/pages/common/tpl.common.html'
                    }
                }
            })
            .state('dashboard', {
                url: '/dashboard',
                parent: 'common',
                templateUrl: 'app/pages/home/tpl.home.html',
                controller: 'DashboardCtrl'
            })
            .state('users', {
                url: '/users',
                parent: 'common',
                templateUrl: 'app/pages/users/tpl.users.html',
                controller: 'UsersCtrl'
            })
            .state('users.add', {
                url: '/users/add',
                parent: 'common',
                templateUrl: 'app/pages/users.add/tpl.users.add.html',
                controller: 'UserAddCtrl'
            })
            .state('users.edit', {
                url: '/users/edit/:id',
                parent: 'common',
                templateUrl: 'app/pages/users.edit/tpl.users.edit.html',
                controller: 'UsersEditCtrl'
            })
            .state('events', {
                url: '/events',
                parent: 'common',
                templateUrl: 'app/pages/events/tpl.events.html',
                controller: 'EventsCtrl'
            })
            .state('events.add', {
                url: '/events/add',
                parent: 'common',
                templateUrl: 'app/pages/events.add/tpl.events.add.html',
                controller: 'EventAddCtrl'
            })
            .state('locations', {
                url: '/locations',
                parent: 'common',
                templateUrl: 'app/pages/locations/tpl.locations.html',
                controller: 'locationsCtrl'
            })
            .state('locations.add', {
                url: '/locations/add',
                parent: 'common',
                templateUrl: 'app/pages/locations.add/tpl.locations.add.html',
                controller: 'LocationsAddCtrl'
            })
            .state('locations.edit', {
                url: '/locations/edit/:id',
                parent: 'common',
                templateUrl: 'app/pages/locations.edit/tpl.locations.edit.html',
                controller: 'LocationsEditCtrl'
            })
            .state('places', {
                url: '/places',
                parent: 'common',
                templateUrl: 'app/pages/places/tpl.places.html',
                controller: 'placesCtrl'
            })
            .state('places.add', {
                url: '/places/add',
                parent: 'common',
                templateUrl: 'app/pages/places.add/tpl.places.add.html',
                controller: 'PlacesAddCtrl'
            })
            .state('places.edit', {
                url: '/places/edit/:id',
                parent: 'common',
                templateUrl: 'app/pages/places.edit/tpl.places.edit.html',
                controller: 'PlacesEditCtrl'
            })
            .state('account', {
                url: '/account',
                parent: 'common',
                templateUrl: 'app/pages/account/tpl.account.html',
                controller: 'AccountCtrl'
            })
            .state('login', {
                url: '/login',
                views: {
                    'common': {
                        templateUrl: 'app/pages/login/tpl.login.html',
                        controller: 'LoginCtrl'
                    }
                }
            });
        $urlRouterProvider.otherwise('/dashboard');
    }
]);

app.run(['$rootScope', '$location', 'Auth', function($rootScope, $location, Auth) {
    console.log("Is User Logged in?", !!Auth.isLoggedIn());
    if (!Auth.isLoggedIn()) {
        event.preventDefault();
        $location.path('/login');
        console.log("Go to Login -->>");
    } else {
        //If the user is trying to login, once they are already logged in, direct to dashboard
        if ($location.path() == '/login') {
            $location.path('/dashboard');
            console.log("Go to Dashboard -->>");
        }
    }

    $rootScope.$on('$stateChangeStart', function(event, next) {
        console.log("stateChangeStart", next.url, next);
        console.log("Is User Logged in?", !!Auth.isLoggedIn());
        if (!Auth.isLoggedIn()) {
            $location.path('/login');
            console.log("Go to Login -->>");
        }
    });

    $rootScope.$on("$stateChangeSuccess", function(e, data) {
        $rootScope.location = data.name;
    });
}]);

app.filter('capitalize', function() {
    return function(input) {
        var wordList = input.split(" ");
        input = "";
        for (var i = 0; i < wordList.length; i++) {
            input += wordList[i].charAt(0).toUpperCase() + wordList[i].substr(1).toLowerCase() + " "
        }
        return input.slice(0, -1);
    }
});

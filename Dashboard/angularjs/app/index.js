var app = angular.module('MATBLDashboard', ['ui.router', 'angular-flot', 'LocalStorageModule']);

app.config(['$httpProvider', '$stateProvider', '$urlRouterProvider',
  function($httpProvider, $stateProvider, $urlRouterProvider) {

    $stateProvider
      .state('common', {
        templateUrl: 'app/pages/common/tpl.common.html',
        abstract: true,
        controller: 'CommonCtrl'
      })
      .state('dashboard', {
        url: '/dashboard',
        parent: 'common',
        templateUrl: 'app/pages/home/tpl.home.html',
        controller: 'DashboardCtrl'
      })
      .state('crm', {
        url: '/crm',
        parent: 'common',
        template: '<div><h4>CRM</h4></div>',
      })
      .state('login', {
        url: '/login',
        templateUrl: 'app/pages/login/tpl.login.html',
        controller: 'LoginCtrl'
      });

    $urlRouterProvider.otherwise('/dashboard');
  }
]);

app.run(['$rootScope', '$location', '$http', 'Auth', function ($rootScope, $location, $http, Auth) {

    $rootScope.$on('$routeChangeStart', function (event) {

        if (!Auth.isLoggedIn()) {
            console.log('DENY');
            event.preventDefault();
            $location.path('/login');
        }
        else {
            console.log('ALLOW');
            $location.path('/dashboarded');
        }
    });
}]);

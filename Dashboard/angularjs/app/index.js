var app = angular.module('MATBLDashboard', ['ui.router', 'angular-flot']);

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
        //templateUrl: '/app/crm/crm.html',
        template: '<div><h4>CRM</h4></div>',
        //controller: 'CrmCtrl'
      })
      .state('login', {
        url: '/login',
        templateUrl: 'app/pages/login/tpl.login.html',
      });

    $urlRouterProvider.otherwise('/dashboard');
  }
]);

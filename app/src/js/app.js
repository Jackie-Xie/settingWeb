'use strict';

angular
  .module('myappApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ])
  .config(function ($routeProvider) {
    $routeProvider
		.when('/', {
			redirectTo: '/login',
		})
        .when('/login', {
			templateUrl: 'views/login/index.html',
			controller: 'LoginCtrl'
		})
		.when('/setting', {
			redirectTo: '/setting/users',
		})
		.when('/setting/roles', {
			templateUrl: 'views/setting/index.html',
			controller: 'RoleSettingCtrl',
		})
		.when('/setting/users', {
			templateUrl: 'views/setting/index.html',
			controller: 'UserSettingCtrl',
		})
		.when('/setting/modify', {
			templateUrl: 'views/setting/index.html',
			controller: 'ModifyPwdCtrl',
		})
		.when('/setting/safety', {
			templateUrl: 'views/setting/index.html',
			controller: 'SafetyCtrl',
		})
		.when('/setting/auditIndex', {
			templateUrl: 'views/setting/index.html',
			controller: 'AuditCtrl',
		})
		.when('/setting/activeUser', {
			templateUrl: 'views/setting/index.html',
			controller: 'ActiveUserCtrl',
		})
		.when('/setting/auditAnaly', {
			templateUrl: 'views/setting/index.html',
			controller: 'AuditAnalyCtrl',
		})
		.when('/setting/systemAlarm', {
			templateUrl: 'views/setting/index.html',
			controller: 'SystemAlarmCtrl',
		})
		.when('/setting/assess', {
			templateUrl: 'views/setting/index.html',
			controller: 'AssessCtrl',
		})
		.when('/404', {
			templateUrl: '404.html',
			controller: ''
		})
		.when('/402', {
			templateUrl: 'authError.html',
			controller: ''
		})
		.otherwise({
			redirectTo: '/404'
		});
  });

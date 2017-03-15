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
			templateUrl: 'views/login/index.html',
			controller: 'LoginCtrl'
		})
		.when('/setting', {
			redirectTo: '/setting/users',
		})
		.when('/setting/roles', {
			templateUrl: 'views/setting/role.html',
			controller: 'RoleSettingCtrl',
		})
		.when('/setting/users', {
			templateUrl: 'views/setting/user.html',
			controller: 'UserSettingCtrl',
		})
		.when('/setting/modify', {
			templateUrl: 'views/setting/modify.html',
			controller: 'UserSettingCtrl',
		})
		.when('/setting/safety', {
			templateUrl: 'views/setting/safety.html',
			controller: 'SafetyCtrl',
		})
		.when('/setting/audit', {
			templateUrl: 'views/setting/auditIndex.html',
			controller: 'AuditCtrl',
		})
		.when('/setting/activeUser', {
			templateUrl: 'views/setting/activeUser.html',
			controller: 'ActiveUserCtrl',
		})
		.when('/setting/auditAnaly', {
			templateUrl: 'views/setting/auditAnaly.html',
			controller: 'AuditAnalyCtrl',
		})
		.when('/setting/systemAlarm', {
			templateUrl: 'views/setting/systemAlarm.html',
			controller: 'SystemAlarmCtrl',
		})
		.when('/setting/assess', {
			templateUrl: 'views/setting/assess.html',
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
		.when('/login', {
			templateUrl: 'views/login/index.html',
			controller: 'LoginCtrl'
		})
		.otherwise({
			redirectTo: '/404',
		});
  });

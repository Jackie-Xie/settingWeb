'use strict';

angular.module('myappApp')
  	.controller('NavCtrl', ['$scope', '$rootScope', '$location', '$cookies','sessionStore',function ($scope, $rootScope, $location, $cookies,sessionStore) {
        var userLocalInfo = null;
  		$scope.pathStr = $location.path();

	   	$scope.init = function () {
            userLocalInfo = sessionStore.getObject('userInfo');
            if($rootScope.userLogStatus){
                $scope.userLogStatus = $rootScope.userLogStatus;
            }
            else if(userLocalInfo){
                $scope.userLogStatus = userLocalInfo.userLogStatus;
            }
            $scope.apply();
	    	$scope.resetRender();

            if($scope.userLogStatus ){
                // 清除登出效果
                if($scope.userLogStatus.indexOf('logout') > -1){
    				$scope.clearLoginInfo();
    			}
                // 读取本地登入信息
                else if($scope.userLogStatus.indexOf('saved') > -1){
    	            $scope.getLocalLoginInfo();
                }
    			else if($scope.userLogStatus.indexOf('login') > -1){
    				$scope.saveLoginInfo();
    			}
            }

	        // 判断是否已经登录
	        if( !$scope.userLogStatus || ($scope.userLogStatus.indexOf('login') === -1 && (!$cookies || !$cookies.getObject('userInfo')) && (!userLocalInfo || $.isEmptyObject(userLocalInfo)) ) ){
                $location.path('/login');
	        }
            $scope.bindEvent();
	    };

        /*
         * 事件绑定
         */
        $scope.bindEvent = function () {
            $(window).on('resize',function(){
	        	$scope.resetRender();
	        });

			$('body').on('click','.top-nav li', function(){
				$scope.getLocalLoginInfo();
			});
        };

        /*
         * 点击退出
         */
        $scope.clickLogout = function(){
            $location.path('/login');
			$rootScope.userLogStatus = 'logout';
			$scope.clearLoginInfo();
	    };

        /*
         * 清除登录信息
         */
	    $scope.clearLoginInfo = function(){
	    	$rootScope.userInfo = $scope.userInfo = {};
	    	$rootScope.userName = $scope.userName = '';
	    	$rootScope.roleId = $scope.roleId = 0;
            // cookies
            if( $cookies && $cookies.getObject('userInfo') ){
				$cookies.remove("userInfo");
            }
            // localStore
			userLocalInfo = sessionStore.getObject('userInfo');
            if(userLocalInfo && !$.isEmptyObject(userLocalInfo)){
				sessionStore.remove("userInfo");
            }
            $scope.apply();
	    };

        /*
         * 保存登录信息
         */
	    $scope.saveLoginInfo = function(){
	    	var user = {
	    		'userName': $rootScope.userName,
	    		'userInfo': $rootScope.userInfo,
	    		'roleId': $rootScope.roleId,
                'userLogStatus':'saved'
	    	};
            // cookies
	    	if( $cookies && $cookies.getObject('userInfo') ){
                 $cookies.remove("userInfo");
            }

	    	if($cookies){
				$cookies.putObject('userInfo', user);
                $rootScope.userLogStatus = 'saved';
			}
            // localStore
			userLocalInfo = sessionStore.getObject('userInfo');
            if(userLocalInfo && !$.isEmptyObject(userLocalInfo)){
				sessionStore.remove("userInfo");
            }
	    	else{
				sessionStore.setObject('userInfo',user);
                $rootScope.userLogStatus = 'saved';
			}

            $scope.userName =  $rootScope.userName;
            $scope.roleId =  $rootScope.roleId;
            $scope.userInfo = $rootScope.userInfo;
	    	$scope.apply();
	    };

        /*
         * 获取登录信息
         */
	    $scope.getLocalLoginInfo = function(){
	    	var user = {},
				userLocalInfo = sessionStore.getObject('userInfo');
	    	if($cookies && $cookies.getObject('userInfo')){
				user = $cookies.getObject('userInfo');
				$rootScope.userName = user.userName;
				$rootScope.userInfo = user.userInfo;
				$rootScope.roleId = user.roleId;
			}
            else if(userLocalInfo && !$.isEmptyObject(userLocalInfo)){
                $rootScope.userName = userLocalInfo.userName;
				$rootScope.userInfo = userLocalInfo.userInfo;
				$rootScope.roleId = userLocalInfo.roleId;
            }
            $scope.userName =  $rootScope.userName;
            $scope.roleId =  $rootScope.roleId;
            $scope.userInfo = $rootScope.userInfo;
            $scope.apply();
	    };

	    $scope.resetRender = function(){
			$('html').css('font-size', $(window).width() * 20 / 1360 + 'px');
		};

  	}]);

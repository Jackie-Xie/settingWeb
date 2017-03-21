angular.module('myappApp')
  	.controller('NavCtrl', function ($scope, $rootScope, $location, $route, $timeout, AjaxServer) {
  		var viewWidth = $(window).width(),
			viewHeight = $(window).height(),
			apiGetUserInfo = '/account/info';
  		$scope.pathStr = '';

	   	$scope.init = function () {
	   		if( $rootScope.userName ){
	   			$scope.userName =  $rootScope.userName;
	   			$scope.roleId =  $rootScope.roleId;
                $scope.userInfo = $rootScope.userInfo;
	   		}else{
	   			var ajaxConfig = {
		   			'url': apiGetUserInfo,
		   			'method': 'get',
		   		}
		   		AjaxServer.ajaxInfo( ajaxConfig,
		   			function( data ){
		   				if( !data || !data.userInfo || !data.userInfo.user || !data.userInfo.user.userName || !data.userInfo.user.roleId ){
	    					return false;
	    				}
		   				$rootScope.userName = $scope.userName = data.userInfo.user.userName;
		   				$rootScope.roleId = $scope.roleId = data.userInfo.user.roleId;
		   				if( data.message && data.message == '请重置密码'){
		   					$rootScope.onlyPwd = true;
		   					$scope.onlyPwd = true;
		   				}
				   		if(!$scope.userName){
				   			$location.url('/login');
				   		}
		   			}
		   		);
	   		}
	    	$scope.pathStr = $location.path();
	    	$scope.resetRender();
	    	// 页面跳转后自动清除定时刷新，节省浏览器资源
	    	$('body').off('click','**');
	        $('body').on('click','.top-nav li', function(ev){
	        	var it = $(ev.currentTarget),
	        		targetSrc = '';
	        	if($scope.stopRefresh){
	        		$scope.stopRefresh();
	        	}
	        	if( it.find('a') && it.find('a').attr('href') ){
	        		targetSrc = it.find('a').attr('href');
	        	}
	        	if( targetSrc.indexOf( $scope.pathStr ) > -1 ){
	        		$route.reload();
	        	}
	        });

	        $(window).on('resize',function(){
	        	$scope.resetRender();
	        });

	    };

	    $scope.resetRender = function(){
			$('html').css('font-size', $(window).width() * 20 / 1360 + 'px');
		};

  	});

angular.module('myappApp')
  	.controller('SideNavCtrl', ['$scope','$rootScope', '$location',function ($scope, $rootScope, $location) {
        var viewHeight = $(window).height();
	   	$scope.init = function () {
	    	$scope.pathStr = $location.path();
            $scope.menuHeight = viewHeight - 48;
            $rootScope.mainHeight = viewHeight - 48;
	    	// 页面跳转后自动清除定时刷新，节省浏览器资源
	        $('body').on('click','.nav li', function(){
	        	if($scope.stopRefresh){
	        		$scope.stopRefresh();
	        	}
                $scope.resetRender();
	        });
	        $scope.bindEvent();
	    };

        $scope.resetRender = function () {
            $scope.menuHeight = $(window).height() - 48;
            $rootScope.mainHeight = $(window).height() - 48;
            $scope.apply();
        };

	    $scope.bindEvent = function () {
            $(window).resize(function(){
                $scope.resetRender();
            });
	    };

        $scope.apply = function() {
            if(!$scope.$$phase) {
                $scope.$apply();
            }
        }
  	}]);

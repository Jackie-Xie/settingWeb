angular.module('myappApp')
  	.controller('SideNavCtrl', ['$scope','$rootScope', '$location',function ($scope, $rootScope, $location) {
        var viewHeight = $(window).height();
	   	$scope.init = function () {
	    	$scope.pathStr = $location.path();
            $scope.menuHeight = viewHeight - 50;
            $rootScope.mainHeight = viewHeight - 50;
	        $scope.bindEvent();
	    };

        $scope.resetRender = function () {
            $scope.menuHeight = $(window).height() - 50;
            $rootScope.mainHeight = $(window).height() - 50;
            $scope.apply();
        };

	    $scope.bindEvent = function () {
            $('body').on('click','.nav li', function(){
                $scope.resetRender();
            });
            
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

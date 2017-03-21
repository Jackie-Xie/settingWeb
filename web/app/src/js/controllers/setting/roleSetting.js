'use strict';

angular.module('myappApp')
  	.controller('RoleSettingCtrl', ['$scope', '$http', '$location',function ($scope, $http, $location) {
  		/*
		 * 页面初始化
		 */
	   	$scope.init = function () {
	   		$scope.roleList = [];
	   		$scope.roleInfoFlag = 'loading...';
	   		$scope.pathStr = $location.path();
            $scope.getRoleList();
	   		$scope.apply();
	    };

   	    /*
		 * 获取角色列表
		 */
  		$scope.getRoleList = function(){
            $http.get('/data/roles/getRoleList.json',{cache: true}).then(function (response){
                if(response.status === 200){
                    $scope.roleList = response.data;
                    if($scope.roleList && $scope.roleList.length!==0){
    					$.each($scope.roleList , function(i){
    	                    this.num = parseInt(i) + 1;
    	                });
    					$scope.roleInfoFlag = '';
    				}else{
    					$scope.roleInfoFlag = '暂未配置，请联系管理员';
    				}
                    $scope.apply();
                }
            },function (){
                console.log('因为网络原因请求失败');
            });
  		};

  		$scope.apply = function() {
  			if(!$scope.$$phase) {
  			    $scope.$apply();
  			}
  		};
}]);

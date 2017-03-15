'use strict';

angular.module('myappApp')
  	.controller('RoleSettingCtrl', function ($scope, AjaxServer, $location) {
  		var config = {},	    									  	  // 请求配置
  			postData = {},												  // 请求默认所带参数
            apiGetRoleList = '/role';                                     // 获取角色列表

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
  			config = {
  				'method':'get',
  				'data':'',
  				'responseType':'json',
  				'url':apiGetRoleList
  			};

  			AjaxServer.ajaxInfo( config , function(data){
  				if( typeof(data) === 'string'){
					data = JSON.parse(data);
				}
				$scope.roleList = $.extend([],data);
				if(!!$scope.roleList && $scope.roleList.length!==0){
					$.each($scope.roleList , function(i){
	                    this.num = parseInt(i) + 1;
	                });
					$scope.roleInfoFlag = '';
				}else{
					$scope.roleInfoFlag = '暂未配置，请联系管理员';
				}
				$scope.apply();
			},
			function(status){
                var errorMessage = status ? '因为系统内部错误请求失败' : '因为网络原因请求失败';
                $scope.errorMsg = errorMessage;
                $scope.apply();
			});
  		};
  		
  		$scope.apply = function() {
  			if(!$scope.$$phase) {
  			    $scope.$apply();
  			}
  		};
});

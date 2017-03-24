'use strict';

angular.module('myappApp')
  	.controller('SafetyCtrl', ['$scope', '$http', 'Validate', '$location',function ($scope, $http, Validate, $location) {
  		$scope.init = function () {
            $scope.pathStr = $location.path();
			$scope.clearErrMessage();
  			$scope.updateSafetyForm = {};
  			$scope.getSafetyInfo();
  		}

  		/*
  		 * 修改安全配置
  		 */
  		$scope.updateSafetyInfo = function ( event ){
  			var it = $(event.currentTarget);
			if(it.hasClass('disabled')){
				return false;
			}
  			// 输入验证
  			if($scope.updateSafetyForm && !$scope.validateForm($scope.updateSafetyForm)){
  				return false;
  			}
  			var postData = {
				'sessionLifeCycle':($scope.updateSafetyForm.newSessionTime) ? $scope.updateSafetyForm.newSessionTime : parseInt($scope.updateSafetyForm.oldSessionTime),
				'maxSessionCount':($scope.updateSafetyForm.newSessionNum) ? $scope.updateSafetyForm.newSessionNum : parseInt($scope.updateSafetyForm.oldSessionNum),
				'maxHashTime':($scope.updateSafetyForm.newPwdTime) ? $scope.updateSafetyForm.newPwdTime : parseInt($scope.updateSafetyForm.oldPwdTime),
				'hashErrorCount':($scope.updateSafetyForm.newPwdNum) ? $scope.updateSafetyForm.newPwdNum : parseInt($scope.updateSafetyForm.oldPwdNum),
				'maxUserUnLoginTime':($scope.updateSafetyForm.newUnLoginLockTime) ? $scope.updateSafetyForm.newUnLoginLockTime : parseInt($scope.updateSafetyForm.oldUnLoginLockTime),
				'lockTime':($scope.updateSafetyForm.newLockTime) ? $scope.updateSafetyForm.newLockTime : parseInt($scope.updateSafetyForm.oldLockTime)
  			};
			console.log(postData);

  			it.addClass('disabled');
  			// 实际要发送POST请求到后台进行修改操作，发送成功后的回调函数中在进行操作
			it.removeClass('disabled');
			$scope.errorMsg = '';
			$scope.successMsg = '配置更新成功';
			$scope.apply();
  		};

  		/*
  		 * 获取安全配置信息
  		 */
  		$scope.getSafetyInfo = function (){
            var promise = $http({
                method:'GET',
                url:"/data/systemConfig/sysConfig.json"
            });
  			promise.then(function (response){
                if(response.status === 200){
                    var d = response.data;
					if(d && d.length>0){
						for(var i=0,l=d.length; i < l; i++){
							switch($.trim(d[i].key)){
								case 'sessionLifeCycle':
									$scope.updateSafetyForm.oldSessionTime = d[i].value;
									break;
								case 'maxSessionCount':
									$scope.updateSafetyForm.oldSessionNum = d[i].value;
									break;
								case 'maxHashTime':
									$scope.updateSafetyForm.oldPwdTime = d[i].value;
									break;
								case 'hashErrorCount':
									$scope.updateSafetyForm.oldPwdNum = d[i].value;
									break;
								case 'maxUserUnLoginTime':
									$scope.updateSafetyForm.oldUnLoginLockTime = d[i].value;
									break;
								case 'lockTime':
									$scope.updateSafetyForm.oldLockTime = d[i].value;
									break;
							}
						}
					}
  				}
                $scope.clearErrMessage();
  				$scope.apply();
            },function (){
  				$scope.errorMsg = '因为网络原因请求安全配置信息失败';
  	  			$scope.successMsg = '';
  	  			$scope.apply();
            });
  		};

  		/*
  		 * 验证表单数据
  		 */
  		$scope.validateForm = function ( formObj ) {
  			//这些参数都为正整数,并有范围
  			if( parseInt(formObj.newSessionTime)===0 || (Validate.validEmpty(formObj.newSessionTime) && !Validate.validNaturalNum(formObj.newSessionTime)) ){
  				$scope.errorMsg = '会话有效时长为正整数，请修改';
	  			return false;
  			}
  			if(parseInt(formObj.newSessionTime)>30){
  				$scope.errorMsg = '会话有效时长范围为1-30分钟，请修改';
	  			return false;
  			}
  			if( parseInt(formObj.newSessionNum)< 5 || (Validate.validEmpty(formObj.newSessionNum) && !Validate.validNaturalNum(formObj.newSessionNum)) ){
  				$scope.errorMsg = '最多在线用户数范围为5及以上的正整数，请修改';
	  			return false;
  			}
  			if(parseInt(formObj.newSessionNum)>1000){
  				$scope.errorMsg = '最多在线用户数范围为5-1000的正整数，请修改';
	  			return false;
  			}
  			if( parseInt(formObj.newPwdTime) === 0 || (Validate.validEmpty(formObj.newPwdTime) && !Validate.validNaturalNum(formObj.newPwdTime)) ){
  				$scope.errorMsg = '密码有效时长为正整数，请修改';
	  			return false;
  			}
  			if(parseInt(formObj.newPwdTime) > 90 ){
  				$scope.errorMsg = '密码有效时长不得大于90天，请修改';
	  			return false;
  			}
  			if( parseInt(formObj.newPwdNum) === 0 || (Validate.validEmpty(formObj.newPwdNum) && !Validate.validNaturalNum(formObj.newPwdNum)) ){
  				$scope.errorMsg = '密码允许错误次数为正整数，请修改';
	  			return false;
  			}
  			if(parseInt(formObj.newPwdNum) > 20 ){
  				$scope.errorMsg = '密码允许错误次数范围为1-20次，请修改';
	  			return false;
  			}
  			if( parseInt(formObj.newLockTime) < 10 || (Validate.validEmpty(formObj.newLockTime) && !Validate.validNaturalNum(formObj.newLockTime)) ){
  				$scope.errorMsg = '用户锁定时长为10及以上正整数，请修改';
	  			return false;
  			}
  			if(parseInt(formObj.newUnLoginLockTime) < 1 || parseInt(formObj.newUnLoginLockTime) >30 || (Validate.validEmpty(formObj.newUnLoginLockTime) && !Validate.validNaturalNum(formObj.newUnLoginLockTime)) ){
  				$scope.errorMsg = '用户长期未登录锁定时长为1-30的正整数，请修改';
	  			return false;
  			}

  			return true;
  		};

  		/*
  		 * 为空时自动填上原来的值
  		 */
  		$scope.resetSafetyInfo = function(){
  			//console.log($scope.updateSafetyForm);
  			if(!$scope.updateSafetyForm.newSessionTime){
  				$scope.updateSafetyForm.newSessionTime = parseInt($scope.updateSafetyForm.oldSessionTime);
  			}
  			if(!$scope.updateSafetyForm.newSessionNum){
  				$scope.updateSafetyForm.newSessionNum = parseInt($scope.updateSafetyForm.oldSessionNum);
  			}
  			if(!$scope.updateSafetyForm.newPwdTime){
  				$scope.updateSafetyForm.newPwdTime = parseInt($scope.updateSafetyForm.oldPwdTime);
  			}
  			if(!$scope.updateSafetyForm.newPwdNum){
  				$scope.updateSafetyForm.newPwdNum = parseInt($scope.updateSafetyForm.oldPwdNum);
  			}
  			if(!$scope.updateSafetyForm.newLockTime){
  				$scope.updateSafetyForm.newLockTime = parseInt($scope.updateSafetyForm.oldLockTime);
  			}
  			if(!$scope.updateSafetyForm.newUnLoginLockTime){
  				$scope.updateSafetyForm.newUnLoginLockTime = parseInt($scope.updateSafetyForm.oldUnLoginLockTime);
  			}
  			$scope.apply();
  		};

  		/*
  		 * 清空提示信息
  		 */
  		$scope.clearErrMessage = function (){
  			$scope.errorMsg = '';
  			$scope.successMsg = '';
  		};

  		$scope.apply = function() {
  			if(!$scope.$$phase) {
  			    $scope.$apply();
  			}
  		};
}]);

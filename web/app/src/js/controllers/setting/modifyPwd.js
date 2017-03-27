'use strict';

angular.module('myappApp')
  	.controller('ModifyPwdCtrl', ['$scope', '$rootScope','$location','$timeout', 'Validate',function ($scope, $rootScope, $location, $timeout, Validate) {
        var validFormatObj = {
            dirty:false,
            valid:true,
            invalid:false,
            error:{
                required:false,
                format:false,
                same:false
            }
        };

        /*
         * 初始化
         */
        $scope.init = function () {
            $scope.errorMsg = '';
  			$scope.successMsg = '';
            $scope.pathStr = $location.path();
            $scope.userModifyForm = {};
            $scope.userModifyForm.username = $rootScope.userName;
            $scope.selfValid();
        };

        /*
	     * 点击请求修改密码
	     */
	    $scope.modifyHash = function( ev ){
	    	var it = angular.element(ev.target);
            // 表单验证
    		if(!$scope.validatePwdForm('all')){
    			return false;
    		}
            var postData = {
                'userName':$scope.userModifyForm.username,
                'hash': $scope.userModifyForm.oldPwd,
                'newhash': $scope.userModifyForm.newPwd
            };
            console.log(postData);
            it.addClass('disabled').text('提交中...');
            // 发送请求到后台，可能返回原密码错误、修改密码成功、修改密码失败
            // 实际要发送请求,这里只是假设
            var flag = Math.floor(Math.random()*2);
            $timeout(function(){
                it.removeClass('disabled').text('保存');
                if(flag){
                    $scope.successMsg = '修改成功';
                    $scope.errorMsg = '';
                }
                else{
                    $scope.successMsg = '';
                    $scope.errorMsg = '修改失败';
                }
                $scope.apply();
            },500);
        };

        /*
         * 修改密码验证
         */
        $scope.validatePwdForm = function ( type ){
            var validDirtyObj = angular.extend({},validFormatObj,{dirty:true}),
                validNotObj = angular.extend({},validDirtyObj,{valid:false,invalid:true});

            // 清除提示
            $scope.errorMsg = '';
            $scope.successMsg = '';
            $scope.apply();

            // 原密码
            if(type.indexOf('oldPwd')>-1 || type.indexOf('all')>-1){
                $scope.validate.oldPwd = angular.extend({},validDirtyObj);
                if(!$scope.userModifyForm.oldPwd){
                    $scope.validate.oldPwd = angular.extend({},validNotObj,{
                        error:{
                            required:true,
                            format:false,
                            same:false
                        }
                    });
                    $scope.apply();
                    return false;
                }
                else if(!Validate.validComplexHash($scope.userModifyForm.oldPwd)){
                    $scope.validate.oldPwd = angular.extend({},validNotObj,{
                        error:{
                            required:false,
                            format:true,
                            same:false
                        }
                    });
                    $scope.apply();
                    return false;
                }
            }
            // 新密码
	    	if(type.indexOf('newPwd')>-1 || type.indexOf('all')>-1){
                $scope.validate.newPwd = angular.extend({},validDirtyObj);
                if(!$scope.userModifyForm.newPwd){
                    $scope.validate.newPwd = angular.extend({},validNotObj,{
                        error:{
                            required:true,
                            format:false,
                            same:false
                        }
                    });
                    $scope.apply();
                    return false;
                }
                else if(!Validate.validComplexHash($scope.userModifyForm.newPwd)){
                    $scope.validate.newPwd = angular.extend({},validNotObj,{
                        error:{
                            required:false,
                            format:true,
                            same:false
                        }
                    });
                    if($scope.userModifyForm.repeatPwd && $scope.userModifyForm.repeatPwd !== $scope.userModifyForm.newPwd){
                        $scope.validate.repeatPwd = angular.extend({},validNotObj,{
                            error:{
                                required:false,
                                format:false,
                                same:true
                            }
                        });
                    }
                    $scope.apply();
                    return false;
                }
                else if($scope.userModifyForm.repeatPwd && $scope.userModifyForm.repeatPwd !== $scope.userModifyForm.newPwd){
                    $scope.validate.repeatPwd = angular.extend({},validNotObj,{
                        error:{
                            required:false,
                            format:false,
                            same:true
                        }
                    });
                    $scope.apply();
                    return false;
                }
                else if($scope.userModifyForm.repeatPwd && $scope.userModifyForm.repeatPwd === $scope.userModifyForm.newPwd){
                    $scope.validate.repeatPwd.valid = true;
                    $scope.validate.repeatPwd.invalid = false;
                    $scope.validate.repeatPwd.error.same= false;
                }
            }
            // 确认新密码
            if(type.indexOf('repeatPwd')>-1 || type.indexOf('all')>-1){
                $scope.validate.repeatPwd = angular.extend({},validDirtyObj);
                if(!$scope.userModifyForm.repeatPwd){
                    $scope.validate.repeatPwd = angular.extend({},validNotObj,{
                        error:{
                            required:true,
                            format:false,
                            same:false
                        }
                    });
                    $scope.apply();
                    return false;
                }
                else if(!Validate.validComplexHash($scope.userModifyForm.repeatPwd)){
                    $scope.validate.repeatPwd = angular.extend({},validNotObj,{
                        error:{
                            required:false,
                            format:true,
                            same:false
                        }
                    });
                    $scope.apply();
                    return false;
                }
                else if($scope.userModifyForm.newPwd && $scope.userModifyForm.repeatPwd !== $scope.userModifyForm.newPwd){
                    $scope.validate.repeatPwd = angular.extend({},validNotObj,{
                        error:{
                            required:false,
                            format:false,
                            same:true
                        }
                    });
                    $scope.apply();
                    return false;
                }
            }
            $scope.apply();
            return true;
        };

        /*
         * 自定义验证
         */
        $scope.selfValid = function (){
            $scope.validate = {
                oldPwd:{},
                newPwd:{},
                repeatPwd:{}
            };
            angular.forEach($scope.validate,function(v,k){
                $scope.validate[k] = angular.extend({},validFormatObj);
            });
            // console.log($scope.validate);
        };

        $scope.apply = function() {
            if(!$scope.$$phase) {
                $scope.$apply();
            }
        };
    }]);

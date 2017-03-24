'use strict';
angular.module('myappApp')

  	.controller('LoginCtrl', ['$rootScope', '$scope', '$location','$http','Validate',function ($rootScope, $scope, $location,$http,Validate) {
        var viewHeight = $(window).height(),
            mainHeight = 530,
            footerHeight = 42,
            headerHeight = 72;

  		/*
  		 * 初始化
  		 */
	   	$scope.init = function () {
            $scope.mainHeight = viewHeight - footerHeight - headerHeight;
            if($rootScope.userLogStatus === 'logout'){
                $scope.postLogout();
            }
	   		$rootScope.userName = '';
	   		$scope.ajaxLoginFlag = false;
            $scope.allUser = [];
			$scope.userName = '';
			$scope.code = '';
			$scope.checkCode = '';
			$scope.codeValue = '';
            $scope.codeStr = '';
			$scope.formatErrorMsg();
			$scope.bindEvent();
			// 验证码
			$scope.createCode();
	    };

        /*
		*  生成验证码
		*/
	    $scope.createCode = function(){
            var authArr = ['','JEFB','YXDN','8KLT','NQET','EGVL'],
                authNum = parseInt(Math.random()*5 + 1),
                authImage = 'authImage' + authNum;
            $scope.codeValue = '../../src/images/authCode/' + authImage + '.jpg';
            $scope.codeStr = authArr[authNum];
            $scope.apply();
            // 实际生产环境是服务器端生成验证码图片的
	    	/*var srcValue =  window.location.protocol + '//'+ window.location.host + '/authImage?' + new Date().getTime();
	    	$scope.codeValue = srcValue;*/
            // console.log($scope.codeStr);
	    };

		/*
		*  格式化错误信息
		*/
		$scope.formatErrorMsg = function(){
			$scope.loginError = false;
			$scope.errorMsg = '';
			$scope.apply();
		}

        /*
         * 自适应重绘
         */
        $scope.renderStyle = function(){
            $scope.mainHeight = $(window).height() - footerHeight - headerHeight;
            $scope.apply();
        };

		/*
		*  事件绑定
		*/
		$scope.bindEvent = function(){
			$('form').on('keypress','input',function(evt){
		      	if (evt.keyCode == 13) {
					$scope.clickLogin();
		      	}else{
		      		$scope.formatErrorMsg();
		      	}
			});
			$('form').on('blur','input', function(ev){
				var it = ev.currentTarget;
				it.value =  $.trim( it.value );
				$scope.formatErrorMsg();
			});
            $(window).resize(function(){
                $scope.renderStyle();
            });
		};

		/*
		*  表单验证
		*/
		$scope.validForm = function(){
            if( !Validate.validEmpty($scope.userName) || !Validate.validEmpty($scope.code) ){
				$scope.loginError = true;
				$scope.errorMsg = '用户名或密码不能为空';
			}else if(!Validate.validLength($scope.userName)){
				$scope.loginError = true;
				$scope.errorMsg = '用户名输入过长';
			}else if(!Validate.validLength($scope.code)){
				$scope.loginError = true;
				$scope.errorMsg = '密码输入过长';
			}else if( !Validate.validEmpty($scope.checkcode)){
				$scope.loginError = true;
				$scope.errorMsg = '验证码不能为空';
			}
			else{
				$scope.formatErrorMsg();
			}
			$scope.apply();
			return !$scope.loginError;
		};

		/*
		 * 点击登录
		 */
		$scope.clickLogin = function(){
            // 登录表单验证
			if( !$scope.validForm() ){
				return false;
			}
			$scope.postLogin();
		};

		/*
		*  登录提交
		*/
		$scope.postLogin = function(){
			if( $scope.ajaxLoginFlag ){
				return false;
			}
			var user = {
				'userName':$scope.userName,
				'hash':hex_md5($scope.code),
				'verCode':$scope.checkcode
			};
            $scope.ajaxLoginFlag = true;
            // 验证码匹配
            if(user.verCode.toUpperCase() !== $scope.codeStr){
                $scope.loginError = true;
                $scope.errorMsg = '验证码错误';
                return false;
            }
            // 登录认证
            $scope.identify(user);
		};

        /*
        * 判断所有用户列表是否含有用户
        */
        $scope.identify = function(user){
            $scope.ajaxLoginFlag = false;
            $scope.apply();
            $http.get('/data/userSetting/getUserList.json',{cache:true}).then(function success(response){
                if(response.status === 200){
                    var userInfo = undefined;
                    $scope.allUser = response.data;
                    if($scope.allUser){
                        angular.forEach($scope.allUser,function(data,index,array){
                            if(data.userName === user.userName && data.hash === user.hash){
                                userInfo = data;
                                return;
                            }
                        });
                        $scope.loginAndThen(userInfo);
                    }
                    $scope.apply();
                }
            },function error(){
                console.log('因为网络原因请求失败');
            });
        };

        /*
        * 登录成功后的一些操作
        */
        $scope.loginAndThen = function(userInfo){
            if(userInfo){
                // 密码不传前端
                userInfo.hash = '';
                $rootScope.userName = $scope.userName = userInfo.userName;
                $rootScope.roleId = $scope.roleId = userInfo.roleId;
                $rootScope.userInfo = $scope.userInfo = userInfo;
                $rootScope.userLogStatus = 'login';
                $scope.formatErrorMsg();
                if( $scope.roleId === -1 ){
                    $location.path('/setting/users');
                    return false;
                }
                if( $scope.roleId === -2){
                    $location.path('/setting/auditIndex');
                    return false;
                }
                if( $scope.roleId === -3){
                    $location.path('/setting/assess');
                    return false;
                }
                window.location.href = './setting';
                return false;
            }
            else{
                $scope.loginError = true;
                $scope.errorMsg = '用户名或密码错误';
                $scope.apply();
                //重新生成验证码
                $scope.createCode();
            }
        };

		/*
		*  退出登录
		*/
		$scope.postLogout = function(){
        	$rootScope.userName = null;
            $scope.userName = null;
            $rootScope.roleId = $scope.roleId = null;
            $rootScope.userInfo = $scope.userInfo = undefined;
            $scope.apply ();
			$location.path('/login');
		};

        $scope.apply = function() {
            if(!$scope.$$phase) {
                $scope.$apply();
            }
        };

  	}]);

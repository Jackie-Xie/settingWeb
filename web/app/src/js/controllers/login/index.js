angular.module('myappApp')
  	.controller('LoginCtrl', function ($rootScope, $scope, $timeout, $location,$http,Validate) {

  		/**
  		 * 初始化
  		 */
	   	$scope.init = function () {
	   		$scope.postLogout();
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

        /**
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

		/**
		*  格式化错误信息
		*/
		$scope.formatErrorMsg = function(){
			$scope.loginError = false;
			$scope.errorMsg = '';
			$scope.apply();
		}

		/**
		*  事件绑定
		*/
		$scope.bindEvent = function(){
			$('form').on('keypress','input',function(evt){
		      	if (evt.keyCode == 13) {
					if( !$scope.validForm() ){
						return false;
					}
					$scope.postLogin();
		      	}else{
		      		$scope.formatErrorMsg();
		      	}
			});
			$('form').on('blur','input', function(ev){
				var it = ev.currentTarget;
				it.value =  $.trim( it.value ) ;
				$scope.formatErrorMsg();
			});
		}

		/**
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
			if(!$scope.$$phase) {
			  	$scope.$apply();
			}
			return !$scope.loginError;
		};

		/**
		 * 点击登录
		 */
		$scope.clickLogin = function(){
            // 登录表单验证
			if( !$scope.validForm() ){
				return false;
			}
			$scope.postLogin();
		};

		/**
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

        /**
        * 判断所有用户列表是否含有用户
        */
        $scope.identify = function(user){
            $http.get('/data/userSetting/getUserList.json',{cache:true}).then(function success(response){
                if(response.status === 200){
                    $scope.allUser = response.data;
                    if($scope.allUser){
                        $.each($scope.allUser,function(k,v){
                            if(v.userName === user.userName && v.hash === user.hash){
                                $scope.loginAndThen(v);
                                return;
                            }
                        });
                    }
                    $scope.apply();
                }
            },function error(){
                console.log('因为网络原因请求失败');
            });
        };

        /**
        * 登录成功后的一些操作
        */
        $scope.loginAndThen = function(userInfo){
            if(userInfo){
                $rootScope.userName = $scope.userName = userInfo.userName;
                $rootScope.roleId = $scope.roleId = userInfo.roleId;
                $rootScope.userInfo = $scope.userInfo = userInfo;
                
                $scope.formatErrorMsg();
                if( $scope.roleId === -1 ){
                    $location.path('/setting/users');
                    return false;
                }
                if( $scope.roleId === -2){
                    $location.path('/setting/audit');
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

            $scope.ajaxLoginFlag = false;
        };

		/**
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

  	});

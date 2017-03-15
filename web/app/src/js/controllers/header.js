angular.module('myappApp')
  	.controller('HeaderCtrl', ['$scope', '$rootScope', '$window', '$location', '$timeout', '$cookieStore', 'AjaxServer','Validate',function ($scope, $rootScope, $window, $location, $timeout, $cookieStore, AjaxServer,Validate) {
  		var apiLogoutUrl = '/mdmp/account/logout',
			apiUser = '/mdmp/user',
  			defaultUser = {
				'userId': 0,
  				'username': '',
  				'password':'',
  				'newPassword':'',
  				'confirmPassword':'',
  			},
  			$changePwModal = undefined,
            $subModal = undefined,
            dieTimer = 1000;

	   	$scope.init = function () {
	    	$scope.pathStr = $location.path();
	    	$scope.errorMsg = '';
            $scope.noticeMsg = '';
			$scope.sysError = '';
	    	$scope.pageRightList = '';
	    	$scope.getLocalLoginInfo();
            $scope.formatSelfValidate();

	    	// 页面跳转后自动清除定时刷新，节省浏览器资源
	        $('body').on('click','.nav li', function(){
	        	$scope.getLocalLoginInfo();
	        	if($scope.stopRefresh){
	        		$scope.stopRefresh();
	        	}
	        });

	        // 清除登出效果
	        $rootScope.$on('logout', $scope.clearLoginInfo);
	        // 读取本地登入信息
	        $rootScope.$on('updateLogin', $scope.getLocalLoginInfo);
	        // 记录登入信息
	        /*$rootScope.$on('login', function(event){
	        	//$location.path(directUrl);
	        	//console.log( $rootScope.pageRightList );
	        	$scope.saveLoginInfo();

	        });*/
			if($rootScope.userLogStatus && $rootScope.userLogStatus.indexOf('login') > -1){
				$scope.saveLoginInfo();
			}

	        // 判断是否已经登录
	        if( !$cookieStore || !$cookieStore.get('mdUser') ){
                $location.path('/login');
	        }

	    };

	    /*
	     * 弹窗初始化
	     */
	    $scope.initModal = function () {
	    	$changePwModal = $('#J_changePwModal');
            $subModal = $('#J_sysSubMsg ');
	    };

	    $scope.clickChangePw = function(){
	    	$scope.getLocalLoginInfo();
	    	$scope.theUser = $.extend({},defaultUser);
	    	$scope.errorMsg = '';
            $scope.formatSelfValidate();
	    	$scope.apply();
	    	$('#J_changePwModal').modal('show');
	    };

	    $scope.confirmChange = function(ev){
	    	var it = $(ev.target);
	    	if(it.hasClass('disabled')){
	    		return false;
	    	}
	    	if( $scope.validChangeForm('all') ){
	    		it.addClass('disabled');
                var ajaxConfig = {
                    method: 'post',
                    url: apiUser + '/' + $scope.theUser.userId + '?changePwd',
                    data: {
						'account': $scope.theUser.username,
                        'oldpassword': hex_md5($scope.theUser.password),
                        'password': hex_md5($scope.theUser.newPassword)
                    }
                };
                AjaxServer.ajaxInfo( ajaxConfig, function(data){
                    it.removeClass('disabled');
                    if(data){
                        $scope.noticeMsg = '修改成功';
                        $('#J_changePwModal').modal('hide');
                        // 延时关闭弹窗
                        $timeout(function() {
                            $('#J_sysSubMsg ').modal('hide');
                            $scope.theUser = {};
                        }, dieTimer);
                        $('#J_sysSubMsg ').modal('hide');
                    }
                }, function( error ) {
                    it.removeClass('disabled');
					$scope.sysError = error.errMsg || '系统未知错误，请联系开发人员';
					$scope.apply();
                });
            }
	    };

	    $scope.validChangeForm = function( type ){
            // 原密码
            if(type.indexOf('oldPwd')>-1 || type.indexOf('all')>-1){
                $scope.validate.password.oldPwd.valid = true;
                $scope.validate.password.oldPwd.invalid = false;
                $scope.validate.password.oldPwd.error.required= false;
                $scope.validate.password.oldPwd.error.format= false;
                $scope.validate.password.oldPwd.dirty = true;
                if(!$scope.theUser.password){
                    $scope.validate.password.oldPwd.valid = false;
                    $scope.validate.password.oldPwd.invalid = true;
                    $scope.validate.password.oldPwd.error.required= true;
                    $scope.apply();
                    return false;
                }
                else if(!Validate.validComplexHash($scope.theUser.password)){
                    $scope.validate.password.oldPwd.valid = false;
                    $scope.validate.password.oldPwd.invalid = true;
                    $scope.validate.password.oldPwd.error.format= true;
                    $scope.apply();
                    return false;
                }
            }
            // 新密码
	    	if(type.indexOf('newPwd')>-1 || type.indexOf('all')>-1){
                $scope.validate.password.newPwd.valid = true;
                $scope.validate.password.newPwd.invalid = false;
                $scope.validate.password.newPwd.error.required= false;
                $scope.validate.password.newPwd.error.format= false;
                $scope.validate.password.newPwd.dirty = true;
                if(!$scope.theUser.newPassword){
                    $scope.validate.password.newPwd.valid = false;
                    $scope.validate.password.newPwd.invalid = true;
                    $scope.validate.password.newPwd.error.required= true;
                    $scope.apply();
                    return false;
                }
                else if(!Validate.validComplexHash($scope.theUser.newPassword)){
                    $scope.validate.password.newPwd.valid = false;
                    $scope.validate.password.newPwd.invalid = true;
                    $scope.validate.password.newPwd.error.format= true;
                    if($scope.theUser.confirmPassword && $scope.theUser.confirmPassword !== $scope.theUser.newPassword){
                        $scope.validate.password.confirmPwd.valid = false;
                        $scope.validate.password.confirmPwd.invalid = true;
                        $scope.validate.password.confirmPwd.error.format= true;
                    }
                    $scope.apply();
                    return false;
                }
                else if($scope.theUser.confirmPassword && $scope.theUser.confirmPassword !== $scope.theUser.newPassword){
                    $scope.validate.password.confirmPwd.valid = false;
                    $scope.validate.password.confirmPwd.invalid = true;
                    $scope.validate.password.confirmPwd.error.format= true;
                    $scope.apply();
                    return false;
                }
                else{
                    $scope.validate.password.confirmPwd.valid = true;
                    $scope.validate.password.confirmPwd.invalid = false;
                    $scope.validate.password.confirmPwd.error.format= false;
                }
            }
            // 确认新密码
            if(type.indexOf('confirmPwd')>-1 || type.indexOf('all')>-1){
                $scope.validate.password.confirmPwd.valid = true;
                $scope.validate.password.confirmPwd.invalid = false;
                $scope.validate.password.confirmPwd.error.required= false;
                $scope.validate.password.confirmPwd.error.format= false;
                $scope.validate.password.confirmPwd.dirty = true;
                if(!$scope.theUser.confirmPassword){
                    $scope.validate.password.confirmPwd.valid = false;
                    $scope.validate.password.confirmPwd.invalid = true;
                    $scope.validate.password.confirmPwd.error.required= true;
                    $scope.apply();
                    return false;
                }
                else if(!Validate.validComplexHash($scope.theUser.confirmPassword) || $scope.theUser.confirmPassword !== $scope.theUser.newPassword){
                    $scope.validate.password.confirmPwd.valid = false;
                    $scope.validate.password.confirmPwd.invalid = true;
                    $scope.validate.password.confirmPwd.error.format= true;
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
        $scope.formatSelfValidate = function () {
            $scope.validate = {
                password:{
                    oldPwd: {
                        dirty: false,
                        valid: true,
                        invalid: false,
                        error:{
                            required: false,
                            format: false
                        }
                    },
                    newPwd: {
                        dirty: false,
                        valid: true,
                        invalid: false,
                        error:{
                            required: false,
                            format: false
                        }
                    },
                    confirmPwd: {
                        dirty: false,
                        valid: true,
                        invalid: false,
                        error:{
                            required: false,
                            format: false
                        }
                    }
                }
            };
        };

        /*
         * 改变验证状态
         */
        $scope.changeStatus = function ( type ) {
             $scope.validChangeForm(type);
        };

	    $scope.clickLogout = function(){
	    	var ajaxConfig = {
                method: 'post',
                url: apiLogoutUrl,
                data: {
                    'username': $scope.username
		    		/*'userId': $rootScope.userId,
		    		'sessionId': $rootScope.sessionId,*/
                }
            };
            AjaxServer.ajaxInfo( ajaxConfig, function( data ){
                $location.path('/login');
				$rootScope.userLogStatus = 'logout';
				$scope.clearLoginInfo();
				$scope.clearClientStorage();
            }, function( error ) {
                console.log(error);
            });
	    };

	    $scope.clearLoginInfo = function(){
	    	$rootScope.name = $scope.name = '';
	    	$rootScope.username = $scope.username = '';
	    	$rootScope.userId = $scope.userId = '';
	    	$rootScope.sessionId = $scope.sessionId = '';
	    	$rootScope.roleId = $scope.roleId = '';
	    	$scope.pageRightList = '';
            if( $cookieStore && $cookieStore.get('mdUser') ){
                 $cookieStore.remove("mdUser");
            }
            $scope.apply();
            //$location.path('/login');
	    };


	    $scope.saveLoginInfo = function(){
	    	var user = {
	    		'username': $rootScope.username,
	    		'name': $rootScope.name,
	    		'userId': $rootScope.userId,
	    		'pageRightList': $rootScope.pageRightList,
	    		'roleId': $rootScope.roleId
	    	};

	    	if( $cookieStore && $cookieStore.get('mdUser') ){
                 $cookieStore.remove("mdUser");
            }

	    	if($cookieStore){
				$cookieStore.put('mdUser', user);
			}

	    	$scope.username = $rootScope.username;
	    	$scope.name = $rootScope.name;
	    	$scope.userId = $rootScope.userId;
	    	$scope.roleId = $rootScope.roleId;
	    	$scope.apply();
	    };

	    $scope.getLocalLoginInfo = function(){
	    	var user;
	    	if($cookieStore && $cookieStore.get('mdUser')){
				user = $cookieStore.get('mdUser');
				$rootScope.username = user.username;
				$rootScope.name = user.name;
				$rootScope.userId = user.userId;
				$rootScope.pageRightList = user.pageRightList;
				$rootScope.roleId = user.roleId;
			}
			$scope.username = $rootScope.username || '';
			$scope.name = $rootScope.name || '';
	    	$scope.userId = $rootScope.userId || '';
	    	$scope.pageRightList = $rootScope.pageRightList || '';
	    	$scope.roleId = $rootScope.roleId || '';
	    	defaultUser.username = $scope.username;
			defaultUser.userId = $scope.userId;
	    };

		$scope.clearClientStorage = function (){
			if($window.localStorage){
				$window.localStorage.clear();
			}
			if($window.sessionStorage){
				$window.sessionStorage.clear();
			}
		};

        $scope.apply = function() {
            if(!$scope.$$phase) {
                $scope.$apply();
            }
        };
  	}]);

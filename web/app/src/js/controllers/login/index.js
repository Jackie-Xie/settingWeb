angular.module('myappApp')
  	.controller('LoginCtrl', function ($rootScope, $scope, $timeout, $location, AjaxServer, Validate) {
        var viewHeight = $(window).height(),
            mainHeight = 530,
            footerHeight = 42,
            headerHeight = 72;

  		/**
  		 * 初始化
  		 */
	   	$scope.init = function () {
            $scope.mainHeight = viewHeight - footerHeight - headerHeight;
	   		$scope.postLogout();
	   		$rootScope.userName = '';
	   		$rootScope.onlyPwd = false;
	   		$scope.ajaxLoginFlag = false;
			$scope.userName = '';
			$scope.code = '';
			$scope.checkCode = '';
			$scope.codeValue = '';
			$scope.formatErrorMsg();
			$scope.bindEvent();
			//验证码
			$scope.createCode();
	    };


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
            console.log($scope.codeStr);
	    };

		/**
		*  格式化错误信息
		*/
		$scope.formatErrorMsg = function(){
			$scope.loginError = false;
			$scope.errorMsg = '';
			if(!$scope.$$phase) {
			  	$scope.$apply();
			}
		}

        /*
         * 自适应重绘
         */
        $scope.renderStyle = function(){
            $scope.mainHeight = $(window).height() - footerHeight - headerHeight;
            $scope.apply();
        };

		/**
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
				it.value =  $.trim( it.value ) ;
				$scope.formatErrorMsg();
			});
            $(window).resize(function(){
                $scope.renderStyle();
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
			$scope.apply();
			return !$scope.loginError;
		};

		/**
		 * 点击登录
		 */
		$scope.clickLogin = function(){
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
				'hash':$scope.code,
				'verCode':$scope.checkcode
			};
            config = {
                'method':'post',
  				'data': user,
  				'url':$scope.apiLoginUrl
            };
            $scope.ajaxLoginFlag = true;
            AjaxServer.ajaxInfo( config, function (data){
            	$scope.ajaxLoginFlag = false;
                if( data.result && data.result == 'success' ){
                	$rootScope.onlyPwd = false;
                	$rootScope.userName = $scope.userName = data.userInfo.user.userName;
                	if( data.message && data.message.indexOf('请重置密码')>-1 ){
	                	//console.log('重置密码');
	                	$scope.loginError = true;
	                	$scope.errorMsg = data.message;
	                	$rootScope.onlyPwd = true;
	                	if(!$scope.$$phase) {
			  			    $scope.$apply();
			  			}
	                	$timeout( function(){
	                		$location.path('/setting/modify');
	                	},800 );
	                	return false;
	                }
                	$rootScope.roleId = $scope.roleId = data.userInfo.user.roleId;
                	$rootScope.provinceName = $scope.provinceName = data.userInfo.user.businessGroup && data.userInfo.user.businessGroup.province && data.userInfo.user.businessGroup.province.name;
                	$rootScope.userInfo = $scope.userInfo = data.userInfo;
    				$scope.formatErrorMsg();
    				if( $scope.roleId == -1 ){
    					$location.path('/setting/users');
    					return false;
    				}
    				if( $scope.roleId == -2){
    					$location.path('/setting/audit');
    					return false;
    				}
    				if( $scope.roleId == -3){
    					$location.path('/setting/assess');
    					return false;
    				}
    				window.location.href = './home.html';
    				return false;
                }

				$scope.loginError = true;
				$scope.errorMsg = data.error;
				//重新生成验证码
				$scope.createCode();
            },
            function (status){
            	$scope.ajaxLoginFlag = false;
                var errorMessage = status  || '网络原因';
				errorMessage = '因为' + errorMessage + '请求失败。';
				$rootScope.onlyPwd = false;
				//重新生成验证码
				$scope.createCode();
            });
		};

		/**
		*  退出登录
		*/
		$scope.postLogout = function(){
            var config = {
                'method':'post',
                'data': '',
  				'url':$scope.logoutUrl
            };
            AjaxServer.ajaxInfo( config, function (data){
                if(data.success=='退出'){
                	$rootScope.userName = null;
    				$location.path('/login');
                }else{
                	$location.path('/login');
                }
            },
            function (status){
                var errorMessage = status  || '网络原因';
				errorMessage = '因为' + errorMessage + '请求失败。';
				console.log(errorMessage);
            });
		};

        $scope.apply = function() {
            if(!$scope.$$phase) {
                $scope.$apply();
            }
        };

  	});

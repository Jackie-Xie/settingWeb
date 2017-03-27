'use strict';

angular.module('myappApp')
  	.controller('UserSettingCtrl', function ($scope, $rootScope, $window, $location,$http, $timeout, AjaxServer, Validate,PageService) {
  		var defaultPager = {                    						  // 默认分页参数
                total: 0, 								  				  // 总条数
                curPage: 1, 						      				  // 当前页码
                pagesNum: 1, 						  	  				  // 总页数
                pageSize: 5 							  				  // 每页存放条数
            },
  			$userAddModal = null,
  			$userEditModal = null,
  			$userOprConfirm = null,
  			$userPwdModal = null,
  			modalArr = [],
  			selected = [];


	   	$scope.init = function () {
	   		$scope.pathStr = $location.path();
            $scope.userShowFlag = 'loading';
            $scope.queryUser = {};
            $scope.actionType = 'add';                                    // 标志是add还是update
            $scope.jumpNum = 1;                                           // 分页默认跳转页码
            $scope.userInfoList = [];
            $scope.roleList = [];
            $scope.businessGroupOptions = [];
            $scope.pager = $.extend( {}, defaultPager);

	    	$scope.modalTitle = '';
	    	$scope.modalInfo = '';
	    	$scope.partRoleList = [];
	    	$scope.userModifyForm = {'oldPwd':'','newPwd':'','repeatPwd':''};
	    	$scope.userPwdForm = {};
	    	$scope.userForm = {};
	    	$scope.searchErrorMsg = '';
	    	$scope.FailedMsg ='';
	    	$scope.oprType = '';
	    	$scope.selected = [];
	   		$userAddModal = $('#J_userAddModal');
	   		$userEditModal = $('#J_userEditModal');
	   		$userOprConfirm = $('#J_userOprConfirm');
	   		$userPwdModal = $('#J_userHashModal');

            /*
             *  根据不同页面地址，发送不同请求
             */
            if(typeof($location.path())==='string'){
	            if($location.path().indexOf('users')>-1){
	    	    	$scope.getRoleList();
                    $scope.getStatusOptions();
                    $scope.getBusinessGroupOptions();
	                $scope.getUserInfoListByConditions();
	            }
	            if($location.path().indexOf('modify')>-1){
	                $scope.userModifyForm.username = $rootScope.userName;
	        		$scope.apply();
	            }
            }
            $scope.bindEvent();
	   		$scope.formatModals();

            $scope.test();
	    };

        /*
         * 查询
         */
        $scope.query = function( flag ){
            $scope.userShowFlag = 'loading';
            if( flag ){
                $scope.pager =  $.extend( {}, defaultPager);
            }
            $scope.apply();
            $scope.getUserInfoListByConditions();
        };

        /*
         * 按条件查询获取用户列表数据
         */
        $scope.getUserInfoListByConditions = function (){
            var conditions= {
                userName: $scope.queryUser.userName || undefined,
                roleId: $scope.queryUser.roleId || undefined,
                businessGroupId: $scope.queryUser.groupId || undefined,
                status: $scope.queryUser.userStatus === 0 ? 0 : ( $scope.queryUser.userStatus || undefined )
            };
            $http.get('/data/userSetting/getUserList.json').then(function(response){
                var data = {};
                if(response.status === 200){
                    if(response.data && response.data.length > 0){
                        data = PageService.page($scope.pager.curPage,$scope.pager.pageSize,response.data,conditions);
                    }

                    if(!data || !data.result || data.result.length===0){
                        $scope.userShowFlag = '无查询结果';
                        $scope.userInfoList = [];
                    }
                    else{
                        $scope.userShowFlag = '';
                        $scope.userInfoList = data.result;
                        $scope.pager =  $.extend( {}, defaultPager,{
                            total: data.total,
                            curPage: data.curPage,
                            pagesNum: data.pagesNum,
                            pageSize: data.pageSize
                        });
                    }
                    $scope.apply();
                }
            },function(){
                $scope.userShowFlag = '因为网络原因请求失败';
                $scope.userInfoList = [];
                $scope.apply();
            });
        };

        /*
         * 获取角色选项
         */
        $scope.getRoleList = function(){
            $http.get('/data/roles/getRoleList.json',{cache: true}).then(function (response){
                if(response.status === 200){
                    $scope.roleList = response.data;
                    $scope.apply();
                }
            },function (){
                console.log('因为网络原因请求失败');
            });
        };

        /*
         * 获取单位选项
         */
        $scope.getBusinessGroupOptions = function(roleId , type , businessGroupId){
            var id = parseInt(roleId);
            //角色为数据中心的，不调所属单位选项
            $scope.businessGroupOptions = [];
            if(!id){
                //处理修改用户时的反悔
                if(typeof(type)=='string' && type.indexOf('roleapply')>-1){
                    id = $scope.userForm.roleselect;
                    businessGroupId = $scope.handleBusinessGroupId;
                    $scope.handleBusinessGroupShow = true;
                }else{
                    $scope.handleBusinessGroupShow = false;
                    return false;
                }
            }
            if(id<3){
                $scope.handleBusinessGroupShow = false;
                return false;
            }
            $http.get('/data/businessGroup/getBusinessGroup.json').then(function (response){
                if(response.status === 200){
                    var data = response.data;
                    if(!!data){
                        var BusinessGroupObj = null;
                        $.each(data,function(i){
                            BusinessGroupObj = {
                                'id':data[i].id,
                                'bgname':data[i].cnName || data[i].name
                            }
                            //如果单位所在省或省ID没有
                            if(!!data[i].provinceId || !!data[i].province){
                                $scope.businessGroupOptions.push(BusinessGroupObj);
                            }
                        });

                        if(typeof(type)=='string' && (type.indexOf('update')>-1 || type.indexOf('roleapply')>-1)){
                            $scope.userForm.groupselect = businessGroupId;
                            $scope.apply();
                        }
                    }
                }
            },function (){
                console.log('因为网络原因请求失败');
            });
        };

        /*
         * 获取用户状态选项
         */
        $scope.getStatusOptions = function(){
            $scope.statusOptions = [
                {
                    id: 1,
                    value:'正常'
                },
                {
                    id: 0,
                    value:'锁定/审核中'
                },
                {
                    id: -1,
                    value:'注销'
                }
            ];
        };

        /*
         *  跳转页面
         */
        $scope.gotoPage = function( targetPage ){
            if(!targetPage || targetPage > $scope.pager.pagesNum || targetPage < 1){
                $scope.jumpNum = '';
                $scope.apply();
                return false;
            }

            $scope.pager.curPage = parseInt(targetPage);
            $scope.clearChecked();
            // 获取数据
            if(typeof($location.path())==='string' && $location.path().indexOf('users') > -1){
                $scope.query();
            }
        };

        /*
         * 点击添加用户
         */
        $scope.clickAdd = function(){
            $scope.clearChecked();
            $scope.modalTitle = '添加';
            $scope.actionType = 'add';
            $('#J_username').removeAttr('readonly');
            $scope.clickShowModal($userAddModal);
            $scope.getRoleList();
            $scope.userForm = {'userstatus':'1','roleselect':'','isIpLimited':1,'isTimeLimited':1,'groupselect':'','issend':'1'};
            $scope.apply();
        };

        /*
         * 点击修改用户
         */
        $scope.clickEdit = function(){
            if(!!selected ){
                if(selected.length===0){
                    $scope.modalTitle = '友情提示';
                    $scope.modalInfo='您还没有选择用户，请选择一个用户进行修改';
                    $scope.oprType = 'closeModal';
                    $scope.apply();
                    $scope.clickShowModal($userOprConfirm);
                }
                else if((selected.indexOf(0)>-1) ? (selected.length > 2) : (selected.length > 1)){
                    $scope.modalTitle = '友情提示';
                    $scope.modalInfo='您选中了多个用户，只能对一个用户进行修改';
                    $scope.oprType = 'closeModal';
                    $scope.apply();
                    $scope.clickShowModal($userOprConfirm);
                }else {
                    $scope.modalTitle = '修改';
                    $scope.actionType = 'update';
                    $scope.userForm.roleapply = '';
                    $('#J_username').attr('readonly','readonly');
                    if(selected.indexOf(0)>-1){
                        var idx = selected.indexOf(0);
                        selected.splice(idx,1);
                        $scope.getUserInfoById(selected[0]);
                        selected.push(0);
                    }
                    else{
                        $scope.getUserInfoById(selected[0]);
                    }
                    $scope.apply();
                }
            }
        };

        /*
         * 点击删除用户
         */
        $scope.clickDelete = function(ev){
            var it = $(ev.currentTarget);
            if(it.hasClass('btn-custom-disabled')){
                return false;
            }
            if(!!selected ){
                if(selected.length > 0){
                    $scope.modalTitle = '注销用户';
                    $scope.modalInfo = '注销为不可逆操作，请确定是否注销此用户';
                    $scope.oprType = 'delUser';
                    $scope.apply();
                    $scope.clickShowModal($userOprConfirm);
                }
                else if(selected.length===0){
                    $scope.modalTitle = '友情提示';
                    $scope.modalInfo='您还没有选择用户，请选择一个或多个用户进行注销';
                    $scope.oprType = 'closeModal';
                    $scope.apply();
                    $scope.clickShowModal($userOprConfirm);
                }
            }
        };

        /*
         * 点击重置密码
         */
        $scope.clickResetPwd = function(ev){
            var it = $(ev.currentTarget);
            if(it.hasClass('btn-custom-disabled')){
                return false;
            }
            if(!!selected ){
                if(selected.length===0){
                    $scope.modalTitle = '友情提示';
                    $scope.modalInfo='您还没有选择用户，请选择一个用户进行修改';
                    $scope.oprType = 'closeModal';
                    $scope.apply();
                    $scope.clickShowModal($userOprConfirm);
                }
                else if((selected.indexOf(0)>-1) ? (selected.length > 2) : (selected.length > 1)){
                    $scope.modalTitle = '友情提示';
                    $scope.modalInfo='您选中了多个用户，只能对一个用户进行修改';
                    $scope.oprType = 'closeModal';
                    $scope.apply();
                    $scope.clickShowModal($userOprConfirm);
                }
                else{
                    if(selected.indexOf(0)>-1){
                        var idx = selected.indexOf(0);
                        selected.splice(idx,1);
                        $scope.getUserInfoById(selected[0],'pwd');
                        selected.push(0);
                    }
                    else{
                        $scope.getUserInfoById(selected[0],'pwd');
                    }
                    $scope.apply();
                }
            }
        };

        /*
         * 事件绑定
         */
        $scope.bindEvent = function () {
            // 分页事件
            $(".j-body").off( "click", ".j-navPager .item").off( "click", ".j-navPager .prev").off( "click", ".j-navPager .next");
            $('.j-body').on('click','.j-navPager .item', function(ev){
                var it = $(ev.currentTarget);
                $scope.gotoPage(parseInt(it.text()));
            })
            .on('click','.j-navPager .prev', function(ev){
                if($scope.pager.curPage <= 1){
                    return false;
                }
                $scope.gotoPage($scope.pager.curPage - 1);
            })
            .on('click','.j-navPager .next', function(ev){
                if($scope.pager.curPage >= $scope.pager.pagesNum){
                    return false;
                }
                $scope.gotoPage($scope.pager.curPage + 1);
            });

        };


        // test
        $scope.test = function (){

        };

	    //格式化时间选择器
	    $scope.formatTime = function () {
	    	$('.j-form-time').datetimepicker({
	    		language: 'zh-CN',
    	        autoclose: true,
    	        todayBtn: false,
    	        startDate: "00:00:00",
    	        minuteStep: 5,
    	        weekStart: 1,
				todayHighlight: 1,
				startView: 1,
				minView: 0,
				maxView: 1,
				keyboardNavigation: false,
				forceParse: true,
		        showMeridian: true,
		        formatViewType:'time'
    		});

	    };

	    /*
	     * IP是否限制
	     */
	    $scope.updateIpLimited = function () {
	    	$scope.userForm.isIpLimited = !$scope.userForm.isIpLimited;
	    	$scope.userForm.isIpLimited = $scope.userForm.isIpLimited ? 1 : 0;
  			if($scope.userForm.isIpLimited){
  				$scope.userForm.ip = '';
  			}
  			$scope.apply();
	    };

	    /*
	     * 时间限制
	     */
	    $scope.updateTimeLimited = function () {
	    	$scope.userForm.isTimeLimited = !$scope.userForm.isTimeLimited;
	    	$scope.userForm.isTimeLimited = $scope.userForm.isTimeLimited ? 1 : 0;
  			if($scope.userForm.isTimeLimited){
  				$scope.userForm.beginTime = '';
  				$scope.userForm.endTime = '';
  			}
  			$scope.apply();
	    };

        /*
	     * 点击发送请求修改密码
	     */
	    $scope.modifyHash = function( ev , type){
	    	var it = $(ev.currentTarget),
	    		flag = typeof(type)==='string' && type.indexOf('modal')>-1;

    		if(!$scope.validatePwdForm( flag,((!flag) ? $scope.userModifyForm : $scope.userPwdForm ))){
    			return false;
    		}

            var config = {
                'method':'post',
                'data':{
                        'userName': (!flag) ? $scope.userModifyForm.username : $scope.userPwdForm.username,
                        'hash': (!flag) ? $scope.userModifyForm.oldPwd : null,
                        'newhash': (!flag) ? $scope.userModifyForm.newPwd : $scope.userPwdForm.newPwd
                        },
                'url': '/account/pwd'
            };
            it.addClass('btn-custom-disabled').attr('disabled','disabled');

            AjaxServer.ajaxInfo( config , function (data){
            	it.removeClass('btn-custom-disabled').removeAttr('disabled');
                if(!!data && typeof(data.error)==='string'){
                	$scope.successMsg = '';
                	$scope.errorMsg = data.error;
                	$scope.apply();
                }

                if(!!data && typeof(data.result)==='string'){
                	if(!flag){
		                if(data.result.indexOf('修改密码成功')>-1){
		                	$scope.successMsg = '修改密码成功';
		                	$scope.errorMsg = '';
		                	$scope.apply();
		                }
	                }
                	else{
                		$scope.errorMsg = '';
                		$scope.formatModals();
                        $scope.userShowTag = true;
                        $scope.getUserInfoListByConditions('update');
                        $scope.clearChecked();
	                	$scope.apply();
                	}

	                if(data.result.indexOf('原密码错误')>-1){
	                	$scope.successMsg = '';
	                	$scope.errorMsg = '原密码错误';
	                	$scope.apply();
	                }
	                if(data.result.indexOf('修改密码失败')>-1){
	                	$scope.successMsg = '';
	                	$scope.errorMsg = '修改密码失败';
	                	$scope.apply();
	                }
                }

                if(!flag){
                	if( $scope.onlyPwd ){
                    	$timeout( function(){
                    		$location.path('/login')
                    	}, 500 );
                    	return false;
                    }
                }
            },
            function(status){
                var errorMessage = status ? '因为系统内部错误请求失败' : '因为网络原因请求失败';
                it.removeClass('btn-custom-disabled').removeAttr('disabled');
                $scope.successMsg = '';
            	$scope.errorMsg = errorMessage;
            	$scope.apply();
            });
        };

        /*
         * 修改密码验证
         */
        $scope.validatePwdForm = function ( flag, formObj ){
        	if(!flag){
	    		if(!Validate.validEmpty(formObj.oldPwd)){
	        		$scope.errorMsg = '原密码不为空，请重新输入。';
	        		$scope.apply();
	            	return false;
	        	}
	        	if(!Validate.validComplexHash(formObj.oldPwd)){
		            $scope.errorMsg = '原密码为8-25位数字和字母组合，请修改后提交。';
		            $scope.apply();
		         	return false;
		        }
	    	}

        	if(!Validate.validEmpty(formObj.newPwd)){
        		$scope.errorMsg = '新密码不为空，请重新输入。';
        		$scope.apply();
            	return false;
        	}

        	if(!flag){
        		if(formObj.oldPwd == formObj.newPwd){
            		$scope.errorMsg = '新密码不能和原密码一样。';
            		$scope.apply();
                	return false;
            	}
        	}

        	if(formObj.newPwd == formObj.username){
        		$scope.errorMsg = '新密码不能和用户名一样。';
        		$scope.apply();
            	return false;
        	}

        	if(!Validate.validComplexHash(formObj.newPwd)){
	            $scope.errorMsg = '新密码为8-25位数字和字母组合，请修改后提交。';
	            $scope.apply();
	         	return false;
	        }
        	if(!Validate.validEmpty(formObj.repeatPwd)){
        		$scope.errorMsg = '新密码两次输入不一致，请重新输入。';
        		$scope.apply();
            	return false;
        	}
        	if(!Validate.validEqual(formObj.newPwd,formObj.repeatPwd)){
        		$scope.errorMsg = '新密码两次输入不一致，请重新输入。';
        		$scope.apply();
            	return false;
        	}
        	return true;
        }

		//不能选择审核中用户
		$scope.changeTitle = function ( ev ,auditFlag ) {
			var it = $(ev.currentTarget);
			if(auditFlag === 0){
				it.attr('title','不能选择审核中用户');
			}
		}

  		/*/!*
  		 * 根据userId查询用户信息
  		 *!/
  		$scope.getUserInfoById = function( id , type){
  			if(!id){
  				return false;
  			}
  			config = {
  					'method': 'get',
  					'data':'',
  					'url':  apiGetUserList + '/' + id
  			};
  			AjaxServer.ajaxInfo( config , function( data ){
  				//判断用户是否有权修改
  				if(!!data){
	  				if(typeof(data.result)==='string' && data.result.indexOf('fail')>-1){
	  					$scope.oprType = 'closeModal';
	  					$scope.modalTitle = '友情提示';
	  					$scope.modalInfo='无权限修改，请联系管理员核对';
		                $scope.apply();
		                $scope.clickShowModal($userOprConfirm);
	  				}
	  				else if(typeof(data.error)==='string' && data.error.indexOf('fail')>-1){
	  					$scope.oprType = 'closeModal';
	  					$scope.modalTitle = '友情提示';
	  					$scope.modalInfo='用户还在审核中，请联系审核管理员';
		                $scope.apply();
		                $scope.clickShowModal($userOprConfirm);
	  				}
	  				else if(typeof(data.error)==='string' && data.error.indexOf('delete')>-1){
	  					$scope.oprType = 'closeModal';
	  					$scope.modalTitle = '友情提示';
	  					$scope.modalInfo='用户已经注销';
		                $scope.apply();
		                $scope.clickShowModal($userOprConfirm);
	  				}
	  				else{
	  					if(typeof(type)==='string' && type.indexOf('pwd')>-1){
	  						//弹窗
	  						$scope.clickShowModal($userPwdModal);
			                //修改前的数据
							$scope.userPwdForm.username = data.userName;
							$scope.apply();
	  					}else{
	  						//弹窗
			  				$scope.clickShowModal($userAddModal);
			                //修改前的数据
							$scope.userForm.username = data.userName;
							$scope.getPartRoleList( $scope.actionType , data.roleId);
							$scope.getBusinessGroupOptions( data.roleId, $scope.actionType , data.businessGroupId);

							$scope.handleBusinessGroupId = data.businessGroupId;
							$scope.userForm.rolename = (!!data.role) ? data.role.name : '暂无';
							$scope.userForm.roleselect = data.roleId;
						    $scope.userForm.emails = data.emailAddress;
						    $scope.userForm.issend = data.isSend.toString();
						    $scope.userForm.telnum = data.phone;
						    $scope.userForm.userstatus = data.status.toString();
						    $scope.userForm.isTimeLimited = data.timeFlag;
						    $scope.userForm.isIpLimited = data.accessIpFlag;
						    $scope.userForm.roledesc = data.describe;
						    //Ip限制
						    if(data.accessIpFlag){
						    	$scope.userForm.ip = '';
						    }
						    else{
						    	$scope.userForm.ip = data.accessIP;
						    }
						    //时间限制
						    if(data.timeFlag){
						    	$scope.userForm.beginTime = '';
								$scope.userForm.endTime = '';
						    }
						    else{
						    	$scope.userForm.beginTime = data.beginTime;
								$scope.userForm.endTime = data.endTime;
						    }
						    $scope.apply();
	  					}
	  				}
  				}
			},
			function( status ){
                var errorMessage = status ? '因为系统内部错误请求失败' : '因为网络原因请求失败';
                console.log(errorMessage);
                $scope.errorMsg = errorMessage;
                $scope.successMsg = '';
                $scope.apply();
			});
  		};*/

  		/*
		 * 添加或修改用户
		 */
  		$scope.addUser = function(type,ev){
  			var id = null,
  				it = $(ev.currentTarget);
  			if(selected.indexOf(0)>-1){
		    	var idx = selected.indexOf(0);
		    	selected.splice(idx,1);
		    	id = selected[0];
		    	selected.push(0);
		    }
  			else{
  				id = selected[0];
  			}

            if(typeof(type)==='string' && type.indexOf('add')>-1){
                //输入表单验证
                if(!Validate.validEmpty( $scope.userForm.username )){
                    $scope.errorMsg = '用户名称不能为空，请修改后提交。';
                    $scope.apply();
                	return false;
                }
                //验证非法字符
                var returnText = Validate.validSign($scope.userForm.username);
                if(!!returnText && !returnText.status){
                    $scope.errorMsg = returnText.error;
                    $scope.apply();
                    return false;
                }
                if(!Validate.validLength($scope.userForm.username,{minLen:4,maxLen:25})){
                    $scope.errorMsg = '用户名称为4-25个字符，请修改后提交。';
                    $scope.apply();
                	return false;
                }
                if(!Validate.validEmpty($scope.userForm.pwd)){
                    $scope.errorMsg = '用户密码不能为空，请修改后提交。';
                    $scope.apply();
                	return false;
                }
               	if($scope.userForm.pwd == $scope.userForm.username){
	        		$scope.errorMsg = '密码不能和用户名一样。';
	        		$scope.apply();
	            	return false;
	        	}
                if(!Validate.validComplexHash($scope.userForm.pwd)){
                    $scope.errorMsg = '用户密码为8-25位数字和字母，请修改后提交。';
                    $scope.apply();
                	return false;
                }
            }

	            if(!Validate.validEmpty($scope.userForm.roleselect)){
	                $scope.errorMsg = '用户角色不能为空，请修改后提交。';
	                $scope.apply();
	            	return false;
	            }
	            if($scope.userForm.roleselect >= 3){
	            	if(!Validate.validEmpty($scope.userForm.groupselect)){
	                    $scope.errorMsg = '所属单位不能为空，请修改后提交。';
	                    $scope.apply();
	                	return false;
	                }
	            }
	            if(!Validate.validEmpty($scope.userForm.userstatus)){
	                $scope.errorMsg = '用户状态不能为空，请修改后提交。';
	                $scope.apply();
	            	return false;
	            }
	            if(Validate.validEmpty($scope.userForm.ip) && !Validate.validIp($scope.userForm.ip)){
	                $scope.errorMsg = '客户端IP格式不对，请修改后提交。';
	                $scope.apply();
	            	return false;
	            }
	            if( ( !Validate.validEmpty($scope.userForm.beginTime) && Validate.validEmpty($scope.userForm.endTime) ) || ( Validate.validEmpty( $scope.userForm.beginTime) && !Validate.validEmpty($scope.userForm.endTime) ) ){
	            	$scope.errorMsg = '请先选择开始时间和结束时间,或者都不选再提交。';
	                $scope.apply();
	            	return false;
	            }
	            if(Validate.validEmpty($scope.userForm.beginTime) && !Validate.validClock($scope.userForm.beginTime)){
	            	$scope.errorMsg = '开始时间格式不对，请修改后提交。';
	                $scope.apply();
	            	return false;
	            }
	            if(Validate.validEmpty($scope.userForm.endTime) && !Validate.validClock($scope.userForm.endTime)){
	            	$scope.errorMsg = '结束时间格式不对，请修改后提交。';
	                $scope.apply();
	            	return false;
	            }
	            if(Validate.validEmpty($scope.userForm.endTime) && Validate.validEmpty($scope.userForm.beginTime) && $scope.userForm.endTime <= $scope.userForm.beginTime){
	            	$scope.errorMsg = '结束时间应该小于开始时间，请修改后提交。';
	                $scope.apply();
	            	return false;
	            }


            if(!Validate.validEmpty($scope.userForm.telnum)){
                $scope.errorMsg = '联系方式不能为空，请修改后提交。';
                $scope.apply();
            	return false;
            }
            if(!Validate.validTel($scope.userForm.telnum)){
                $scope.errorMsg = '联系方式格式不对，请修改后提交。';
                $scope.apply();
            	return false;
            }
            if(!Validate.validEmpty($scope.userForm.emails)){
                $scope.errorMsg = '电子邮箱不能为空，请修改后提交。';
                $scope.apply();
            	return false;
            }
            if(!Validate.validEmail($scope.userForm.emails)){
                $scope.errorMsg = '电子邮箱格式不对，请修改后提交。';
                $scope.apply();
            	return false;
            }
            if(!Validate.validEmpty($scope.userForm.issend)){
                $scope.errorMsg = '邮件通知不能为空，请修改后提交。';
                $scope.apply();
            	return false;
            }
            $scope.successMsg = '';
            $scope.apply();

  			postData = {
				'roleId': $scope.userForm.roleselect,
				'emailAddress': $scope.userForm.emails,
				'isSend': $scope.userForm.issend,
				'accessIP':$scope.userForm.ip,
				'accessIpFlag':$scope.userForm.isIpLimited,
				'timeFlag':$scope.userForm.isTimeLimited,
				'beginTime':(!!$scope.userForm.beginTime) ? $scope.userForm.beginTime : null,
				'endTime':(!!$scope.userForm.endTime) ? $scope.userForm.endTime : null,
				'businessGroupId':$scope.userForm.groupselect || 0,
				'phone': $scope.userForm.telnum,
				'status': $scope.userForm.userstatus,
				'describe': $scope.userForm.roledesc
  			};


  			//添加用户表单数据
  			if(type.indexOf('add')>-1){
  				postData.userName = $scope.userForm.username;
  				postData.hash =  $scope.userForm.pwd;
  				postData.status = 0;
  			}
  			//修改用户表单数据
  			if(type.indexOf('update')>-1){
  				postData.selectRoleId = (!!$scope.userForm.roleapply)?$scope.userForm.roleapply:0;
  			}
            //请求参数配置
  			config = {
	  	  				'method':'post',
	  	  				'data': postData,
	  	  				'responseType':'json',
	  	  				'url':(type.indexOf('add')>-1) ? apiAddUserList : apiAddUserList + '/' + id + '?cmd=update'
	  	  			 };
  			it.addClass('btn-custom-disabled').attr('disabled','disabled');

  			//请求数据
  			AjaxServer.ajaxInfo( config , function( data ){
  				it.removeClass('btn-custom-disabled').removeAttr('disabled');
  				if(!!data && !!data.error){
                	$scope.successMsg = '';
                	$scope.errorMsg = data.error;
                	$scope.apply();
                }
  				if(!!data && typeof(data.result)==='string'){

	                if($.trim(type)==='add'){
	                    if(data.result.indexOf('create user success,wait audit')>-1){
	      					$scope.successMsg = '用户添加成功，待管理员审核';
	                        $scope.errorMsg = '';
	                        $scope.apply();
	                        $timeout(function(){
	                        	$scope.formatModals();
	                        	$scope.userShowTag = true;
		                        $scope.getUserInfoListByConditions(type);
	                        },1000);
	      				}
	                    if(data.result.indexOf('account is exist')>-1){
	                        $scope.errorMsg = '用户名已存在';
	                        $scope.successMsg = '';
	                        $scope.apply();
	                    }
	                    if(data.result.indexOf('add fail')>-1){
	                        $scope.successMsg = '';
	                        $scope.errorMsg = '用户添加失败';
	                        $scope.apply();
	                    }
	                }

	                if($.trim(type)==='update'){
	                    if(data.result.indexOf('update success')>-1){
	      					$scope.successMsg = '';
	      					$scope.errorMsg = '';
	      					$scope.apply();
	      					$scope.formatModals();
	      					$scope.userShowTag = true;
	                        $scope.getUserInfoListByConditions(type);
	                        $scope.clearChecked();
	      				}
	                    if(data.result.indexOf('update fail')>-1){
	                        $scope.successMsg = '';
	                        $scope.errorMsg = '用户修改失败';
	                        $scope.apply();
	                    }
	                }
  				}
			},
			function( status ){
                var errorMessage = status ? '因为系统内部错误请求失败' : '因为网络原因请求失败';
                it.removeClass('btn-custom-disabled').removeAttr('disabled');
                $scope.errorMsg = errorMessage;
                $scope.successMsg = '';
                $scope.apply();
			} );
  		};
  		/*
  		 * 向输入框输入内容清除提示内容
  		 */
  		$scope.clearErrMessage = function(){
  			$scope.successMsg = '';
  			$scope.errorMsg = '';
  		}
  	   /*
		* 删除用户
		*/
  		$scope.delUser = function(){
  			config = {
  	  				'method':'post',
  	  				'data':$.extend([],selected),
  	  				'responseType':'json',
  	  				'url':apiDelUserList
  	  			 };
  			AjaxServer.ajaxInfo( config , function( data ){
  				if(!!data && typeof(data.result)==='string'){
	  				if(data.result.indexOf('delete success')>-1){
	      				$scope.successMsg = '';
	                    $scope.errorMsg = '';
	  				}
	  				else{
	                    $scope.successMsg = '';
	                    $scope.errorMsg = data.result;
	                    return false;
	                }
	  				$scope.formatModals();
	  				$scope.getUserList();
	                $scope.apply();
  				}
			},
			function( status ){
                var errorMessage = status ? '因为系统内部错误请求失败' : '因为网络原因请求失败';
                $scope.errorMsg = errorMessage;
                $scope.successMsg = '';
                $scope.apply();
			});

  		};

  		/*
  		 * 响应模态框确定按钮
  		 */
  		$scope.confirmOpr = function(){
  			if($.trim($scope.oprType) === 'closeModal'){
  				$scope.formatModals();
  			}

            if(!!selected && selected.length!==0){
                if($.trim($scope.oprType) === 'delUser'){
      				$scope.delUser();
      			}
                if($.trim($scope.actionType) === 'update' && selected.length > 1){
                    $scope.formatModals();
      			}
      			//清空选中的多选框id数组
      			$scope.clearChecked();
            }
            else{
                $scope.formatModals();
            }

			$scope.apply();
  		};

  		/*
  		 * 删除后获取用户列表
  		 */
  		$scope.getUserList = function(){
  			$scope.getRoleList();
  	        $scope.getUserInfoListByConditions();
  		}

  		 /*
  		 *  响应多选框的状态变化，保存选中的id
  		 */
  		$scope.updateSelection = function($event, itemId, itemArr){
  	        var checkbox = $event.target;
  	        var action = (checkbox.checked?'add':'remove');
  	        var id = parseInt(itemId);
  	        if($.trim(action) === 'add' && selected.indexOf(id) === -1){
  	        	if(id===0){    // id为0表示全选
  	        		selected = [];
  	        		var ids;
  	        		if(!!itemArr && itemArr.length!==0){
  	        			for(var i = 0; i < itemArr.length; i++){
  		        			ids = itemArr[i].id || itemArr[i].nameId || itemArr[i].jobId;
  		        			if( itemArr[i].status!='-1' && itemArr[i].auditFlag == 1  &&  itemArr[i].roleId>=0  && !!selected && selected.indexOf(parseInt(ids))===-1){
  		        				selected.push(parseInt(ids));
  		        			}
  		        		}
  	        		}
  	        	}
  	            selected.push(id);
  	            //console.log(selected);
  	            //判断是否一个个全选了
  	            if(!!itemArr && itemArr.length!==0){
  	            	if(!!selected && selected.length >= itemArr.length){
  	                	if(selected.indexOf(0)===-1){
  	                		selected.push(0);
  	                	}
  	                }
  	            }
  	            //console.log(selected);
  	        }
  	        if($.trim(action) === 'remove' && !!selected && selected.indexOf(id) !== -1){
  	        	$scope.spliceZero();
  	            var idx = selected.indexOf(id);
  	            if(id===0){  // id为0表示全不选
  	            	selected.splice(0,selected.length);
  	            }
  		        selected.splice(idx,1);
  	            //console.log(selected);
  	        }
  	        $scope.selected = selected;
  	    };

  		/*
  		 *  判断多选框是否选中
  		 */
	    $scope.isSelected = function( id ){
	        return selected.indexOf(id) >= 0;
	    };

	    /*
	     * 去除复选框中id为0
	     */
	    $scope.spliceZero = function(){
	    	var index= 0;
	    	if(!!selected && selected.length!==0){
	    		for(var i=0;i<selected.length;i++){
					index = selected.indexOf(0);
					if(index>-1){
						selected.splice(index,1);
					}
				}
	    	}
	    };

	    /*
	     * 清空复选框的id数组
	     */
	    $scope.clearChecked = function(){
	    	selected.splice(0,selected.length);
	    };

  		/*
  		 * 自定义滚动条
  		 */
  		$scope.customScroll = function(){
  			$('.scroll-custom').mCustomScrollbar({
  			    axis:'y',
  			    scrollbarPosition:'inside',
  			    autoHideScrollbar: true,
  			    theme:'my-theme',
  			    scrollButtons:{
			    	scrollSpeed: 100
		    	}
  			});
  		};

	    /*
	     *  初始化模态框
	     */
	    $scope.formatModals = function(){
	    	modalArr = [ $userAddModal,$userEditModal,$userOprConfirm,$userPwdModal ];
	    	$scope.hideModal(modalArr);
            $scope.businessGroupOptions = [];
            $scope.handleBusinessGroupId = '';
            $scope.handleBusinessGroupShow = false;
            $scope.userPwdForm = {'newPwd':'','repeatPwd':''};
            $scope.customScroll();
  			$scope.errorMsg = '';
  			$scope.successMsg = '';
  			$scope.apply();
  			$scope.formatTime();
  		};

  		/*
	     *  响应弹出模态框按钮
	     */
  		$scope.clickShowModal = function( modal ){
  			$scope.formatModals();
  			modal.modal('show');
  		};

  		/*
	     *  响应关闭模态框按钮
	     */
  		$scope.hideModal = function( modalArr ){
  			if(!!modalArr && modalArr.length !== 0){
  				for(var i = 0; i < modalArr.length; i++){
  					modalArr[i].modal('hide');
  				}
  			}
  		};

  		$scope.apply = function() {
  			if(!$scope.$$phase) {
  			    $scope.$apply();
  			}
  		};
});

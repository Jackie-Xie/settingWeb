'use strict';

angular.module('myappApp')
  	.controller('AuditCtrl', function ($scope, AjaxServer, Validate, $location) {
  		var config={},
  			defaultPager = {
            	total: 0, // 
	        	curPage: 1, //当前页码
	            pagesNum: 1, //
	            pageIndex: 10, // 每页存放条数
            },
			apiGetAuditInfoList = '/useroperatelog',	
			apiGetRoleList = '/role',                                     // 获取角色列表
			apiGetBusinessGroup = '/businessgroup',                       // 所属单位
			$progressOprConfirm = undefined, 	
  		
			auditTypeList=[
								{
								    "id": 1,
								    "cn_name": "认证操作"
								},{
								    "id": 2,
								    "cn_name": "系统操作"
								},{
								    "id": 3,
								    "cn_name": "业务操作"
								}
						    ],
			sortTypeList=[
					{
					    "id": 'group',
					    "cn_name": "按所属单位排序"
					},{
					    "id": 'user',
					    "cn_name": "按操作用户排序"
					},{
					    "id": 'role',
					    "cn_name": "按所属角色排序"
					},{
					    "id": 'eventType',
					    "cn_name": "按操作类型排序"
					},{
					    "id": 'createTime',
					    "cn_name": "按操作时间排序"
					},{
					    "id": 'host',
					    "cn_name": "按终端地址排序"
					}
			    ];
  		
  		$scope.searchPara = {'roleId':'','groupId':'','auditIypeId':'','sortTypeId':''};
  		
  		$scope.init = function () {
            $scope.pathStr = $location.path();
  			$scope.getListSuccess = false;
  			$scope.loading = true;
  			$scope.errorMsg = '';
  			$scope.sucessMsg = '';
  			$progressOprConfirm = $('#J_auditIndexConfirm');
  			$scope.linkList = [];
  			$scope.roleList = [];
  			$scope.businessGroupOptions = [];
  			$scope.subNavClass = ['','','','','','','active','',''];
  			$scope.pager =  $.extend( {}, defaultPager );	
  			$scope.auditTypeList =  $.extend([], auditTypeList ); //时间类型
  			$scope.sortTypeList =  $.extend([], sortTypeList );//排序
  			
  			$scope.getRoleList();
  			$scope.getBusinessGroupOptions();
			$scope.getAuditInfoList();
			$scope.bindEventAutdit();
  		};
  		
  		$scope.bindEventAutdit = function() {  	    	
  			$(".j-body").off( "click", "**");
 			
  			
  			//查询用户信息
	    	$(".j-body").on('click','.j-searchPara', function(ev){
	    		$scope.getAuditInfoList();
	    	});
	    	
	    	//查询用户信息
	    	$(".j-body").on('click','.j-getBackup', function(ev){
	    		$scope.getBackup();
	    	}); 
	    	
 			//分页事件绑定
 			$(".j-body").on('click','.j-navPager .item', function(ev){
 				var it = $(ev.currentTarget);
 				$scope.gotoPage(parseInt(it.text()));
 			}).on('click','.j-navPager .prev', function(ev){
 				if($scope.pager.curPage <= 1){
 					return false;
 				}
 				$scope.gotoPage($scope.pager.curPage - 1);
 			}).on('click','.j-navPager .next', function(ev){
 				if($scope.pager.curPage >= $scope.pager.pagesNum){
 					return false;
 				}
 				$scope.gotoPage($scope.pager.curPage + 1);
 			});
   		};
   		
   		
   		// 得到操作审计数据
		$scope.getAuditInfoList = function(){					
			$scope.loading = true;
			var ajaxData = {
					businessGroupId:$scope.searchPara.groupId,
					eventTypeId:$scope.searchPara.auditIypeId,
					roleId:$scope.searchPara.roleId,
					orderParam:$scope.searchPara.sortTypeId
	  	  		},
  			config = {
  	  				method:'post',
  	  				data:ajaxData,
  	  				url:apiGetAuditInfoList +'?pageSize=' + $scope.pager.pageIndex + '&curPage=' + $scope.pager.curPage
  	  			};
  			AjaxServer.ajaxInfo(config, function( data ){
                var d = typeof(data) == 'string' ? JSON.parse(data) : data;
                $scope.getListSuccess = true;
                $scope.loading = false;
                $scope.pager.curPage = d.pageNum;
				$scope.pager.pagesNum = d.pages;
				$scope.pager.total = d.total;
                $scope.auditList = d.result;
                $scope.apply();
            },
  			function(status){
        	    $scope.getListSuccess = false;
                $scope.loading = false;
				$scope.errorMsg = '因网络未知原因，操作失败，请刷新页面重试。';
				$scope.apply();
  			});			
		};
		
		/*
   	    *  响应下一步按钮
   	    */
 		$scope.getBackup = function( ){ 
 			$scope.formatModals();
 			$scope.czType = "getBackup";
 			$scope.cancelButton = "关 闭";
			$scope.confirmInfo = '确定执行备份操作？';
			$scope.apply();
			$scope.showOprConfirm($progressOprConfirm);
 		};
		
		/*
         * 备份
         */
         $scope.backupExec = function(){
   			config = {
   	  				method:'post',
   	  				data:'',
   	  				url:apiGetAuditInfoList +'?cmd=backup'
   	  			};
   			AjaxServer.ajaxInfo(config, function( data ){
                var d = typeof(data) == 'string' ? JSON.parse(data) : data;
                if(d >= 0){
                	$scope.successMsg = '执行备份操作成功。';
                }else{
                	$scope.errorMsg = '因网络未知原因，操作失败，请重试。';
                }
                $scope.czType = "ok";
                $scope.cancelButton = "确 定";
                $scope.apply();
             },
   			function(status){
         	    $scope.getListSuccess = false;
                $scope.loading = false;
 				$scope.errorMsg = '因网络未知原因，操作失败，请重试。';
 				$scope.apply();
   			});	
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
				//$scope.roleList.push({'id':'-1', 'name':'系统管理员', 'describe':'系统管理员'});
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
		
		/*
         * 获取所属单位选项
         */
        $scope.getBusinessGroupOptions = function( roleId , type , businessGroupId){
        	var id = parseInt(roleId);
        	//角色为数据中心的，不调所属单位选项
        	$scope.businessGroupOptions = [];
        	
        	if(!id || id===1 || id===2 || id===-1){
        		return false;
        	}
            config = {
  				'method':'get',
  				'data':'',
  				'url':apiGetBusinessGroup
  			};
  			AjaxServer.ajaxInfo( config , function( data ){
  				if(!!data){
  					 var BusinessGroupObj = null;
  					 $.each(data,function(i){
  						BusinessGroupObj = {
  							'id':data[i].id,
  							'bgname':data[i].cnName || data[i].name
  						}
  	                	$scope.businessGroupOptions.push(BusinessGroupObj);
  	                });
  					 
  					if(typeof(type)=='string' && type.indexOf('update')>-1){
  						$scope.userForm.groupselect = businessGroupId;
  						$scope.apply();
  					}
  				}   
            },
            function( status ){
                console.log(status);
            });
        };
		
		/*
	    *  跳转页面
	    */
  		$scope.gotoPage = function( targetPage ){
  			if(!targetPage || targetPage > $scope.pager.pagesNum || targetPage < 1){
  				return false;
  			}

  			$scope.pager.curPage = parseInt(targetPage);
  			//判断当前所在页面
  			$scope.getAuditInfoList();
  		};
  		
  		 /*
 	    *  初始化模态框
 	    */
 	    $scope.formatModals = function(){
   			$scope.confirmInfo = '';
   			$scope.errorMsg = '';
   			$scope.successMsg = '';
             $scope.apply();
   		};
  		
  		$scope.showOprConfirm = function( oprConfirm ){
  			oprConfirm.modal('show');
  		};

  		$scope.hideOprConfirm = function( oprConfirm ){
  			oprConfirm.modal('hide');
  			$('.modal-backdrop.in').fadeOut(100);
  		};
  		
  		$scope.apply = function() {
  			if(!$scope.$$phase) {
  			    $scope.$apply();
  			}
  		};
});

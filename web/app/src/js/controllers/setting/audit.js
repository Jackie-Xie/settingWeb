'use strict';

angular.module('myappApp')
  	.controller('AuditCtrl', ['$scope', '$http','AjaxServer', 'PageService','Validate', '$location',function ($scope, $http,AjaxServer,PageService, Validate, $location) {
  		var defaultPager = {                    						  // 默认分页参数
                total: 0, 								  				  // 总条数
                curPage: 1, 						      				  // 当前页码
                pagesNum: 1, 						  	  				  // 总页数
                pageSize: 5 							  				  // 每页存放条数
            },
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
  			$scope.ListShowFlag = 'loading';
  			$scope.errorMsg = '';
  			$scope.sucessMsg = '';
  			$progressOprConfirm = $('#J_auditIndexConfirm');
  			$scope.linkList = [];
  			$scope.roleList = [];
  			$scope.businessGroupOptions = [];
  			$scope.pager =  $.extend( {}, defaultPager );
  			$scope.auditTypeList =  $.extend([], auditTypeList ); //时间类型
  			$scope.sortTypeList =  $.extend([], sortTypeList );//排序

  			$scope.getRoleList();
  			$scope.getBusinessGroupOptions();
			$scope.getList();
			$scope.bindEvent();
  		};

  		$scope.bindEvent = function() {
  			$(".j-body").off( "click", "**");


  			//查询用户信息
	    	$(".j-body").on('click','.j-searchPara', function(ev){
	    		$scope.getList();
	    	});

	    	//查询用户信息
	    	$(".j-body").on('click','.j-getBackup', function(ev){
	    		$scope.getBackup();
	    	});

 			//分页事件绑定
            $(".j-body").off( "click", ".j-navPager .item").off( "click", ".j-navPager .prev").off( "click", ".j-navPager .next");
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
		$scope.getList = function(){
            var conditions= {};
            $http.get('/data/auditorMgr/getAuditList.json').then(function(response){
                var data = {};
                if(response.status === 200){
                    if(response.data && response.data.length > 0){
                        data = PageService.page($scope.pager.curPage,$scope.pager.pageSize,response.data,conditions);
                    }

                    if(!data || !data.result || data.result.length===0){
                        $scope.ListShowFlag = '无查询结果';
                        $scope.auditList = [];
                    }
                    else{
                        $scope.ListShowFlag = '';
                        $scope.auditList = data.result;
                        $scope.pager =  $.extend( {}, defaultPager,{
                            total: data.total,
                            curPage: data.curPage,
                            pagesNum: data.pagesNum,
                            pageSize: data.pageSize
                        });
                    }
                    $scope.apply();
                }
            },function(data){
                $scope.ListShowFlag = '因为网络原因请求失败';
                $scope.auditList = [];
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
   			var config = {
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
         * 获取所属单位选项
         */
        $scope.getBusinessGroupOptions = function(){
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
                    }
                }
            },function (){
                console.log('因为网络原因请求失败');
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
  			$scope.getList();
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
  		};

  		$scope.apply = function() {
  			if(!$scope.$$phase) {
  			    $scope.$apply();
  			}
  		};
}]);

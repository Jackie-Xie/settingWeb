'use strict';

angular.module('myappApp')
  	.controller('AuditCtrl', ['$scope', '$http','$location','$timeout', 'PageService',function ($scope, $http,$location,$timeout,PageService) {
  		var defaultPager = {                    						  // 默认分页参数
                total: 0, 								  				  // 总条数
                curPage: 1, 						      				  // 当前页码
                pagesNum: 1, 						  	  				  // 总页数
                pageSize: 5 							  				  // 每页存放条数
            },
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



  		$scope.init = function () {
            $scope.errorMsg = '';
  			$scope.sucessMsg = '';
            $scope.confirmInfo = '';
            $scope.auditList = [];
  			$scope.roleList = [];
  			$scope.businessGroupOptions = [];
            $scope.pathStr = $location.path();
  			$scope.ListShowFlag = 'loading';
  			$scope.pager =  $.extend( {}, defaultPager );
            $scope.searchPara = {};

  			$scope.getRoleList();
  			$scope.getBusinessGroupOptions();
            $scope.getAuditTypeOptions();
            $scope.getSortTypeOptions();
			$scope.getList();
			$scope.bindEvent();
  		};

        /*
         * 查询
         */
        $scope.query = function( flag ){
            $scope.ListShowFlag = 'loading';
            if( flag ){
                $scope.pager =  $.extend( {}, defaultPager);
            }
            $scope.apply();
            $scope.getList();
        };

  		$scope.bindEvent = function() {
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
            var conditions= {
                eventTypeId: $scope.searchPara.auditTypeId || undefined,
                roleId: $scope.searchPara.roleId || undefined,
                businessGroupId: $scope.searchPara.groupId || undefined,
                orderParam: $scope.searchPara.sortTypeId || undefined
            };
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
   	    *  点击备份
   	    */
 		$scope.getBackup = function(){
   			$scope.errorMsg = '';
   			$scope.successMsg = '';
 			$scope.czType = "getBackup";
 			$scope.cancelButton = "取 消";
			$scope.confirmInfo = '确定执行备份操作？';
			$scope.apply();
			$('#J_auditIndexConfirm').modal('show');
 		};

		/*
         * 备份操作
         */
        $scope.backupExec = function(ev){
            var it = $(ev.target);
            if(it.hasClass('disabled')){
                return false;
            }

            it.addClass('disabled').text('处理中...');
            // 实际要发送请求,这里只是假设
            var flag = Math.floor(Math.random()*2);
            $timeout(function(){
                it.removeClass('disabled');
                if(flag){
                    $scope.successMsg = '执行备份操作成功';
                    $scope.czType = "ok";
                }
                else{
                    $scope.successMsg = '执行备份操作失败';
                    $scope.czType = "fail";
                }
                $scope.cancelButton = "确 定";
                $scope.apply();
            },500);
        };

        /*
 		 * 获取事件类型选项
 		 */
        $scope.getAuditTypeOptions = function(){
            $scope.auditTypeList =  $.extend([], auditTypeList );
        };

        /*
 		 * 获取排序规则选项
 		 */
        $scope.getSortTypeOptions = function(){
            $scope.sortTypeList =  $.extend([], sortTypeList );
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

  		$scope.apply = function() {
  			if(!$scope.$$phase) {
  			    $scope.$apply();
  			}
  		};
}]);

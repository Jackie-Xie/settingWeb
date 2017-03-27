'use strict';

angular.module('myappApp')
  	.controller('AuditAnalyCtrl', ['$scope','$http','$window', '$location','$timeout', 'PageService','Validate',function ($scope,$http,$window, $location,$timeout,PageService, Validate) {
  		var defaultPager = {
            	total: 0,
	        	curPage: 1,
	            pagesNum: 1,
	            pageSize: 5
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
		    ];

  		$scope.init = function () {
            $scope.pathStr = $location.path();
  			$scope.ListShowFlag = 'loading';
  			$scope.errorMsg = '';
  			$scope.sucessMsg = '';
            $scope.confirmInfo = '';
            $scope.searchPara = {};
  			$scope.analyList = [];
  			$scope.userList = [];
  			$scope.businessGroupOptions = [];
  			$scope.pager =  angular.extend( {}, defaultPager );
  			$scope.auditTypeList =  angular.extend([], auditTypeList ); // 事件类型

  			$scope.getUserList();
			$scope.getList();
			$scope.bindEvent();

  		};

        /*
         * 查询
         */
        $scope.query = function( flag ){
            $scope.ListShowFlag = 'loading';
            if( flag ){
                $scope.pager =  angular.extend( {}, defaultPager);
            }
            $scope.apply();
            $scope.getList();
        };

        /*
         * 事件绑定
         */
  		$scope.bindEvent = function() {

	    	//关闭下载
            angular.element(".j-body").on('click','.j-export', function(ev){
                angular.element('#J_auditAnalyConfirm').modal('hide');
	    	});

 			//分页事件绑定
            angular.element(".j-body").off( "click", ".j-navPager .item").off( "click", ".j-navPager .prev").off( "click", ".j-navPager .next");
            angular.element(".j-body").on('click','.j-navPager .item', function(ev){
 				var it = angular.element(ev.currentTarget);
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

        /*
         * 日期格式化
         */
  		$scope.formatTime = function(type){
	  		var dateValue=new Date();
	  		dateValue.setDate(dateValue.getDate());

            if(type === 'start'){
                // 开始时间
                angular.element('#J_auditBeginTime').datetimepicker({
                    format:'yyyy-mm-dd',
                    language:  'zh-CN',
                    autoclose: true,
                    todayHighlight: false,
                    startView: "month",
                    minView: "month",
                    forceParse: 0,
                    endDate: dateValue,
                }).on("changeDate",function(ev){
                    var transferdate = transferDate(angular.element('#J_auditBeginTime').val());//转时间日期
                    angular.element("#J_auditEndTime").datetimepicker('remove');
                    angular.element("#J_auditEndTime").datetimepicker({
                        format:'yyyy-mm-dd',
                        language:  'zh-CN',
                        autoclose: true,
                        startView: "month",
                        minView: "month",
                        startDate: transferdate,
                        endDate: dateValue,
                    }).on("changeDate",function(ev){
                        var enddate=angular.element("#J_auditEndTime").val();
                        setEndTime(enddate);
                    });
                });
            }
            else if(type === 'end'){
                // 结束时间
                angular.element("#J_auditEndTime").datetimepicker({
                    format:'yyyy-mm-dd',
                    language:  'zh-CN',
                    startView: "month",
                    minView: "month",
                    maxDate: dateValue,
                    endDate: dateValue,
                    autoclose: true
                }).on("changeDate",function(ev){
                    var enddate=angular.element("#J_auditEndTime").val();
                    setEndTime(enddate);
                });
            }

	  	    function setEndTime(enddate){
                angular.element('#J_auditBeginTime').datetimepicker('remove');
                angular.element('#J_auditBeginTime').datetimepicker({
	  	                format:'yyyy-mm-dd',
	  	                language:  'zh-CN',
	  	                autoclose: true,
	  	                todayHighlight: false,
	  	                startView: "month",
	  	                minView: "month",
	  	                forceParse: 0,
	  	                endDate: transferDate(enddate)
	  	        });
	  	    }

	  	    // 将时间字符串转为date
	  	    function transferDate(data){
	  	        var start_time = data;
	  	        var newTime = start_time.replace(/-/g,"-");
	  	        var transferdate = new Date(newTime);
	  	        return transferdate;
	  	    }

  		};

	    /*
		 * 获取用户选项
		 */
  		$scope.getUserList = function(){
            $http.get('/data/userSetting/getUserList.json').then(function(response){
                if(response.status === 200){
                    if(response.data && response.data.length > 0){
                        $scope.userList = response.data;
                    }
                    $scope.apply();
                }
            },function(){
                $scope.userList = [];
                $scope.apply();
            });
  		};

   		/*
   		 * 得到操作审计数据
   		 */
		$scope.getList = function(){
			//输入验证
   			if($scope.searchPara && !$scope.validateForm($scope.searchPara)){
   				return false;
   			}

            var conditions= {
                startTime:$scope.searchPara.beginTime || undefined,
                endTime:$scope.searchPara.endTime || undefined,
                userId:$scope.searchPara.userId || undefined,
                eventTypeId:$scope.searchPara.auditTypeId || undefined
            };
            $http.get('/data/auditorMgr/getAuditAnalyList.json').then(function(response){
                var data = {};
                if(response.status === 200){
                    if(response.data && response.data.length > 0){
                        data = PageService.page($scope.pager.curPage,$scope.pager.pageSize,response.data,conditions);
                    }

                    if(!data || !data.result || data.result.length===0){
                        $scope.ListShowFlag = '无查询结果';
                        $scope.analyList = [];
                    }
                    else{
                        $scope.ListShowFlag = '';
                        $scope.analyList = data.result;
                        $scope.pager =  angular.extend( {}, defaultPager,{
                            total: data.total,
                            curPage: data.curPage,
                            pagesNum: data.pagesNum,
                            pageSize: data.pageSize
                        });
                    }
                    $scope.apply();
                }
            },function(data){
                $scope.ListShowFlag = data || '因为网络原因请求失败';
                $scope.analyList = [];
                $scope.apply();
            });

		};

		/*
         * 点击导出
         */
         $scope.clickExport = function(){
             $scope.modalTitle = '导出操作';
             $scope.cancelButton = '确定';
             $scope.successMsg = '';
             $scope.errorMsg = '';
             $scope.apply();
             angular.element('#J_auditAnalyConfirm').modal('show');
         };

        /*
         *  响应下一步按钮
         */
        $scope.getExportExcel = function(ev){
            var it = angular.element(ev.target);
            if(it.text() === '关闭'){
                angular.element('#J_auditAnalyConfirm').modal('hide');
                return false;
            }
            if(it.hasClass('disabled')){
                return false;
            }
            it.addClass('disabled').text('导出中...');
            // 输入验证
            if($scope.searchPara && !$scope.validateForm($scope.searchPara)){
                return false;
            }
            var ajaxData = {
                startTime:$scope.searchPara.beginTime,
                endTime:$scope.searchPara.endTime,
                userId:$scope.searchPara.userId,
                eventTypeId:$scope.searchPara.auditTypeId
            };
            // 实际要发送请求,这里只是假设
            var flag = Math.floor(Math.random()*2);
            $timeout(function(){
                console.log(ajaxData);
                if(flag){
                    var url = window.location.protocol + '//' + window.location.hostname + ':' + window.location.port
                        + "/analysis/export?cmd=statistic";
                    $window.open(url);
                    $scope.successMsg = '导出成功';
                    $scope.errorMsg = '';
                }
                else{
                    $scope.successMsg = '';
                    $scope.errorMsg = '导出失败';
                }
                $scope.cancelButton = '关闭';
                $scope.apply();
                it.removeClass('disabled').text('关闭');

            },500);
        };


         /*
   		 * 验证表单数据
   		 */
   		$scope.validateForm = function ( formObj ) {
   			if(Validate.validEmpty(formObj.beginTime) && !Validate.validDate(formObj.beginTime)){
            	$scope.sysError = '开始时间格式不对，请修改后查询。';
                $scope.apply();
            	return false;
            }
            if(Validate.validEmpty(formObj.endTime) && !Validate.validDate(formObj.endTime)){
            	$scope.sysError = '结束时间格式不对，请修改后查询。';
                $scope.apply();
            	return false;
            }
            if(Validate.validEmpty(formObj.endTime) && Validate.validEmpty(formObj.beginTime) && formObj.endTime < formObj.beginTime){
            	$scope.sysError = '查询结束时间应大于开始时间，请修改后查询。';
                $scope.apply();
            	return false;
            }
   			return true;
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

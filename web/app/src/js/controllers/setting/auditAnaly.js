'use strict';

angular.module('myappApp')
  	.controller('AuditAnalyCtrl', ['$scope','$http', '$location','$timeout', 'PageService','Validate',function ($scope,$http, $location,$timeout,PageService, Validate) {
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
  			$scope.errorMsgBeginTime = '';
  			$scope.errorMsgEndTime = '';
            $scope.searchPara = {};
  			$scope.analyList = [];
  			$scope.userList = [];
  			$scope.businessGroupOptions = [];
  			$scope.pager =  $.extend( {}, defaultPager );
  			$scope.auditTypeList =  $.extend([], auditTypeList ); // 事件类型

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
                $scope.pager =  $.extend( {}, defaultPager);
            }
            $scope.apply();
            $scope.getList();
        };

        /*
         * 事件绑定
         */
  		$scope.bindEvent = function() {

	    	//关闭下载
	    	$(".j-body").on('click','.j-export', function(ev){
                $('#J_auditAnalyConfirm').modal('hide');
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

            $timeout($scope.formatTime,500);
   		};


  		$scope.formatTime = function(){
	  		var dateValue=new Date();
	  		dateValue.setDate(dateValue.getDate()-1);
	  		//开始时间
	  		$('#J_beginTime').datetimepicker({
	  	    	format:'yyyy-mm-dd',
	  	    	language:  'zh-CN',
	  			autoclose: 1,
	  			todayHighlight: false,
	  			startView: "month",
				minView: "month",
	  			forceParse: 0,
	  			endDate:dateValue,
	  	    }).on("changeDate",function(ev){
	  	    	var transferdate=transferDate($("#J_beginTime").val());//转时间日期
	  	        $('#J_endTime').datetimepicker('remove');
	  	    	$('#J_endTime').datetimepicker({
	  	    		format:'yyyy-mm-dd',
	  	    		language:  'zh-CN',
	  	    		autoclose: 1,
	  	    		startView: "month",
	  				minView: "month",
	  	    		startDate:transferdate,
	  	    		endDate:dateValue,
	  	    	}).on("changeDate",function(ev){
	  	            var enddate=$("#J_endTime").val();
	  	            setEndTime(enddate);
	  	        });
	  	    });
	  		//结束时间
	  	    $('#J_endTime').datetimepicker({
	  	        format:'yyyy-mm-dd',
	  	        language:  'zh-CN',
	  	        startView: "month",
				minView: "month",
				maxDate:dateValue,
				endDate:dateValue,
	  	        autoclose: 1
	  	    }).on("changeDate",function(ev){
	  	        var enddate=$("#J_endTime").val();
	  	        setEndTime(enddate);
	  	    });
	  	    function setEndTime(enddate){
	  	        $('#J_beginTime').datetimepicker('remove');
	  	            $('#J_beginTime').datetimepicker({
	  	                format:'yyyy-mm-dd',
	  	                language:  'zh-CN',
	  	                autoclose: 1,
	  	                todayHighlight: false,
	  	                startView: "month",
	  	                minView: "month",
	  	                forceParse: 0,
	  	                endDate:transferDate(enddate)
	  	        });
	  	    }
	  	    //将时间字符串转为date
	  	    function transferDate(data){
	  	        var start_time=data;
	  	        var newTime= start_time.replace(/-/g,"-");
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

   		// 得到操作审计数据
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
                $scope.ListShowFlag = data || '因为网络原因请求失败';
                $scope.analyList = [];
                $scope.apply();
            });

		};

		/*
         * 备份
         */
         $scope.clickExport = function(ev){
             var it = angular.element(ev.target);
             if(it.hasClass('disabled')){
                 return false;
             }
             it.addClass('disabled');
        	//输入验证
   			if(!!$scope.searchPara && !$scope.validateForm($scope.searchPara)){
   				return false;
   			}
 			var userId = $scope.searchPara.userId;
 			var startTime = $scope.searchPara.beginTime;
 			var endTime = $scope.searchPara.endTime;
 			var eventTypeId = $scope.searchPara.auditTypeId;
 			if(userId == null){
 				userId = '';
 			}
 			if(eventTypeId == null){
 				eventTypeId = '';
 			}
 			var ajaxData = {
					startTime:startTime,
					endTime:endTime,
					userId:userId,
					eventTypeId:eventTypeId
	  	  		},
   			config = {
   	  				method:'post',
   	  				data:ajaxData,
   	  				url:apiGetExport
   	  			};
   			AjaxServer.ajaxInfo(config, function( data ){
   				var urlTemp = window.location.protocol + '//' + window.location.hostname + ':' + window.location.port;
   	          	var url = urlTemp + apiGetExport + "?cmd=statistic";
   	          	$scope.exportHref = url;
   	            $scope.apply();
                    $('#J_auditAnalyConfirm').modal('show');
//   	          	$scope.getExportExcel('j-checkExport',url);
                it.removeClass('disabled');
             },
   			function(status){
 				$scope.errorMsg = '因网络未知原因，导出失败。';
 				$scope.apply();
   			});

         };

         /*
   		 * 验证表单数据
   		 */
   		$scope.validateForm = function ( formObj ) {
   			$scope.errorMsgBeginTime = '';
  			$scope.errorMsgEndTime = '';
   			if(Validate.validEmpty(formObj.beginTime) && !Validate.validDate(formObj.beginTime)){
            	$scope.errorMsgBeginTime = '开始时间格式不对，请修改后查询。';
                $scope.apply();
            	return false;
            }
            if(Validate.validEmpty(formObj.endTime) && !Validate.validDate(formObj.endTime)){
            	$scope.errorMsgEndTime = '结束时间格式不对，请修改后查询。';
                $scope.apply();
            	return false;
            }
            if(Validate.validEmpty(formObj.endTime) && Validate.validEmpty(formObj.beginTime) && formObj.endTime < formObj.beginTime){
            	$scope.errorMsgEndTime = '查询结束时间应大于开始时间，请修改后查询。';
                $scope.apply();
            	return false;
            }
   			return true;
   		};

      		/*
     	    *  响应下一步按钮
     	    */
	   		$scope.getExportExcel = function(id,url){
	   			var a = document.createElement('a');
                a.setAttribute('href', url);
                a.setAttribute('target', '_blank');
                a.setAttribute('id', id);
                // 防止反复添加
                if(!document.getElementById(id)) {
                    document.body.appendChild(a);
                }
                a.click();
	   		};

        /*
        *  初始化模态框
        */
        $scope.formatModals = function(){
            $scope.confirmInfo = '';
            $scope.errorMsg = '';
            $scope.successMsg = '';
          // $scope.apply();
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

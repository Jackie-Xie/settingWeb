'use strict';

angular.module('myappApp')
  	.controller('AuditAnalyCtrl', function ($scope, AjaxServer, Validate, $location) {
  		var config={},
  			defaultPager = {
            	total: 0, // 
	        	curPage: 1, //当前页码
	            pagesNum: 1, //
	            pageIndex: 10, // 每页存放条数
            },
			apigetAuditAnalyList = '/useroperatelog',	
			apiGetUserList = '/useroperatelog/operuser',                  // 获取用户列表
			apiGetExport = '/useroperatelog/export',                      // 导出
			$oprConfirm = undefined, 			  		
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
		    //步骤数组
	        eventList=[{id:'1',cnName:'用户登录',sum:0},
  			            {id:'2',cnName:'用户退出',sum:0},
  			            {id:'3',cnName:'添加用户',sum:0},
  			            {id:'4',cnName:'删除用户',sum:0},
  			            {id:'5',cnName:'修改用户',sum:0},
  			            {id:'6',cnName:'密码重置',sum:0},
  			            {id:'7',cnName:'修改安全配置',sum:0},
  			            {id:'8',cnName:'越权访问',sum:0},
  			            {id:'9',cnName:'IP地址变动过大',sum:0},
  			            {id:'10',cnName:'连续登录失败',sum:0},
  			            {id:'11',cnName:'服务启停',sum:0},
  			            {id:'12',cnName:'切换',sum:0},
  			            {id:'13',cnName:'闪回',sum:0}
  			           ];
  		
  		$scope.searchPara = {'beginTime':'','endTime':'','userId':'','auditIypeId':''};
  		$scope.analyData = [];
  		
  		$scope.init = function () {
            $scope.pathStr = $location.path();
  			$scope.getListSuccess = false;
  			$scope.loading = true;
  			$scope.errorMsg = '';
  			$scope.sucessMsg = '';
  			$scope.errorMsgBeginTime = '';
  			$scope.errorMsgEndTime = '';
  			$oprConfirm = $('#J_auditAnalyConfirm');
  			$scope.linkList = [];
  			$scope.roleList = [];
  			$scope.businessGroupOptions = [];
  			$scope.subNavClass = ['','','','','','','','','active'];
  			$scope.pager =  $.extend( {}, defaultPager );	
  			$scope.auditTypeList =  $.extend([], auditTypeList ); //事件类型
  		
  			$scope.getUserList();
			$scope.getAuditAnalyList();
			$scope.bindEventAutdit();		
			
  		};
  		
  		$scope.bindEventAutdit = function() {  	    	
  			$(".j-body").off( "click", "**");
  			
  			//查询用户信息
	    	$(".j-body").on('click','.j-searchPara', function(ev){
	    		$scope.getAuditAnalyList();
	    	});
	    	
	    	//查询用户信息
	    	$(".j-body").on('click','.j-getExport', function(ev){
	    		$scope.exportData();
	    	});
	    	
	    	//关闭下载
	    	$(".j-body").on('click','.j-export', function(ev){
	    		$scope.hideOprConfirm();
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
 			
 			$scope.formatTime();
   		};
   		
   		/*
  		 * 自定义滚动条
  		 */
  		$scope.customScroll = function(){
  			$('.scroll-custom').mCustomScrollbar({
  			    axis:'y',  // vertical scrollbar
  			    horizontalScroll:true,//横向滚动条
  			    theme:'my-theme-x',//横向滚动条
  			    scrollButtons:{
			    	scrollSpeed: 30
		    	}  				
  			});
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
	  			'endDate':dateValue,
	  	    }).on("changeDate",function(ev){
	  	    	var transferdate=transferDate($("#J_beginTime").val());//转时间日期
	  	        $('#J_endTime').datetimepicker('remove');
	  	    	$('#J_endTime').datetimepicker({
	  	    		format:'yyyy-mm-dd',
	  	    		language:  'zh-CN',
	  	    		autoclose: 1,
	  	    		startView: "month",
	  				minView: "month",
	  	    		'startDate':transferdate,
	  	    		'endDate':dateValue,
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
				'endDate':dateValue,
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
	  	                'endDate':transferDate(enddate)
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
		 * 获取角色列表
		 */
  		$scope.getUserList = function(){
  			config = {
  				'method':'get',
  				'data':'',
  				'responseType':'json',
  				'url':apiGetUserList
  			};  			
  			AjaxServer.ajaxInfo( config , function(data){
  				if( typeof(data) === 'string'){
					data = JSON.parse(data);
				}
				$scope.userList = $.extend([],data);
				$scope.apply();
			},
			function(status){
                var errorMessage = status ? '因为系统内部错误请求失败' : '因为网络原因请求失败';
                $scope.errorMsg = errorMessage;
                $scope.apply();
			});
  		};		
  		
   		// 得到操作审计数据
		$scope.getAuditAnalyList = function(){					
			$scope.loading = true;
			//输入验证
   			if(!!$scope.searchPara && !$scope.validateForm($scope.searchPara)){
   				return false;
   			}
			var userId = $scope.searchPara.userId; 	
 			var startTime = $scope.searchPara.beginTime;
 			var endTime = $scope.searchPara.endTime;
 			var eventTypeId = $scope.searchPara.auditIypeId;
 			if(userId == null){
 				userId = '';
 			}
 			if(eventTypeId == null){
 				eventTypeId = '';
 			}
			if(userId == null){
				userId = '';
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
  	  				url:apigetAuditAnalyList +'?cmd=statistic&pageSize=' + $scope.pager.pageIndex + '&curPage=' + $scope.pager.curPage
  	  			};
  			AjaxServer.ajaxInfo(config, function( data ){
                var d = typeof(data) == 'string' ? JSON.parse(data) : data;
                $scope.getListSuccess = true;
                $scope.loading = false;
                $scope.pager.curPage = d.pageNum;
				$scope.pager.pagesNum = d.pageS;
				$scope.pager.total = d.total;
				$scope.analyList = d.result;	
				$scope.customScroll();
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
         * 备份
         */
         $scope.exportData = function(){
        	//输入验证
   			if(!!$scope.searchPara && !$scope.validateForm($scope.searchPara)){
   				return false;
   			}
 			var userId = $scope.searchPara.userId; 	
 			var startTime = $scope.searchPara.beginTime;
 			var endTime = $scope.searchPara.endTime;
 			var eventTypeId = $scope.searchPara.auditIypeId;
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
   	            $scope.showOprConfirm();
//   	          	$scope.getExportExcel('j-checkExport',url);
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
     		
     		$scope.showOprConfirm = function(){
      			$oprConfirm.modal('show');
      		};

      		$scope.hideOprConfirm = function(){
      			$oprConfirm.modal('hide');
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
  			$scope.getAuditAnalyList();
  		};
  	
  		$scope.apply = function() {
  			if(!$scope.$$phase) {
  			    $scope.$apply();
  			}
  		};
});

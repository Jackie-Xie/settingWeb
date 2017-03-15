'use strict';

angular.module('myappApp')
  	.controller('ActiveUserCtrl', function ($scope, AjaxServer, $location, Validate) {
  		var defaultPager = {
            	total: 0, // 
	        	curPage: 1, //当前页码
	            pagesNum: 1, //
	            pageIndex: 10, // 每页存放条数
            },
			apiGetAuditInfoList = '/onLineUser';	
  		
  		$scope.init = function () {
            $scope.pathStr = $location.path();
  			$scope.getListSuccess = false;
  			$scope.loading = true;
  			$scope.errorMsg = '';
  			$scope.successMsg = '';
  			$scope.linkList = [];
  			$scope.subNavClass = ['','','','','','','','active',''];
  			$scope.pager =  $.extend( {}, defaultPager );	
			$scope.getAuditInfoList();
			$scope.bindEventAutdit();
  		};
  		
  		$scope.bindEventAutdit = function() {  	    	
  			$(".j-body").off( "click", "**");
 			
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
  		
   		// 得到linkList数据
		$scope.getAuditInfoList = function(){					
			$scope.loading = true;
  			var ajaxConfig = {
			  	method:'get',
			  	data: {'pageSize':$scope.pager.pageIndex,'curPage':$scope.pager.curPage},
			  	url:apiGetAuditInfoList,	
			}
  			AjaxServer.ajaxInfo(ajaxConfig, function( data ){
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
  		
  		
  		$scope.apply = function() {
  			if(!$scope.$$phase) {
  			    $scope.$apply();
  			}
  		};
});

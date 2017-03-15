'use strict';

angular.module('myappApp')
  	.controller('AssessCtrl', function ($scope, $rootScope, AjaxServer, $location, Validate) {
  		var defaultPager = {
            	total: 0, // 
	        	curPage: 1, // 当前页码
	            pagesNum: 1, //
	            pageIndex: 10, // 每页存放条数
        },  
        statusText = {
            'wait':'审核中',
            'pass':'已通过',
            'refuse':'已拒绝',
        },
        apiGetUserInfo = '/account/info', 
		apiPostAssessList = '/operAudit/list', //curPage=1&pageSize=10&flag=0; flag:0表示查全部，1：已审核， 2：
        apiPostOprAudit = '/operAudit/audit',
        $oprConfirm = null;        	
  		
  		$scope.init = function () {
            $scope.pathStr = $location.path();
  			$scope.getListSuccess = false;
  			$scope.loading = true;
  			$scope.errorMsg = '';
  			$scope.successMsg = '';
  			$scope.modalTitle = '';
  			$scope.linkList = [];
            $scope.statusText =  $.extend( {}, statusText );
  			$scope.pager =  $.extend( {}, defaultPager );	
            $scope.oprType = null;  // 操作类型：pass:通过; refuse:拒绝
            $scope.oprId = null;  // 操作的id
            $oprConfirm = $('#J_oprConfirm');
            if( $rootScope.userName ){
                $scope.userName =  $rootScope.userName;
                $scope.roleId =  $rootScope.roleId; 
                $scope.onlyPwd = $rootScope.onlyPwd;              
            }else{
                var ajaxConfig = {
                    'url': apiGetUserInfo,
                    'method': 'get',
                }
                AjaxServer.ajaxInfo( ajaxConfig, 
                    function( data ){
                        if( !data || !data.userInfo || !data.userInfo.user || !data.userInfo.user.userName || !data.userInfo.user.roleId ){
                            return false;
                        }
                        $rootScope.userName = $scope.userName = data.userInfo.user.userName;
                        $rootScope.roleId = $scope.roleId = data.userInfo.user.roleId;
                        if( data.message && data.message == '请重置密码'){
                            $rootScope.onlyPwd = true;
                            $scope.onlyPwd = true;
                        }
                        if(!$scope.userName){
                            $location.url('/login');
                        }
                    }
                );
            } 
            $scope.getList();     
			$scope.bindEvent();
  		};
  		
  		$scope.bindEvent = function() {  	    	
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
 			}).on('click','.j-btnPass', function(ev){
                var it = $(ev.currentTarget),
                    idx = it.parent().attr('data-id');
                if(idx >= 0){
                    $scope.oprType = 'pass';
                    $scope.modalTitle = '审核操作';
                    $scope.oprId = $scope.list[idx].id;
                    $oprConfirm.modal('show');
                    $scope.apply();
                }                

            }).on('click','.j-btnRefuse', function(ev){
                var it = $(ev.currentTarget),
                    idx = it.parent().attr('data-id');
                if(idx >= 0){
                    $scope.oprType = 'refuse';
                    $scope.oprId = $scope.list[idx].id;
                    $oprConfirm.modal('show');
                    $scope.apply();
                }
            }); 			
   		};

        // 点击弹框取消按钮
        $scope.clickOprCancel = function(){
            $scope.oprType = null;
            $scope.oprId = null;
            $scope.errorMsg = '';
            $oprConfirm.modal('hide');
        }

        // 点击通过确定按钮
        $scope.clickOprConfirm = function( ev ){
            var it = $(ev.target);
            if(it.hasClass('disabled')){
                return false;
            }
            var ajaxConfig = {
                'url': apiPostOprAudit + '/' + $scope.oprId,
                'data':{'status': $scope.oprType},
                'method': 'post',
            };
            it.addClass('disabled').text('处理中...');
            AjaxServer.ajaxInfo( ajaxConfig, 
                function( data ){
                    it.removeClass('disabled').text('确定');
                    if( data.result ){
                        $scope.ajaxConfirmSuccess();
                    }else{
                        $scope.ajaxConfirmFail( data.message );
                    }
                    
                },
                function( error ){
                    it.removeClass('disabled').text('确定');
                    $scope.ajaxConfirmFail( error );
                }
            );
        }

        // 操作回调函数
        $scope.ajaxConfirmFail = function( msg ){
            $scope.errorMsg = msg;
            $scope.apply();
        }

        // 操作回调函数
        $scope.ajaxConfirmSuccess = function(){
            $scope.clickOprCancel();
            $scope.getList();
        }
  		
   		// 得到linkList数据
		$scope.getList = function(){					
			$scope.loading = true;
  			var ajaxConfig = {
			  	method:'get',
			  	//data: '', // flag:0表示查全部，1：已审核， 2：
			  	url: apiPostAssessList + '/0?curPage=' + $scope.pager.curPage + '&pageSize=' + $scope.pager.pageIndex,	
			}
  			AjaxServer.ajaxInfo(ajaxConfig, function( data ){
                var d = typeof(data) == 'string' ? JSON.parse(data) : data;
                $scope.getListSuccess = true;
                $scope.loading = false;
                $scope.pager.curPage = d.pageNum;
				$scope.pager.pagesNum = d.pages;
				$scope.pager.total = d.total;
                $.each(d.result, function(k,v){
                    v.jsonData = typeof(v.jsonData ) == 'string' ? JSON.parse(v.jsonData ) : v.jsonData ;
                });
                $scope.list = d.result;
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
  			$scope.getList();
  		};
  		
  		
  		$scope.apply = function() {
  			if(!$scope.$$phase) {
  			    $scope.$apply();
  			}
  		};
});

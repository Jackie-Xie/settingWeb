'use strict';

angular.module('myappApp')
  	.controller('AssessCtrl', ['$scope', '$rootScope', '$http', '$location', 'PageService','Validate',function ($scope, $rootScope, $http, $location, PageService,Validate) {
  		var defaultPager = {                    						  // 默认分页参数
                total: 0, 								  				  // 总条数
                curPage: 1, 						      				  // 当前页码
                pagesNum: 1, 						  	  				  // 总页数
                pageSize: 5 							  				  // 每页存放条数
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
  			$scope.ListShowFlag = 'loading';
  			$scope.errorMsg = '';
  			$scope.successMsg = '';
  			$scope.modalTitle = '';
  			$scope.list = [];
            $scope.statusText =  $.extend( {}, statusText );
  			$scope.pager =  $.extend( {}, defaultPager );
            $scope.oprType = null;  // 操作类型：pass:通过; refuse:拒绝
            $scope.oprId = null;  // 操作的id
            $oprConfirm = $('#J_oprConfirm');
            $scope.getList();
			$scope.bindEvent();
  		};

  		$scope.bindEvent = function() {
  			$(".j-body").off( "click", ".j-navPager .item").off( "click", ".j-navPager .prev").off( "click", ".j-navPager .next");
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

   		// 得到数据
		$scope.getList = function(){
            var conditions= {};
            $http.get('/data/assessMgr/getAssessList.json').then(function(response){
                var data = {};
                if(response.status === 200){
                    if(response.data && response.data.length > 0){
                        data = PageService.page($scope.pager.curPage,$scope.pager.pageSize,response.data,conditions);
                    }

                    if(!data || !data.result || data.result.length===0){
                        $scope.ListShowFlag = '无查询结果';
                        $scope.list = [];
                    }
                    else{
                        $scope.ListShowFlag = '';
                        $scope.list = data.result;
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
                $scope.list = [];
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
  			// 判断当前所在页面
  			$scope.getList();
  		};


  		$scope.apply = function() {
  			if(!$scope.$$phase) {
  			    $scope.$apply();
  			}
  		};
}]);

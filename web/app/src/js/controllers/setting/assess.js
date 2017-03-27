'use strict';

angular.module('myappApp')
  	.controller('AssessCtrl', ['$scope','$http', '$location','$timeout', 'PageService',function ($scope, $http, $location,$timeout, PageService) {
  		var defaultPager = {                    						  // 默认分页参数
                total: 0, 								  				  // 总条数
                curPage: 1, 						      				  // 当前页码
                pagesNum: 1, 						  	  				  // 总页数
                pageSize: 10 							  				  // 每页存放条数
            },
            statusText = {
                'wait':'审核中',
                'pass':'已通过',
                'refuse':'已拒绝',
            };

  		$scope.init = function () {
            $scope.pathStr = $location.path();
  			$scope.ListShowFlag = 'loading';
  			$scope.errorMsg = '';
  			$scope.successMsg = '';
  			$scope.modalTitle = '';
            $scope.modalInfo = '';
  			$scope.list = [];
            $scope.statusText =  angular.extend( {}, statusText );
  			$scope.pager =  angular.extend( {}, defaultPager );
            $scope.oprType = null;  // 操作类型：pass:通过; refuse:拒绝
            $scope.oprId = null;  // 操作的id
            $scope.getList();
			$scope.bindEvent();
  		};

  		$scope.bindEvent = function() {
  			angular.element('.j-body').off( 'click', '.j-navPager .item').off( 'click', '.j-navPager .prev').off( 'click', '.j-navPager .next');
 			//分页事件绑定
 			angular.element('.j-body').on('click','.j-navPager .item', function(ev){
 				var it = angular.element(ev.currentTarget);
 				$scope.gotoPage(parseInt(it.text()));
 			}).on('click','.j-navPager .prev', function(){
 				if($scope.pager.curPage <= 1){
 					return false;
 				}
 				$scope.gotoPage($scope.pager.curPage - 1);
 			}).on('click','.j-navPager .next', function(){
 				if($scope.pager.curPage >= $scope.pager.pagesNum){
 					return false;
 				}
 				$scope.gotoPage($scope.pager.curPage + 1);
 			});
   		};

        // 点击通过
        $scope.clickPass = function(idx){
            $scope.modalInfo = '确定通过这一条审核记录么？';
            $scope.oprType = 'pass';
            $scope.oprId = $scope.list[idx].id;
            $scope.formatModal();
        };

        // 点击拒绝
        $scope.clickRefuse = function(idx){
            $scope.modalInfo = '确定不通过这一条审核记录么？';
            $scope.oprType = 'refuse';
            $scope.oprId = $scope.list[idx].id;
            $scope.formatModal();
        };

        $scope.formatModal = function(){
            $scope.errorMsg = '';
  			$scope.successMsg = '';
            $scope.modalTitle = '审核操作';
            $scope.apply();
            angular.element('#J_userOprConfirm').modal('show');
        };

        // 点击请求通过或拒绝审核
        $scope.confirmOpr = function( ev ){
            var it = angular.element(ev.target);
            if(it.hasClass('disabled')){
                return false;
            }
            var postData = {'status': $scope.oprType};
            console.log(postData);
            it.addClass('disabled').text('处理中...');
            // 实际要发送请求,这里只是假设
            var flag = Math.floor(Math.random()*2);
            $timeout(function(){
                it.removeClass('disabled').text('确定');
                if(flag){
                    $scope.errorMsg = '';
                    angular.element('#J_userOprConfirm').modal('hide');
                    $scope.getList();
                }
                else{
                    $scope.errorMsg = '请求失败';
                }
                $scope.apply();
            },500);
        };

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
                        $scope.pager =  angular.element.extend( {}, defaultPager,{
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

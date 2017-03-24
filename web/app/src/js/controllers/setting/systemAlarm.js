'use strict';

angular.module('myappApp')
  	.controller('SystemAlarmCtrl', ['$scope', '$http','AjaxServer', '$rootScope', '$location','PageService', 'Validate',function ($scope, $http,AjaxServer, $rootScope, $location,PageService, Validate) {
  		var defaultPager = {
                total: 0,
                curPage: 1,
                pagesNum: 1,
                pageSize: 10
        };

        $scope.init = function () {
            $scope.pathStr = $location.path();
            $scope.ListShowFlag = 'loading';
            $scope.systemAlarmList = [];
            $scope.levelText = {
                'High':'高',
                'Medium':'中',
                'Low':'低',
            };
            $scope.pager =  $.extend( {}, defaultPager );
            $scope.bindEvent();
            $scope.getList();
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
            });
        };

        // 得到数据
        $scope.getList = function(){
            var conditions= {};
            $http.get('/data/auditorMgr/getSystemAlarmList.json').then(function(response){
                var data = {};
                if(response.status === 200){
                    if(response.data && response.data.length > 0){
                        data = PageService.page($scope.pager.curPage,$scope.pager.pageSize,response.data,conditions);
                    }

                    if(!data || !data.result || data.result.length===0){
                        $scope.ListShowFlag = '无查询结果';
                        $scope.systemAlarmList = [];
                    }
                    else{
                        $scope.ListShowFlag = '';
                        $scope.systemAlarmList = data.result;
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
                $scope.systemAlarmList = [];
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

            $scope.ListShowFlag = 'loading';
            $scope.getList();
        };


        $scope.apply = function() {
            if(!$scope.$$phase) {
                $scope.$apply();
            }
        };
}]);

'use strict';

angular.module('myappApp')
  	.controller('SystemAlarmCtrl', function ($scope, AjaxServer, $rootScope, $location, Validate) {
  		var defaultPager = {
                total: 0, // 
                curPage: 1, // 当前页码
                pagesNum: 1, //
                pageIndex: 10, // 每页存放条数
        },  
        apiGetUserInfo = '/account/info', 
        apiGetSystemAlarmList = '/systemAlarm';  
        
        $scope.init = function () {
            $scope.pathStr = $location.path();
            $scope.getListSuccess = false;
            $scope.loading = true;
            $scope.errorMsg = '';
            $scope.successMsg = '';
            $scope.linkList = [];
            $scope.levelText = {
                'High':'高',
                'Medium':'中',
                'Low':'低',
            };
            $scope.pager =  $.extend( {}, defaultPager );   
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
            $scope.bindEvent();
            $scope.getList();     
            
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
            });             
        };
        
        // 得到linkList数据
        $scope.getList = function(){                    
            $scope.loading = true;
            var ajaxConfig = {
                method:'get',                
                url: apiGetSystemAlarmList + '?curPage=' + $scope.pager.curPage + '&pageSize=' + $scope.pager.pageIndex,    
            }
            AjaxServer.ajaxInfo(ajaxConfig, function( data ){
                var d = typeof(data) == 'string' ? JSON.parse(data) : data;
                $scope.getListSuccess = true;
                $scope.loading = false;
                $scope.pager.curPage = d.pageNum;
                $scope.pager.pagesNum = d.pages;
                $scope.pager.total = d.total;
                $scope.systemAlarmList = d.result;
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

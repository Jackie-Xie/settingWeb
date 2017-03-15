'use strict';
/**
 * 通用分頁服务
 * modified by:
 * description:
 */
angular.module('myappApp')
  	.service('PageService', ['$location','$http',function($location, $http){
    var self = this;

    /*
     * 主函數獲取分頁后的數據
     */
    this.page = function(curPage,pageSize,data,search) {

    };

    /*
     * 獲得搜索以後的數據
     */
    this.search = function(search,data) {
        var searchOne = {};
        for(var k in search){
            searchOne = {
                key:k,
                value:search[k]
            };
            data = this.searchOne (searchOne,data);
        }
        return data;
    };

    /*
     * 獲得一個條件搜索的數據
     */
    this.searchOne = function(searchOne,data) {
        var aRow = undefined,
            aProVal = '',
            searchOneKey = searchOne.key,
            searchOneVal = searchOne.value,
            responseData = [];
        for(var i = 0,len = data.length; i < len; i++){
            aRow = data[i];
            for(var k in aRow){
                aProVal = aRow[k];
                if(k.indexOf(searchOneKey)>-1 && aProVal.indexOf(searchOneVal)>-1){
                    responseData.push(data[i]);
                }
            }
        }
        return responseData;
    };

    /*
     * 获取分页以后的数据
     */
    this.getPager = function(curPage,pageSize,data) {

    };

    /*
     * 获得总页码
     */
    this.getPages = function(pageSize,data) {
        var total = data.length;
        return Math.ceil(total/pageSize);
    };


}]);

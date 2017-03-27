'use strict';
/**
 * 通用分頁服务
 * modified by:
 * description:
 */
angular.module('myappApp')
  	.service('PageService', [function(){
    var self = this;

    /*
     * 主函数
     */
    this.page = function(curPage,pageSize,data,search) {
        // 筛选符合条件数据
        var searchData = self.search(search,data);
        // 得到分页以后数据
        var pageData = self.getPager(curPage,pageSize,searchData);

        return pageData;
    };

    /*
     * 獲得搜索以後的數據
     */
    this.search = function(search,data) {
        var searchOne;
        if(typeof (search) === 'object'){
            if(self.isEmptyObject(search)){
                data = data;
            }else{
                for(var k in search){
                    searchOne = {
                        key: k,
                        value: search[k]
                    };
                    if(searchOne.value !== undefined && searchOne.value !== null){
                        data = self.searchOne (searchOne,data);
                    }
                }
            }
        }
        return data;
    };

    /*
     * 獲得一個條件搜索的數據
     */
    this.searchOne = function(searchOne,data) {
        var aRow,
            aProVal = '',
            searchOneKey = searchOne.key,
            searchOneVal = searchOne.value,
            responseData = [];
        if(data && data.length > 0){
            for(var i = 0,len = data.length; i < len; i++){
                aRow = data[i];
                for(var k in aRow){
                    aProVal = aRow[k];
                    if(k.indexOf(searchOneKey)>-1){
                        if(typeof(aProVal) === 'string' ? aProVal.indexOf(searchOneVal)>-1 : aProVal === searchOneVal){
                            responseData.push(data[i]);
                        }
                    }
                }
            }
        }
        return responseData;
    };

    /*
     * 获取分页以后的数据
     */
    this.getPager = function(curPage,pageSize,data) {
        var pageData,
            startIndex = (curPage - 1) * pageSize,
            endIndex = (curPage * pageSize - 1 > data.length) ? data.length - 1 : curPage * pageSize - 1;
        pageData = {
            total : data.length || 0,
            curPage : curPage,
            pageSize : pageSize,
            startRow : startIndex,
            endRow : endIndex + 1,
            pagesNum : self.getPages(pageSize,data),
            result : self.getPageData(startIndex,endIndex,data)
        };
        return pageData;
    };

    /*
     * 获得一页的数据
     */
    this.getPageData = function(startIndex,endIndex,data) {
        var tempArr = [],
            tArr;
        for(var i = startIndex,len = endIndex + 1; i < len; i++){
            tArr = data[i] || {};
            tempArr.push(tArr);
        }
        return tempArr;
    };

    /*
     * 获得总页码
     */
    this.getPages = function(pageSize,data) {
        var total = data.length || 0;
        return Math.ceil(total/pageSize);
    };

    /*
     * 判断空对象
     */
    this.isEmptyObject = function (obj) {
        for (var key in obj) {
            return false;
        }
        return true;
    };


}]);

var HtmlUtil = {
    /*1.用浏览器内部转换器实现html转码*/
    htmlEncode:function (html){
        'use strict';
        //1.首先动态创建一个容器标签元素，如DIV
        var temp = document.createElement ('div');
        //2.然后将要转换的字符串设置为这个元素的innerText(ie支持)或者textContent(火狐，google支持)
        if(temp.textContent !== undefined ){
            temp.textContent = html;
        }else{
            temp.innerText = html;
        }
        //3.最后返回这个元素的innerHTML，即得到经过HTML编码转换的字符串了
        var output = temp.innerHTML;
        temp = null;
        return output;
    },
    /*2.用浏览器内部转换器实现html解码*/
    htmlDecode:function (text){
        'use strict';
        //1.首先动态创建一个容器标签元素，如DIV
        var temp = document.createElement('div');
        //2.然后将要转换的字符串设置为这个元素的innerHTML(ie，火狐，google都支持)
        temp.innerHTML = text;
        //3.最后返回这个元素的innerText(ie支持)或者textContent(火狐，google支持)，即得到经过HTML解码的字符串了。
        var output = temp.innerText || temp.textContent;
        temp = null;
        return output;
    },
    /*3.用正则表达式实现html转码*/
    htmlEncodeByRegExp:function (str){
        'use strict';
        var s = '';
        if(str.length === 0){
            return '';
        }
        s = str.replace(/&/g,'&amp;');
        s = s.replace(/</g,'&lt;');
        s = s.replace(/>/g,'&gt;');
        s = s.replace(/ /g,'&nbsp;');
        s = s.replace(/\'/g,'&#39;');
        s = s.replace(/\"/g,'&quot;');
        return s;
    },
    /*4.用正则表达式实现html解码*/
    htmlDecodeByRegExp:function (str){
        'use strict';
        var s = '';
        if(str.length === 0) {
            return '';
        }
        s = str.replace(/&amp;/g,'&');
        s = s.replace(/&lt;/g,'<');
        s = s.replace(/&gt;/g,'>');
        //s = s.replace(/&nbsp;/g,' ');
        s = s.replace(/&#39;/g,'\'');
        s = s.replace(/&quot;/g,'\"');
        return s;
   }
};

angular.module('myappApp')
  	.service('AjaxServer', ['$location', '$http', '$rootScope',function($location, $http, $rootScope){
        'use strict';
  		this.ajaxInfo = function( config , fnSuccess, fnFail ) {
            var self = this;
            self.url = config.url;
            if(!config || !config.url || '' === config.url){
                console.log('ajax config error');
                return false;
            }
            if( $rootScope.onlyPwd && self.url !== '/account/login' && ( $location.path().indexOf('/setting/modify')<0 && $location.path().indexOf('/login') < 0 ) ){
                $location.path('/setting/modify');
                return false;
            }
            $http({
                method: config.method || 'get',
                data: config.data || '',
                params: config.method === 'get' ? config.data || '' : '',
                responseType: config.responseType || 'json',
                url: config.url
            }).success(function(data,header,config,status,statusText){
            	//data = data || {};
            	if(data && data.errorCode){
            		if(data.errorCode === '401'){
            			$location.path('/login');
                        return false;
            		}
            		if(data.errorCode === '402' ){
                        $location.path('/402');
                        return false;
                    }
                    if(data.errorCode === '404'){
                        $location.path('/404');
                        return false;
                    }

            	}else{
                    if( data && data.message && data.message.indexOf('请重置密码')>-1){
                        $rootScope.onlyPwd = true;
                        $rootScope.$broadcast('onlyPwd', true);
                        if( data.userInfo && data.userInfo.user && data.userInfo.user.userName && data.userInfo.user.roleId ){
                            $rootScope.userName = data.userInfo.user.userName;
                            $rootScope.roleId = data.userInfo.user.roleId;
                        }
                        if( self.url !== '/account/login' && ( $location.path().indexOf('/setting/modify') < 0 && $location.path().indexOf('/login') < 0 ) ){
                            $location.path('/setting/modify');
                            return false;
                        }

                    }
            		if( fnSuccess ){
                        fnSuccess(data);
                    }else{
                        console.log(data);
                    }
            	}

            }).error(function(data,header,config,status){
            	data = data || {};
            	if(data.errorCode){
            		if(data.errorCode === '401'){
                        if( $('.modal').length > 0 ){
                            $('.modal').modal('hide');
                            $('.modal-backdrop').remove();
                        }
            			$location.path('/login');
                        return false;
            		}
            		if(data.errorCode === '402' ){
            			$location.path('/402');
                        return false;
            		}
                    if(data.errorCode === '404'){
                        $location.path('/404');
                        return false;
                    }
            	}else{
	                if( fnFail ){
	                    fnFail(status);
	                }else{
	                    console.log(status);
	                }
            	}
            });
  		};

  	}]);

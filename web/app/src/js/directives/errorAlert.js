'use strict';

angular.module('myappApp')
    .directive('errorAlert',function () {
        return {
            restrict: "EAC",
            template: '<div class="modal fade" role="dialog" aria-hidden="true">' +
				        '<div class="modal-dialog modal-sm">' +
				        	'<div class="modal-content">' +
								'<div class="modal-header">' +
								    '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
								    '<h6>系统提示</h6>' +
								'</div>' +
								'<div class="modal-body">' +
								    '<div class="text-center pd15">{{msg}}</div>' +
								'</div>' +
								'<div class="modal-footer">' +
									'<button class="btn btn-info btn-md" data-text="确定" data-dismiss="modal" aria-hidden="true">确定</button>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>',
            replace: true,
            scope: {
                msg: '='
            },
            compile: function(tElement, tAttrs, transclude) {
                return function(scope, iElement, iAttrs) {
                    scope.$watch('msg', function(newVal, oldVal){
                        if(newVal != oldVal && newVal != ''){
                            iElement.modal('show');
                        }
                    });
                    tElement.on('hidden.bs.modal', function () {
                        scope.msg = "";
                        scope.$apply();
                    })
                }
            }
        };
    });

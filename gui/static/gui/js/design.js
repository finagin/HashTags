VK.init(function () {
    console.log('VK.init.success')
}, function () {
    console.error('VK.init.error');
}, '5.21');

angular.module('HubbleProject', [])

.config(['$interpolateProvider', function($interpolateProvider) {
    $interpolateProvider.startSymbol('{$');
    $interpolateProvider.endSymbol('$}');
}])

.factory('Search', function(){
    var p = document.location.search.substr(1).split("&"),
        r = {},
        q;
    for(var i = 0, l = p.length; i < l; i++){
        q = p[i].split('=');
        r[q[0]] = ((q[0] == 'api_result')?JSON.parse(decodeURIComponent(q[1])):q[1]);
    }
    return r;
})

.service('$VK', ['$http','Search', function($http, Search){
    return function(method,params){
        var p = '';
        for(item in params){
            p += item + '=' + params[item] + '&';
        }
        
        return $http({method:'JSONP', url: 'https://api.vk.com/method/' + method + '?' + p + 'v=5.21&access_token=' + Search.access_token + '&callback=JSON_CALLBACK'});
    };
}])

.service('$API', ['$http', function($http) {
    return function(method, params){
        var url = ['/api'];
        for(var i = 0, l = arguments.length; i < l; i++){
            url.push(arguments[i]);
        }
        console.log(url.join('/'));
        return $http({method: 'GET', url: url.join('/')});
    };
}])

.directive('tabs', function() {
    return {
        restrict: 'E',
        transclude: true,
        scope: {},
        controller: function($scope, $element) {
            var panes = $scope.panes = [];
            
            $scope.select = function(pane) {
                angular.forEach(panes, function(pane) {
                    pane.selected = false;
                });
                pane.selected = true;
            };
            
            this.addPane = function(pane) {
                if (panes.length == 0) $scope.select(pane);
                panes.push(pane);
            };
        },
        template:  '\
            <div class="tabbable">\
                <ul class="nav nav-tabs">\
                    <li ng-repeat="pane in panes" ng-class="{active:pane.selected}">\
                        <a href="" ng-click="select(pane)"><i class="{$ pane.icon $}"></i> {$pane.name$}</a>\
                    </li>\
                    <li class="pull-right" onclick="VK.callMethod(\'showInviteBox\')">\
                        <div class="btn btn-primary">\
                            <span class="fa fa-child"></span> Пригласить\
                        </div>\
                    </li>\
                </ul>\
                <div class="tab-content" ng-transclude></div>\
            </div>\
        ',
        replace: true
    };
})

.directive('pane', function() {
    return {
        require: '^tabs',
        restrict: 'E',
        transclude: true,
        scope: { name: '@', icon: '@'},
        link: function(scope, element, attrs, tabsCtrl) {
            tabsCtrl.addPane(scope);
        },
        template: '<div class="tab-pane fade" ng-class="{\'active in\': selected}" ng-transclude></div>',
        replace: true
    };
})

.controller('MainCtrl', ['$scope', '$VK', 'Search', '$API', function($scope, $VK, Search, $API){
    $scope.fn = function(){};
    $scope.msg = '';
    $scope.alert = function(msg){
        $scope.msg = msg;
        var alert = document.getElementById('alert');
        alert.style.display = 'block';
        alert.classList.add('in');
        setTimeout(function(){
            alert.classList.remove('in');
            setTimeout(function(){
                alert.style.display = 'none';
            },1900);
        },2500);
    };
    
    $scope.dropdown = [{text:'qwe',value:'123'},{text:'asd',value:'456'},{text:'zxc',value:'890'}];
}])

.controller('PostCtrl', ['$scope', '$API', '$VK', 'Search', function($scope, $API, $VK, Search){
    $scope.fn = function(){};
    $API('checkGroups', Search.api_result.response)
    .success(function(data){
        if(data.response){
            $VK('groups.getById', {group_ids:data.response})
            .success(function(data){
                if(data.response){
                    $scope.groups = data.response;
                } else {
                    location.reload();
                }
            });
        } else {
            location.reload();
        }
        $scope.loadAnimation = true;
    });
    
    $scope.getTags = function() {
        $scope.selectTag = undefined;
        $API('getTags',$scope.selectGroup.id)
        .success(function(data) {
            if(data.response){
                $scope.tags = data.response;
            } else {
                location.reload();
            }
        });
    };
    
    $scope.send = function() {
        var text = '#' + $scope.selectTag.text;
        if(!/^club\d+/.test($scope.selectGroup.screen_name)){
            text += '@' + $scope.selectGroup.screen_name;
        }
        text += '\n' + $scope.message + '\n';
        
        $API('getFollowers',$scope.selectTag.hid)
        .success(function(data) {
            if(data.response){
                for(var i = 0, l = data.response.length; i < l; i++){
                    text += ' @id' + data.response[i] + ' ( )'
                }
                VK.api(
                    'wall.post',
                    {
                        owner_id: -$scope.selectGroup.id,
                        message: text
                    },
                    function(data){
                        $scope.message = '';
                        $scope.selectTag = undefined;
                        $scope.selectGroup = undefined;
                        $scope.alert('Сообщение отправленно');
                    }
                );
            } else {
                location.reload();
            }
        });
    };
}])

.controller('SettingsCtrl', ['$scope', '$API', '$VK', 'Search', function($scope, $API, $VK, Search){
    var Data = [],
        admin = [],
        other = [],
        request = [],
        temp;
    $scope.groups = [];
    
    $scope.fn = function(){
    };
    
    $scope.create = function(){
        var a = [];
        for(var i = 0, l = $scope.members.length; i < l; i++){
            if($scope.members[i].check){
                a.push($scope.members[i].id)
            }
        }
        $API('createHashTag', $scope.addG, $scope.newHash)
        .success(function(data){
            $API('follow', Search.viewer_id, data.response.tag.hid, a)
            .success(function(data){
                location.reload()
            });
        });
    };
    
    $scope.close = function(){
        $scope.members = [];
        $scope.display = false;
        $scope.newHash = '';
        $scope.mSearh = '';
    };
    
    $scope.getMembers = function(gid, i, members){
        $VK('groups.getMembers',{group_id: gid, count: 100, offset: i, fields: 'sex'})
        .success(function(data){
            members = members.concat(data.response.items);
            i += 100;
            if(i < data.response.count){
                $scope.getMembers(gid, i, members);
            } else {
                $scope.members = members;
                $scope.ready = false;
            }
        })
    }
    
    $scope.follow = function(hid,tag){
        $API('follow',Search.viewer_id,hid,Search.viewer_id);
        tag.isfollow = !tag.isfollow;
    };
    
    $scope.unFollow = function(hid, tag, group){
        $API('unFollowHashTag',hid,Search.viewer_id)
        .success(function(data){
            console.log(group)
            if(data.response == 1){
                group.tags.splice(group.tags.indexOf(tag),1);
            }
        });
        tag.isfollow = !tag.isfollow;
    };
    
    $scope.modal = function(group){
        $scope.addG = group.id;
        $scope.ready = true;
        $scope.display = true;
        var members = [];
        
        $scope.getMembers(group.id,0,members);
    };
    
    $VK('groups.get',{"extended":1})
    .success(function(data){
        if(data.response){
            for(var i = 0; i < data.response.count; i++){
                temp = data.response.items[i];
                ((temp.is_admin)? admin : other).push(temp);
                request.push(temp.id)
            }
        }
        
        $API('getTagsForGroups',Search.viewer_id,request)
        .success(function(data){
            if(data.response){
                for(var i = 0; i < data.response.length; i++){
                    bool = true;
                    for(var j = 0; j < other.length && bool; j++){
                        if(data.response[i].gid == other[j].id){
                            data.response[i].gid = other[j];
                            bool = false;
                        }
                    }
                }
                for(var i = 0; i < data.response.length; i++){
                    bool = true;
                    for(var j = 0; j < admin.length && bool; j++){
                        if(data.response[i].gid == admin[j].id){
                            data.response[i].gid = admin.splice(j,1)[0];
                            bool = false;
                        }
                    }
                }
                for(var i = 0; i < admin.length; i++){
                    data.response.push({gid:admin[i],tags:[]});
                }
                $scope.groups = data.response;
            }
        })
    });
}])
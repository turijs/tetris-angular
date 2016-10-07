angular.module('tetrisGame').controller('upcomingController', ['$scope', 'pieceManager', 'settings', function($scope, manager, settings){
  $scope.settings = settings;
  $scope.upcoming = manager.upcomingPieces;
}]);

angular.module('tetrisGame').controller('scoreController', ['$scope', 'scoreManager', function($scope, score){
  $scope.score = score;
}]);

angular.module('tetrisGame').controller('holdController', ['$scope', 'pieceManager', 'settings', function($scope, manager, settings){
  $scope.settings = settings;
  $scope.manager = manager;
}]);

/* print inline style */

angular.module('tetrisGame').controller('styleController', ['$scope', 'settings', function($scope, settings){
  $scope.getStyle = function() {
    return ".block{width:"+settings.scale+"px;height:"+settings.scale+"px;}";
  }
}]);

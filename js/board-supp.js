angular.module('tetrisGame').controller('upcomingController', ['$scope', 'pieceManager', 'settings', function($scope, manager, settings){
  $scope.scale = settings.scale;
  $scope.upcoming = manager.upcomingPieces;
}]);

angular.module('tetrisGame').controller('scoreController', ['$scope', 'scoreManager', function($scope, score){
  $scope.score = score;
}]);

angular.module('tetrisGame').controller('gameControls', ['$scope', 'gameManager', 'uiState', function($scope, game, ui) {
  /* start game when page is loaded */
  game.restart();

  $scope.ui = ui;
  $scope.game = game;
  $scope.pauseMsg = function() {
    return game.isEnded ? "Game Over" : "Paused";
  }
  $scope.resume = function() {
    if(game.isEnded) return;

    game.resume();
    ui.setState('game');
  };
  $scope.new = function() {
    game.restart();
    ui.setState('game');
  };

  /* watch to see if the game ends, and if so trigger the pause screen */
  $scope.$watch(function(){return game.isEnded}, function(newVal, oldVal){
    if(newVal)
      ui.setState('pause');
  });


}]);

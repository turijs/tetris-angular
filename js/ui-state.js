angular.module('tetrisGame').factory('uiState', ['gameManager', function(game){
  var ui = {};

  ui.setState = function(state) {
    if(state == "game" && game.ended) return false;

    this.state = state;
  }

  ui.setState('game');

  return ui;
}]);

angular.module('tetrisGame').factory('uiState', ['gameManager', function(game){
  var ui = {};

  ui.setState = function(state) {
    if(state == "game" && game.ended) return false;

    this.state = state;
    console.log(this.state);
  }

  ui.setState('game');

  return ui;
}]);

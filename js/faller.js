angular.module('tetrisGame').factory('faller', ['grid', '$timeout', function(grid, $timeout) {
  var faller = {};

  faller.reFall = function(piece, start) {
    this.position = {x:Math.floor((grid.width - 1)/2), y:piece.topOffset};
    this.aboutToFix = false;
    this.landAttempts = 0;
    this.restart = true; //stop from sliding up to re-fall
      $timeout(function(){faller.restart = false;}, 20);
    //////
    this.points = piece.points;
    this.color = piece.color;
    this.spread = piece.spread;
    this.moveRight = piece.moveRight;
    this.moveLeft = piece.moveLeft;
    this.moveDown = piece.moveDown;
    this.jumpTo = piece.jumpTo;
    this.rotateCW = piece.rotateCW;
  }

  return faller;
}]);

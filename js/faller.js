angular.module('tetrisGame').factory('faller', ['grid', '$timeout', function(grid, $timeout) {
  var faller = {};

  faller.reFall = function(piece, start) {
    this.source = piece;
    this.position = {x:Math.floor((grid.width - 1)/2), y:piece.topOffset};
    this.aboutToFix = false;
    this.fixed = false;
    this.landAttempts = 0;
    //stop from sliding up to re-fall
    this.restart = true;
      $timeout(function(){faller.restart = false;}, 20);

    this.points = piece.points;
    this.color = piece.color;
    this.spread = piece.spread;
    this.pivot = piece.pivot;
    this.moveRight = piece.moveRight;
    this.moveLeft = piece.moveLeft;
    this.moveDown = piece.moveDown;
    this.jumpTo = piece.jumpTo;
    this.rotateCW = piece.rotateCW;
  }

  return faller;
}]);

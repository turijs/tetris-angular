angular.module('tetrisGame').factory('pieceManager', [function() {
  var manager = {};

  /**/ var _id = -1; /**/
  var Piece = manager.Piece = function Piece(points, color, even) {
    this.id = ++_id;
    this.points = points;
    this.color = color;
    this.isEven = even ? true : false;
    this.pivot = even ? {x:0, y:0} : {x:0.5, y:-0.5};
    this.topOffset = this.getTopOffset();
    this.spread = this.getSpread();
  }
  Piece.prototype.getTopOffset = function() {
    return Math.max.apply(null, this.points.map(function(curr){
      return curr.y;
    }));
  };
  /* distance of the farthest block from the center */
  Piece.prototype.getSpread = function() {
    return Math.max.apply(null, this.points.map(function(curr){
      return Math.max(
        Math.ceil(Math.abs(curr.x - this.pivot.x)),
        Math.ceil(Math.abs(curr.y - this.pivot.y))
      );
    }));
  };
  Piece.prototype.moveRight = function() {
    this.position.x++;
    return this;
  };
  Piece.prototype.moveLeft = function() {
    this.position.x--;
    return this;
  };
  Piece.prototype.moveDown = function(n) {
    if(typeof n === "undefined") var n = 1;
    this.position.y += n;
    return this;
  };
  Piece.prototype.jumpTo = function(relativePos) {
    /* relativePos has positive y as up */
    this.position.x += relativePos.x;
    this.position.y -= relativePos.y;
    return this;
  };
  Piece.prototype.rotateCW = function(center) {
    center = center || this.pivot;
    this.points = this.points.map(function(pt){
      return {x: pt.y - center.y + center.x, y: center.x - pt.x + center.y};
    });
    return this;
  };


  var EvenPiece = manager.EvenPiece = function EvenPiece(points, color) {
    Piece.call(this, points, color);
  }


  manager.pieceTypes = [
    new Piece(
      [{x:0, y:0}, {x:-1, y:0}, {x:1, y:0},{x:0, y:1}],
      'purple'),
    new Piece(
      [{x:0,y:0}, {x:-1,y:0}, {x:1,y:0}, {x:2,y:0}],
      'cyan', true /* even */),
    new Piece(
      [{x:0,y:0}, {x:-1,y:0}, {x:-1,y:1}, {x:1,y:0}],
      'blue'),
    new Piece(
      [{x:0,y:0}, {x:-1,y:0}, {x:1,y:0}, {x:1,y:1}],
      'orange'),
    new Piece(
      [{x:0,y:0}, {x:1,y:0}, {x:0,y:-1}, {x:1,y:-1}],
      'yellow', true),
    new Piece(
      [{x:0,y:0}, {x:-1,y:0}, {x:0,y:1}, {x:1,y:1}],
      'lime'),
    new Piece(
      [{x:0,y:0}, {x:1,y:0}, {x:0,y:1}, {x:-1,y:1}],
      'red'),
  ];

  manager.upcomingPieces = [];

  manager.heldPiece = null;



  manager.queuePiece = function(n) {
    /* n: number of pieces to queue (optional) */
    n = n || 1;

    for(var i = 0; i < n; i++) {
      var index = Math.floor(Math.random()*this.pieceTypes.length);

      this.upcomingPieces.push(this.pieceTypes[index]);
    }
  };

  manager.getNextPiece = function() {
    this.queuePiece();

    return this.upcomingPieces.shift();
  };

  manager.flushQueue = function() {
    this.upcomingPieces.length = 0;
    this.heldPiece = null;
    return this;
  }

  manager.swapHoldPiece = function(newPiece) {
    var piece = this.heldPiece ? this.heldPiece : this.getNextPiece();

    this.heldPiece = newPiece;

    return piece;
  };


  return manager;
}]);

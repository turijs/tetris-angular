angular.module('tetrisGame').factory('pieceManager', [function() {
  var manager = {};

  function Piece(points, color) {
    this.points = points;
    this.color = color;
    this.topOffset = this.getTopOffset();
    this.spread = this.getSpread();
  }
  Piece.prototype.getTopOffset = function() {
    return Math.max.apply(null, this.points.map(function(curr){
      return curr.y;
    }));
  };
  Piece.prototype.getSpread = function() {
    return Math.max.apply(null, this.points.map(function(curr){
      return Math.max(
        Math.abs(curr.x),
        Math.abs(curr.y)
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
    center = center || {x:0, y:0};
    this.points = this.points.map(function(pt){
      return {x: pt.y - center.y + center.x, y: center.x - pt.x + center.y};
    });
    return this;
  };


  function EvenPiece(points, color) {
    Piece.call(this, points, color);
  }
  /* EvenPiece inherits from Piece */
  EvenPiece.prototype = Object.create(Piece.prototype);

  EvenPiece.prototype.getSpread = function() {
    return Math.max.apply(null, this.points.map(function(curr){
      return Math.max(
        Math.ceil(Math.abs(curr.x - 0.5)),
        Math.ceil(Math.abs(curr.y + 0.5))
      );
    }));
  };
  EvenPiece.prototype.rotateCW = function(center) {
    center = center || {x:0.5, y:-0.5};

    this.points = this.points.map(function(pt){
      return {x: pt.y - center.y + center.x, y: center.x - pt.x + center.y};
    });

    return this;
  };



  manager.pieceTypes = [
    new Piece(
      [{x:0, y:0}, {x:-1, y:0}, {x:1, y:0},{x:0, y:1}],
      'purple'),
    new EvenPiece(
      [{x:0,y:0}, {x:-1,y:0}, {x:1,y:0}, {x:2,y:0}],
      'cyan'),
    new Piece(
      [{x:0,y:0}, {x:-1,y:0}, {x:-1,y:1}, {x:1,y:0}],
      'blue'),
    new Piece(
      [{x:0,y:0}, {x:-1,y:0}, {x:1,y:0}, {x:1,y:1}],
      'orange'),
    new EvenPiece(
      [{x:0,y:0}, {x:1,y:0}, {x:0,y:-1}, {x:1,y:-1}],
      'yellow'),
    new Piece(
      [{x:0,y:0}, {x:-1,y:0}, {x:0,y:1}, {x:1,y:1}],
      'green'),
    new Piece(
      [{x:0,y:0}, {x:1,y:0}, {x:0,y:1}, {x:-1,y:1}],
      'red'),
  ];

  manager.upcomingPieces = [];

  var id = -1;

  manager.queuePiece = function(n) {
    /* n: number of pieces to queue (optional) */
    n = n || 1;

    for(var i = 0; i < n; i++) {
      var index = Math.floor(Math.random()*this.pieceTypes.length);

      var itm = {
        piece: this.pieceTypes[index],
        /* assign an ID # to uniquely identify each item in the queue */
        id: ++id
      };

      this.upcomingPieces.push(itm);
    }
  };

  manager.getNextPiece = function() {
    this.queuePiece();

    return this.upcomingPieces.shift().piece;
  };

  manager.flushQueue = function() {
    this.upcomingPieces.length = 0;
    return this;
  }

  return manager;
}]);

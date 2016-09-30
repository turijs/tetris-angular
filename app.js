var app = angular.module('tetrisGame', []);


app.controller('gridController', ['$scope', 'grid', function($scope, grid) {
  $scope.grid = grid;

}]);

app.controller('fallerController', ['$scope', 'faller','gameManager', '$document', function($scope, faller, gameManager, $document){
  var scale = 30;
  var borderWidth = 1;
  var keyMap = {
    32: "hard",
    37: "left",
    38: "rot",
    39: "right",
    40: "down"
  };
  $document.bind("keydown", function(e) {
    var c = e.keyCode, action;
    if(action = keyMap[c]) {
      e.preventDefault();
      //console.log("Defined!");
      $scope.$apply(gameManager[action]);

    }


  });

  $scope.faller = faller;

  $scope.applyScale = function(n, neg) {
    return (n*(scale + borderWidth)*(neg ? -1 : 1)) + 'px';
  }
}]);

app.controller('gameControls', ['$scope', 'gameManager', function($scope, game) {
  game.restart();

}]);


app.factory('grid', function(){
  var grid = {};

  grid.gen = function(width, height) {
    this.width = width;
    this.height = height;
    this.content = new Array(+height).fill(null).map(function(){
      return new Array(+width).fill(null);
    });
  };

  grid.set = function(vector, val) {
    this.content[vector.y][vector.x] = val;
  };

  grid.get = function(vector) {
    return this.content[vector.y][vector.x];
  };

  grid.absorb = function(piece) {
    var pos = piece.position;
    console.log("absorbing...");
    piece.points.forEach(function(pt){
      grid.set({x: pos.x + pt.x, y: pos.y - pt.y}, piece.color);
    });
  };

  grid.findCompleteRows = function() {
    var completedRows = [];
    rows:
    for(var y = 0; y < this.height; y++) {
      for(var x = 0; x < this.width; x++) {
        if(!this.content[y][x]) continue rows;
      }
      completedRows.push(y);
    }

    return completedRows;
  };

  grid.collapseRows = function(rows) {
    for(var i = 0; i < rows.length; i++) {
      this.content.unshift(this.content.splice(rows[i],1)[0].fill(null));
    }
  };

  grid.gen(12, 20);

  //console.log(grid.content);

  return grid;
});




app.factory('faller', ['grid', function(grid) {
  var faller = {};

  faller.reFall = function(piece, start) {
    this.position = {x:Math.floor((grid.width - 1)/2), y:piece.topOffset};
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

app.factory('pieceManager', [function() {
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

  manager.queuePiece = function(n) {
    /* n: number of pieces to queue (optional) */
    n = n || 1;

    for(var i = 0; i < n; i++) {
      var index = Math.floor(Math.random()*this.pieceTypes.length);
      this.upcomingPieces.push(index);
    }
  };

  manager.getNextPiece = function() {
    this.queuePiece();

    return this.pieceTypes[this.upcomingPieces.shift()];
  };

  return manager;
}]);

app.factory('gameManager', ['grid', 'faller', 'pieceManager', '$document', '$timeout','$interval', function(grid, faller, pieceManager, $document, $timeout, $interval){
  var game = {};


  game.left = function() {
    if(game.findCollision( game.ghostFaller().moveLeft() ))
      return;

    faller.moveLeft();
  };
  game.right = function() {
    if(game.findCollision( game.ghostFaller().moveRight() ))
      return;

    faller.moveRight();
  };
  game.down = function() {
    if(game.findCollision( game.ghostFaller().moveDown() ))
      return;

    faller.moveDown();
  };
  game.rot = function() {
    var normalRot = game.ghostFaller().rotateCW()
    if(!game.findCollision( normalRot )) {
      faller.rotateCW();
      return;
    }
    /* Try rotating about each individual point; this can create "wall kicks" */
    for(var i = 0; i < faller.points.length; i++) {
      var offsetRot = game.ghostFaller().rotateCW(faller.points[i])
      if(!game.findCollision( offsetRot )) {
        /* find offset */
        var offset = {x: offsetRot.points[0].x - normalRot.points[0].x, y: offsetRot.points[0].y - normalRot.points[0].y}
        faller.jumpTo(offset).rotateCW();
        return
      }
    }
  };
  game.hard = function() {
    var ghost = game.ghostFaller(), n = 0;
    while(!game.findCollision(ghost.moveDown())) {
      n++;
    }
    faller.moveDown(n);
  }



  game.restart = function() {
    pieceManager.queuePiece(3);
    faller.reFall(pieceManager.getNextPiece());


    this.tickSpeed = 1;
    this._TID = $interval(this.tick, 1000);
  };

  game.tick = function() {
    var self = game;

    if(self.findCollision( self.ghostFaller().moveDown() )) {
      grid.absorb(faller);

      var completeRows = grid.findCompleteRows();
      if(completeRows.length)
        grid.collapseRows(completeRows);

      faller.reFall(pieceManager.getNextPiece());

    } else {
      faller.moveDown();
    }


  };

  game.findCollision = function(piece) {

    var pos = piece.position, points = piece.points, pt, vec;

    for(var i = 0; i < points.length; i++) {
      pt = points[i];
      vec = {x: pos.x + pt.x, y: pos.y - pt.y};
      if(vec.x < 0 || vec.x >= grid.width || vec.y >= grid.height || grid.get(vec))
        return pt;
    }

    return false;
  };

  game.ghostFaller = function() {
    var ghost = Object.create(faller);
    ghost.position = {x: faller.position.x, y: faller.position.y};

    return ghost;
  }



  return game;
}]);

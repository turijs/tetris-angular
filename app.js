var app = angular.module('tetrisGame', []);


app.controller('gridController', ['$scope', 'grid', 'settings', 'gameManager', '$timeout', function($scope, modelGrid, settings, game, $timeout) {
  /* This controller uses modeGrid and viewGrid to distinguish between the
  ** actual grid service and a helper object which is used to aid in rendering */

  $scope.applyScale = settings.applyScale;
  $scope.modelGrid = modelGrid;
  $scope.game = game;

  setupBGGrid();
  setupViewGrid();

  /* View-Grid holds the fixed blocks in the grid - not the moving piece */
  function setupViewGrid() {
    var newGrid = [];

    modelGrid.content.forEach(function(row, i){
      newGrid.push({
        cells: row,
        pos: i,
        justCleared: false
      });
    });

    $scope.viewGrid = newGrid;
  }
  /* BG-Grid used to render the background grid lines save rendering
  ** because these don't change during the course of a game */
  function setupBGGrid() {
    $scope.BGGrid = new Array(modelGrid.height).fill(null).map(function(){
      return new Array(modelGrid.width).fill(null);
    });
    console.log("BGGrid:",$scope.BGGrid);
  }

  /* Update the viewGrid to reflect changes in the modelGrid */
  var watchExpressions = [
    function() {return modelGrid.content},
    function() {return modelGrid.content[0]},
  ];
  $scope.$watchGroup(watchExpressions, function(newVals, oldVals){
    /* If modelGrid was regenerated, we need to regenerate the viewGrid and BGGrid */
    if(newVals[0] !== oldVals[0]) {
      setupBGGrid();
      setupViewGrid();
      return;
    }

    /* If no rows were cleared, then exit */
    if(newVals[1] == oldVals[1]) return;

    $scope.viewGrid.forEach(function(row){
      /* Loop through all rows to find new positions
      ** start from the current position to save time */
      for(var i = 0, j = row.pos, l = modelGrid.height; i < l; i++, j = ++j % l) {
	      if(row.cells === modelGrid.content[j]) {
          var newPos = j;
          break;
        }
      }
      if(newPos === "undefined")
        throw "unable to identify new position; row removed";


      /* if the row is at the top, that means it was just cleared */
      if(newPos === 0) {
        row.justCleared = true;
        /* after acouple seconds, it is no longer "just cleared"; any animations will have time to run */
        $timeout(function(){row.justCleared = false}, 2000);
      }



      row.pos = newPos;

    });
  });

}]);

app.controller('fallerController', ['$scope', 'faller','gameManager', 'settings', 'uiState', '$document', function($scope, faller, game, settings, ui, $document){
  $scope.controls = {
    27: {
      fn: function() {
        game.pause();
        ui.setState('pause');
      }
    },
    32: {
      fn: game.hard
    },
    37: {
      fn: game.left,
      repeatDelay: 50,
      initialRepeatDelay: 200
    },
    38: {
      fn: game.rot
    },
    39: {
      fn: game.right,
      repeatDelay: 50,
      initialRepeatDelay: 200
    },
    40: {
      fn: game.down,
      repeatDelay: 50
    }
  };

  $scope.faller = faller;

  $scope.applyScale = settings.applyScale;

  $scope.classNames = function() {
    var map = {};
    map[faller.color] = true;
    map.aboutToFix = faller.aboutToFix;

    return map;
  };


}]);

app.controller('gameControls', ['$scope', 'gameManager', 'uiState', function($scope, game, ui) {
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


app.factory('grid', function(){
  var grid = {};

  grid.gen = function(width, height) {
    this.width = +width;
    this.height = +height;



    this.content = new Array(grid.height).fill(null).map(function(){
      return new Array(grid.width).fill(null);
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
    //console.log("absorbing...");
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

  // console.log(grid.content);

  return grid;
});




app.factory('faller', ['grid', '$timeout', function(grid, $timeout) {
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

app.factory('gameManager', ['grid', 'faller', 'pieceManager', 'settings', '$document', '$timeout','$interval', function(grid, faller, pieceManager, settings, $document, $timeout, $interval){
  var game = {};

  game.isRunning = true;
  game.isEnded = false;


  game.left = function() {
    if(game.findCollision( game.ghostFaller().moveLeft() ))
      return;

    faller.moveLeft();
    game.checkLanded();
  };
  game.right = function() {
    if(game.findCollision( game.ghostFaller().moveRight() ))
      return;

    faller.moveRight();
    game.checkLanded();
  };
  game.down = function() {
    if(game.findCollision( game.ghostFaller().moveDown() ))
      return false;

    faller.moveDown();
    game.checkLanded();
    return true;
  };
  game.rot = function() {
    var normalRot = game.ghostFaller().rotateCW()
    if(!game.findCollision( normalRot )) {
      faller.rotateCW();
      game.checkLanded();
      return;
    }
    /* Try rotating about each individual point; this can create "wall kicks" */
    for(var i = 0; i < faller.points.length; i++) {
      var offsetRot = game.ghostFaller().rotateCW(faller.points[i])
      if(!game.findCollision( offsetRot )) {
        /* find offset */
        var offset = {x: offsetRot.points[0].x - normalRot.points[0].x, y: offsetRot.points[0].y - normalRot.points[0].y}
        faller.jumpTo(offset).rotateCW();
        game.checkLanded();
        return;
      }
    }
  };
  game.hard = function() {
    var ghost = game.ghostFaller(), n = 0;
    while(!game.findCollision(ghost.moveDown())) {
      n++;
    }
    if(n > 0) {
      faller.moveDown(n);
      game.tick(300);
    }
  }



  game.restart = function() {
    game.isRunning = true;
    game.isEnded = false;

    grid.gen(settings.gridWidth, settings.gridHeight);

    pieceManager.queuePiece(3);
    faller.reFall(pieceManager.getNextPiece());


    this.tickSpeed = 1000;
    this._TID = $timeout(this.tick, 1000);
  };

  game.tick = function(withDelay) {
    var self = game;

    /* cancel any existing timeout */
    $timeout.cancel(self._TID);
    self._TID = null;

    /* stop ticking if game is paused */
    if(!self.isRunning) return false;

    /* postpone the tick? */
    if(withDelay) {
      tickAgain(withDelay);
      return false;
    }

    if(!self.down()) {
      grid.absorb(faller);

      var completeRows = grid.findCompleteRows();
      if(completeRows.length)
        grid.collapseRows(completeRows);

      faller.reFall(pieceManager.getNextPiece());

      /* No more room? Game over */
      if(self.findCollision(faller)) {
        game.isRunning = false;
        game.isEnded = true;
      }

    }

    /* if a new tick hasn't already been scheduled */
    if(!self._TID)
      tickAgain();



    function tickAgain(delay) {
      self._TID = $timeout(self.tick, delay || self.tickSpeed);
    }
  };

  game.findCollision = function(piece) {

    var pos = piece.position, points = piece.points, pt, vec;

    for(var i = 0; i < points.length; i++) {
      pt = points[i];
      vec = {x: pos.x + pt.x, y: pos.y - pt.y};
      if(vec.x < 0 || vec.x >= grid.width || vec.y >= grid.height || vec.y < 0 || grid.get(vec))
        return pt;
    }

    return false;
  };

  game.checkLanded = function() {
    if(faller.landAttempts >= 12) return; //no more chances to put off fixing the piece

    faller.aboutToFix = false;

    if(this.findCollision( this.ghostFaller().moveDown() )) {
      faller.landAttempts++;
      $timeout(function(){faller.aboutToFix = true}, 20); //yes, hacky. But animation needs to restart
      this.tick(900);
    }
  }

  game.ghostFaller = function() {
    var ghost = Object.create(faller);
    ghost.position = {x: faller.position.x, y: faller.position.y};

    return ghost;
  }

  game.pause = function() {
    game.isRunning = false;
  }
  game.resume = function() {
    game.isRunning = true;
    game.tick(game.tickSpeed);
  }



  return game;
}]);

app.factory('settings', function(){
  var settings = {};

  settings.scale = 30;
  settings.borderWidth = 1;
  settings.gridWidth = 12;
  settings.gridHeight = 20;
  settings.applyScale = function(n, neg) {
    return (n*(settings.scale + settings.borderWidth)*(neg ? -1 : 1)) + 'px';
  };

  return settings;
});

app.factory('uiState', ['gameManager', function(game){
  var ui = {};

  ui.setState = function(state) {
    if(state == "game" && game.ended) return false;

    this.state = state;
  }

  ui.setState('game');

  return ui;
}]);

app.directive('kbControl', ['$document', '$parse', function($document, $parse) {
  return {
    restrict: 'A',
    link: link,
  };

  function link(scope, element, attrs) {
    var keys = scope.$eval(attrs.kbControl);
    var timers = {};
    var enabled = true;

    enable();

    /* enable or disable these keyboard controls based on the value of the kbControlEnabled (bool) attribute */
    if('kbControlEnabled' in attrs) {
      console.log("attribute exists!");
      scope.$watch($parse(attrs.kbControlEnabled), function(newVal, oldVal){
        if(!newVal && enabled)
          disable();
        else if(newVal && !enabled)
          enable();
      });
    }

    function enable() {
      $document.on("keydown", keyDownHandler);
      $document.on("keyup", keyUpHandler);
      enabled = true;
    }

    function disable() {
      $document.off("keydown", keyDownHandler);
      $document.off("keyup", keyUpHandler);
      flushTimers();
      enabled = false;
    }

    function keyDownHandler(event) {
      var key = (event || window.event).keyCode;
      if (!(key in keys))
        return true;
      if (!(key in timers)) {
        timers[key] = null;
        var keyObj = keys[key];
        repeatAction(keyObj.fn, keyObj.repeatDelay, keyObj.initialRepeatDelay);
      }
      //////////////////////
      event.preventDefault();
      return false;
      /////////////////////
      function repeatAction(action, repeatDelay, initialRepeatDelay) {
        scope.$apply(action);

        if(!repeatDelay) return;

        var delay = initialRepeatDelay || repeatDelay;
        timers[key] = setTimeout(repeatAction.bind(null, action, repeatDelay), delay);
      }
    }

    function keyUpHandler(event) {
        var key = (event || window.event).keyCode;
        if (key in timers) {
            if (timers[key] !== null)
                clearTimeout(timers[key]);
            delete timers[key];
        }
    }

    function flushTimers() {
      for(key in timers)
        if(timers[key] !== null)
          clearTimeout(timers[key]);
      timers= {};
    }
  }
}]);

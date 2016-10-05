angular.module('tetrisGame').factory('gameManager', ['grid', 'faller', 'pieceManager', 'settings', '$document', '$timeout','$interval', function(grid, faller, pieceManager, settings, $document, $timeout, $interval){
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

    pieceManager.flushQueue().queuePiece(3);
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

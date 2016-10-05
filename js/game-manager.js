angular.module('tetrisGame').factory('gameManager', ['grid', 'faller', 'pieceManager', 'scoreManager', 'settings', '$document', '$timeout','$interval', function(grid, faller, pieceManager, score, settings, $document, $timeout, $interval){
  var game = {};

  game.isRunning = true;
  game.isEnded = false;

  game._TID = null;


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
  game.down = function(byGravity) {
    if(game.findCollision( game.ghostFaller().moveDown() ))
      return false;

    faller.moveDown();
    game.checkLanded();

    if(!byGravity)
      score.softDropped(1);


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
      score.hardDropped(n);
    }
  }



  game.restart = function() {
    game.isRunning = true;
    game.isEnded = false;

    grid.gen(settings.gridWidth, settings.gridHeight);

    pieceManager.flushQueue().queuePiece(3);
    faller.reFall(pieceManager.getNextPiece());

    score.clear();

    this.tickSpeed = 1000;
    this.tick(this.tickSpeed);
  };

  game.tick = function(withDelay) {
    var self = game;

    /* cancel any existing timeout */
    if(self._TID !== null){
      $timeout.cancel(self._TID);
      self._TID = null;
    }

    /* stop ticking if game is paused */
    if(!self.isRunning) return false;

    /* postpone the tick? */
    if(withDelay) {
      tickAgain(withDelay);
      return false;
    }

    if(!self.down(true)) { /* true indicates that motion is 'by gravity' and thus no scoring should happen */
      grid.absorb(faller);

      var completeRows = grid.findCompleteRows();
      if(completeRows.length){
        grid.collapseRows(completeRows);
        score.clearedRows(completeRows);
        /* in case the level changed, reset the tickspeed */
        self.tickSpeed = 1000*Math.pow(.7, score.level - 1);
      }
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
    if(this.findCollision( this.ghostFaller().moveDown() )) {
      faller.landAttempts++;

      /* hacky, but we need to toggle this property with a slight delay so the
      ** animation can restart. Would be nice to have a better method down the road */
      faller.aboutToFix = false;
      $timeout(function(){faller.aboutToFix = true}, 20);

      /* set a new timeout only if player is within allowed land attempts */
      if(faller.landAttempts < 13)
        this.tick(900);
    } else if(faller.aboutToFix) {
      /* faller was just about to land but is now no longer,
      ** so lets reset the timer to default tickspeed */
      this.tick(this.tickSpeed);
      faller.aboutToFix = false;
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

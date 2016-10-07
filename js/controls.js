angular.module('tetrisGame').controller('gameControls', ['$scope', 'gameManager', 'pieceManager', 'uiState', 'settings', function($scope, game, pieceManager, ui, settings) {
  /* start game when page is loaded */
  game.restart();

  $scope.ui = ui;
  $scope.game = game;

  /* functions for the pause screen */
  var pause = $scope.pause = {};
    pause.msg = function() {
      return game.isEnded ? "Game Over" : "Paused";
    }
    pause.resume = function() {
      if(game.isEnded) return;

      game.resume();
      ui.setState('game');
    };
    pause.new = function() {
      game.restart();
      ui.setState('game');
    };
    pause.settings = function() {
      /* reset the temporary settings to the actual settings */
      settings.transfer(this, newSettings);
      /* reset the temporary piece list to a copy of the actual piece list */
      tempPieceManager.pieces = pieceManager.pieceTypes.slice();

      ui.setState('game');
    }

  /* collections of functions for settings screen */
  var newSettings = $scope.newSettings = {}
    newSettings.save = function() {
      settings.transfer(newSettings, this);
      ui.setState('pause');
    }
  var tempPieceManager = $scope.tempPieceManager = Object.create(pieceManager);
    tempPieceManager.registerPiece = function(points, color, even) {
      this.pieces.push(new tempPieceManager.Piece(points, color, even));
    };
    tempPieceManager.deregisterPiece = function(index) {
      this.pieces.splice(index, 1);
    };
    tempPieceManager.updatePiece = function(index, points, color, even) {
      var piece = this.pieces[index];
      if(points)
        piece.points = points;
      if(color)
        piece.color = color;
      if(even) {
        piece.isEven = true;
        this.pivot = {x:0.5, y:-0.5};
      }
      this.topOffset = this.getTopOffset();
      this.spread = this.getSpread();
    };
    tempPieceManager.new = function() {
      pieceEditor.load(null);
      ui.setState('pieceEditor');
    };
    tempPieceManager.edit = function() {
      pieceEditor.load(this.selected);
      ui.setState('pieceEditor');
    }
    tempPieceManager.delete = function() {
      if(!this.selected)
        return alert('Select a piece first');

      this.deregisterPiece(this.selected);
    }
  /* functions for the piece editor screen */
  var pieceEditor = $scope.pieceEditor = {};
    pieceEditor.load = function(index) {
      /* create new empty even grid */
      this.grid = new Array(8).fill(null).map(function(){
        return new Array(8).fill(false);
      });
      /* setup default color selections */
      this.colorType = 'predefined';
      this.color = 'red';

      /* fill the grid and load color if editing an existing piece */
      this.curPieceIndex = index || null;
      if(this.curPieceIndex) {
        var piece = tempPieceManager[this.curPieceIndex];
        /* turn on the grid points corresponding to each block of the piece */
        piece.points.forEach(function(pt)) {
          this.gridToggle({x:vec.x + 3, y:-vec.y + 3});
        }
        this.hasOddGrid = !piece.isEven;
        if(this.hasOddGrid)
          this.toggleOddGrid();
        /* setup color */
        if(['red','lime','cyan','blue','yellow','purple','orange'].indexOf(piece.color) != -1) {
          this.color = piece.color;
        } else {
          this.colorType = 'custom';
          this.color = piece.color;
        }

      }
    };
    pieceEditor.gridToggle = function(vec){
      this.grid[vec.y][vec.x] = !this.grid[vec.y][vec.x];
    }
    pieceEditor.toggleOddGrid = function(){
      if(this.hasOddGrid) {
        /* change to even */
        this.hasOddGrid = false;
        this.grid.forEach(function(row){
          row.push(false);
        });
        this.grid.push(new Array(8).fill(false));
      } else {
        /* change to odd */
        this.hasOddGrid = true;
        this.grid.pop();
        this.grid.forEach(function(row){
          row.pop();
        });
      }
    }






  /* watch to see if the game ends, and if so trigger the pause screen */
  $scope.$watch(function(){return game.isEnded}, function(newVal, oldVal){
    if(newVal && ui.state == 'game')
      ui.setState('pause');
  });


}]);

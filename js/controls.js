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
      settings.transfer(settings,/* => */ newSettings);

      /* reset the temporary piece list to a copy of the actual piece list */
      tempPieceManager.pieces = pieceManager.pieceTypes.slice();

      ui.setState('settings');
    }
    pause.kb = {27: {fn: pause.resume}};



  /* collections of functions for settings screen */
  var newSettings = $scope.newSettings = {}
    newSettings.save = function() {
      settings.transfer(newSettings, settings);
      pieceManager.pieceTypes = tempPieceManager.pieces;
      ui.setState('pause');
    }
    newSettings.kb = {27: {fn: function(){ui.setState('pause')}}};

  var tempPieceManager = $scope.tempPieceManager = Object.create(pieceManager);
    tempPieceManager.registerPiece = function(points, color, even) {
      this.pieces.push(new tempPieceManager.Piece(points, color, even));
    };
    tempPieceManager.deregisterPiece = function(index) {
      this.pieces.splice(index, 1);
    };
    tempPieceManager.updatePiece = function(index, points, color, even) {
      var piece = this.pieces[index];
      piece.updateProps(points, color, even);
    };
    tempPieceManager.new = function() {
      pieceEditor.load(null);
      ui.setState('pieceEditor');
    };
    tempPieceManager.edit = function() {
      if(this.selected == null)
        return alert('Select a piece first');

      pieceEditor.load(this.selected);
      ui.setState('pieceEditor');
    }
    tempPieceManager.delete = function() {
      if(this.selected == null)
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
      this.hasOddGrid = false;

      /* setup default color selections */
      this.colorType = 'predefined';
      this.preColor = 'red';
      this.custColor = 'rgb(255,0,0)';

      /* fill the grid and load color if editing an existing piece */
      this.curPieceIndex = index;

      if(this.curPieceIndex !== null) {
        var piece = tempPieceManager.pieces[this.curPieceIndex];
        /* turn on the grid points corresponding to each block of the piece */
        piece.points.forEach(function(pt){
          pieceEditor.gridToggle({x:pt.x + 3, y:3 - pt.y});
        });
        console.log(pieceEditor.grid);

        if(!piece.isEven){
          this.toggleOddGrid();
        }
        /* setup color */
        if(['red','lime','cyan','blue','yellow','purple','orange'].indexOf(piece.color) != -1) {
          this.preColor = piece.color;
        } else {
          this.colorType = 'custom';
          this.custColor = piece.color;
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
    pieceEditor.save = function(){
      var points = [];
      var color = this.colorType == 'custom' ? this.custColor : this.preColor;
      var even = !this.hasOddGrid;

      for(var y = 0; y < this.grid.length; y++){
        for(var x = 0; x < this.grid[0].length; x++){
          if(this.grid[y][x]) points.push({x:x - 3, y:3 - y});
        }
      }

      if(this.curPieceIndex !== null){
        tempPieceManager.updatePiece(this.curPieceIndex, points, color, even);
      } else {
        tempPieceManager.registerPiece(points, color, even);
      }

      ui.setState('settings');
    };
    pieceEditor.getColor = function(on) {
      if(on) {
        return {background: this.colorType == 'custom' ? this.custColor : this.preColor}
      }
    }
    pieceEditor.kb = {27: {fn: function(){ui.setState('settings')}}};






  /* watch to see if the game ends, and if so trigger the pause screen */
  $scope.$watch(function(){return game.isEnded}, function(newVal, oldVal){
    if(newVal && ui.state == 'game')
      ui.setState('pause');
  });


}]);

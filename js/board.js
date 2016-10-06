angular.module('tetrisGame').controller('gridController', ['$scope', 'grid', 'settings', 'gameManager', '$timeout', function($scope, modelGrid, settings, game, $timeout) {
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
    //console.log("BGGrid:",$scope.BGGrid);
  }

  /* If modelGrid was regenerated, we need to regenerate the viewGrid and BGGrid */
  $scope.$on('grid:new', function(e){
    setupBGGrid();
    setupViewGrid();
  });

  /* update row positions in viewGrid when rows are cleared */
  $scope.$on('grid:rowsCollapsed', function(e, collapsedRows){
    $scope.viewGrid.forEach(function(row){
      /* Loop through all rows to find new positions
      ** start from the current position to save time */
      for(var i = 0, j = row.pos, l = modelGrid.height; i < l; i++, j = ++j % l) {
	      if(row.cells === modelGrid.content[j]) {
          var newPos = j;
          break;
        }
      }
      if(newPos === "undefined") /* in case something goes wrong */
        throw "unable to identify new position; row removed";

      /* if this row in the collapsedRows array, set prop "justCleared" to true */
      if(collapsedRows.indexOf(row.pos) != -1) {
        row.justCleared = true;
      } else {
        row.justCleared = false;
      }

      row.pos = newPos;
    });
  });

}]);

/***************************************************************
****************************************************************/

angular.module('tetrisGame').controller('fallerController', ['$scope', 'faller','gameManager', 'settings', 'uiState', '$document', function($scope, faller, game, settings, ui, $document){
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
    },
    72: {
      fn: game.hold
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

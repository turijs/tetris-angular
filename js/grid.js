angular.module('tetrisGame').factory('grid', ['$rootScope', function($rootScope){
  var grid = {};
  grid.id = -1;

  grid.gen = function(width, height) {
    this.width = +width;
    this.height = +height;
    this.id++;

    this.content = new Array(grid.height).fill(null).map(function(){
      return new Array(grid.width).fill(null);
    });

    $rootScope.$broadcast('grid:new');
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
    $rootScope.$broadcast('grid:rowsCollapsed', rows);
  };

  grid.gen(12, 20);

  // console.log(grid.content);

  return grid;
}]);

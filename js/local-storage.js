/* this service handles all getting/setting of local storage data */
angular.module('tetrisGame').factory('storageManager', ['settings', 'pieceManager', 'scoreManager', function(settings, pieceManager, score){
  var available = function lsTest(){
    var test = 'test';
    try {
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch(e) {
        return false;
    }
  }();

  var storage = {};

  storage.saveSettings = function() {
    if(!available) return;

    localStorage.setItem('scale', settings.scale.toString());
    localStorage.setItem('gridHeight', settings.gridHeight.toString());
    localStorage.setItem('gridWidth', settings.gridWidth.toString());

    /* first convert piece list to a more compact format */
    var pieces = [];
    pieceManager.pieceTypes.forEach(function(piece){
      pieces.push({
        points: piece.points,
        color: piece.color,
        even: piece.isEven
      });
    });

    localStorage.setItem('pieces', JSON.stringify(pieces));
  }

  storage.saveHighscore = function() {
    if(!available) return;

    localStorage.setItem('highscore', score.high.toString());
  }

  function retrieve() {
    var scale = localStorage.getItem('scale');
    var gridHeight = localStorage.getItem('gridHeight');
    var gridWidth = localStorage.getItem('gridWidth')
    var pieces = localStorage.getItem('pieces');
    var highscore = localStorage.getItem('highscore');

    if(scale)
      settings.scale = +scale;

    if(gridHeight)
      settings.gridHeight = +gridHeight;

    if(gridWidth)
      settings.gridWidth = +gridWidth;

    if(highscore)
      score.high = +highscore;

    if(pieces) {
      try {
        pieces = JSON.parse(pieces);
        /* convert back into full pieces */
        pieceTypes = pieces.map(function(piece){
          return new pieceManager.Piece(piece.points, piece.color, piece.even);
        });
      } catch(e) {
        console.log(e);
        return; /* leave the pieces be... */
      }
      pieceManager.pieceTypes = pieceTypes;
    }
  }
  if(available)
    retrieve();

  return storage;
}]);

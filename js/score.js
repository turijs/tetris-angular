angular.module('tetrisGame').factory('scoreManager', [function(){
  var score = {};

  score.clear = function() {
    this.score = 0;
    this.level = 1;
    this.totalRows = 0;
  }

  score.clearedRows = function(rows) {
    var n = rows.length;
    this.totalRows += n;
    var scoreToAdd = n*100;

    /* bonuses */
    if(n = 3)
      score += 100;
    else if(n >= 4)
      score += 400;

    this.score += scoreToAdd*this.level;

    if(this.totalRows % 1 == 0)
      this.level++;
  }

  score.softDropped = function(n) {
    this.score += n*this.level;
  }

  score.hardDropped = function(n) {
    this.score += n*2*this.level;
  }

  return score;
}]);

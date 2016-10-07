angular.module('tetrisGame').factory('scoreManager', [function(){
  var score = {};
  /* storageManager will try to retrieve highscore, for now set to 0 */
  score.high = 0;

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

    this.addScore(scoreToAdd);

    if(this.totalRows >= this.level*12)
      this.level++;
  }

  score.softDropped = function(n) {
    this.addScore(n);
  }

  score.hardDropped = function(n) {
    this.addScore(2*n);
  }

  score.addScore = function(score) {
    this.score += score*this.level;
    /* update highscore if necessary */
    if(this.score > this.high) this.high = this.score;
  }

  return score;
}]);

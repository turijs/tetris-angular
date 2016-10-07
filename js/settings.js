angular.module('tetrisGame').factory('settings', function(){
  var settings = {};

  settings.scale = 30;
  settings.borderWidth = 1;
  settings.gridWidth = 12;
  settings.gridHeight = 20;

  settings.applyScale = function(n, neg) {
    return (n*(settings.scale + settings.borderWidth)*(neg ? -1 : 1)) + 'px';
  };

  settings.transfer = function(fromObj, toObj) {
    toObj.scale = Math.round(fromObj.scale);
    toObj.gridWidth = Math.round(fromObj.gridWidth);
    toObj.gridHeight = Math.round(fromObj.gridHeight);
  }

  return settings;
});

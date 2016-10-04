angular.module('tetrisGame').factory('settings', function(){
  var settings = {};

  settings.scale = 30;
  settings.borderWidth = 1;
  settings.gridWidth = 12;
  settings.gridHeight = 20;
  settings.applyScale = function(n, neg) {
    return (n*(settings.scale + settings.borderWidth)*(neg ? -1 : 1)) + 'px';
  };

  return settings;
});

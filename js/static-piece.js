angular.module('tetrisGame').directive('piece', function(){
  return {
    restrict: 'E',
    scope: {
      points: '=',
      color: '=',
      scale: '='
    },
    replace: true,
    template: '<div class="static-piece" ng-style="getPieceStyle()">'+
                '<div ng-repeat="point in points" ng-style="getBlockStyle(point)">'+
              '</div>',
    link: function(scope) {
      if(!scope.scale) scope.scale = 30;

      var minX, maxX, minY, maxY;
      updateMinMaxVals();

      /* if the shape of the piece changes, update our saved min and max values */
      scope.$watchCollection('points', function(){
        updateMinMaxVals();
      });

      function applyScale(n) {
        return n * (scope.scale + 1);
      }
      /* for the piece "wrapper" */
      scope.getPieceStyle = function() {
        return {
          width: (applyScale(maxX - minX + 1) - 1) + 'px',
          height: (applyScale(maxY - minY + 1) - 1) + 'px',
        };
      };
      /* for the individual blocks that make up the piece */
      scope.getBlockStyle = function(point) {
        return {
          background: scope.color,
          position: 'absolute',
          bottom: applyScale(point.y - minY) + 'px',
          left: applyScale(point.x - minX) + 'px',
          width: scope.scale + 'px',
          height: scope.scale + 'px'
        }
      };

      function updateMinMaxVals() {
        minX = Math.min.apply(null, scope.points.map(function(point){
          return point.x;
        }));
        maxX = Math.max.apply(null, scope.points.map(function(point){
          return point.x;
        }));
        minY = Math.min.apply(null, scope.points.map(function(point){
          return point.y;
        }));
        maxY = Math.max.apply(null, scope.points.map(function(point){
          return point.y;
        }));
      }

    }
  }
});

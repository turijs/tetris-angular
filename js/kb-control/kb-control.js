angular.module('kb-control', [])
  .directive('kbControl', ['$document', '$parse', function($document, $parse) {
    return {
      restrict: 'A',
      link: link,
    };

    function link(scope, element, attrs) {
      var keys = scope.$eval(attrs.kbControl);
      var timers = {};
      var enabled = true;

      enable();

      /* enable or disable these keyboard controls based on the value of the kbControlEnabled (bool) attribute */
      if('kbControlEnabled' in attrs) {
        //console.log("attribute exists!");
        scope.$watch($parse(attrs.kbControlEnabled), function(newVal, oldVal){
          if(!newVal && enabled)
            disable();
          else if(newVal && !enabled)
            enable();
        });
      }

      function enable() {
        $document.on("keydown", keyDownHandler);
        $document.on("keyup", keyUpHandler);
        enabled = true;
      }

      function disable() {
        $document.off("keydown", keyDownHandler);
        $document.off("keyup", keyUpHandler);
        flushTimers();
        enabled = false;
      }

      function keyDownHandler(event) {
        var key = (event || window.event).keyCode;
        if (!(key in keys))
          return true;
        if (!(key in timers)) {
          timers[key] = null;
          var keyObj = keys[key];
          repeatAction(keyObj.fn, keyObj.repeatDelay, keyObj.initialRepeatDelay);
        }
        //////////////////////
        event.preventDefault();
        return false;
        /////////////////////
        function repeatAction(action, repeatDelay, initialRepeatDelay) {
          scope.$apply(function(){
            action();
          });

          if(!repeatDelay) return;

          var delay = initialRepeatDelay || repeatDelay;
          timers[key] = setTimeout(repeatAction.bind(null, action, repeatDelay), delay);
        }
      }

      function keyUpHandler(event) {
          var key = (event || window.event).keyCode;
          if (key in timers) {
              if (timers[key] !== null)
                  clearTimeout(timers[key]);
              delete timers[key];
          }
      }

      function flushTimers() {
        for(key in timers)
          if(timers[key] !== null)
            clearTimeout(timers[key]);
        timers= {};
      }
    }//function link
}]);

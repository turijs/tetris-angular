angular.module('tetrisGame', ['ngAnimate', 'kb-control', 'color.picker'])
  .config(['$animateProvider', function($animateProvider) {
    $animateProvider.classNameFilter(/_anim/);
  }])

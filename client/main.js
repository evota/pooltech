import angular from 'angular';
import angularMeteor from 'angular-meteor';
import poolTestList from '../imports/components/poolTestList/poolTest';
import testResult from '../imports/components/testResult/testResult';
import shoppingList from '../imports/components/shoppingList/shoppingList';
import navigation from '../imports/components/navigation/navigation';
import swimmingPool from '../imports/components/swimmingPool/swimmingPool';
import '../imports/startup/accounts-config.js';
import ngMessages from 'angular-messages';
import uiRouter from 'angular-ui-router';
import ngMaterial from 'angular-material';

angular.module('pool-tech', [
		angularMeteor,
		poolTestList.name,
		testResult.name,
		navigation.name,
		shoppingList.name,
		swimmingPool.name,
		'accounts.ui',
		'ngMaterial',
		'ngMessages',
		uiRouter
])
 	.config(config)
	.controller('MainController', controller)

function controller($scope, $timeout, $mdSidenav){
	$scope.toggleSidenav = function(menuId){
		$mdSidenav(menuId).toggle();
	}
}
function config($locationProvider, $stateProvider, $urlRouterProvider,$mdThemingProvider){
	'ngInject';
	$locationProvider.html5Mode(true);
	$mdThemingProvider.theme('default')
		.primaryPalette('blue')
		.accentPalette('indigo');
	$stateProvider
		.state( 'poolTestList', {
			url: '/pooltests',
			template: '<pool-test-list></pool-test-list>'
		})
		.state( 'testResult', {
			url: '/testresult',
			template: '<test-result></test-result>'
		})
		.state( 'testDetail', {
			url: '/testresult/:testResultId',
			template: '<test-detail></test-detail>'
		})
		.state( 'shoppingList', {
			url: '/shoppinglist',
			template: '<shopping-list></shopping-list>'
		})
		.state( 'swimmingPool', {
			url: '/swimmingPool',
			template: '<swimming-pool></swimming-pool>'
		})
		.state( 'swimmingPoolDetail', {
			url: '/swimmingPool/:poolId',
			template: '<swimming-pool-detail></swimming-pool-detail>'
		})
	$urlRouterProvider.otherwise('/');
  }

function onReady() {
	angular.bootstrap(document, ['pool-tech']);
}

if (Meteor.isCordova) {
	angular.element(document).on('deviceready', onReady);
} else {
	angular.element(document).ready(onReady);
}

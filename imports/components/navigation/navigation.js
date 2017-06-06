import angular from 'angular';
import angularMeteor from 'angular-meteor';
import ngMaterial from 'angular-material';
import template from './navigation.html';
import poolTestList from '/imports/components/poolTestList/poolTest';
import testResult from '/imports/components/testResult/testResult';
import shoppingList from '/imports/components/shoppingList/shoppingList';
import swimmingPool from '/imports/components/swimmingPool/swimmingPool';



class NavigationController{
	 AppCtrl($scope) {
      $scope.currentNavItem = 'Home';
 	}
}
export default angular.module('navigation', [
	angularMeteor
])
	.component('navigation',{
		templateUrl: 'imports/components/navigation/navigation.html',
		controller: ['$scope', NavigationController]
	});
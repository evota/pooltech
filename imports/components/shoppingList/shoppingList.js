import angular from 'angular';
import angularMeteor from 'angular-meteor';
import ngMaterial from 'angular-material';
import { Meteor } from 'meteor/meteor';
import { ShoppingList } from '../../api/shoppingList.js';
import template from './shoppingList.html';
import uiRouter from 'angular-ui-router';


class ShoppingListController{
	constructor($scope, $stateParams, $state) {
		'ngInject';
		$scope.viewModel(this);
		this.$state = $state;
		this.subscribe('shoppingList');
		this.item = {};
		this.helpers({
			shoppingList(){
				return ShoppingList.find();
			}
		})
	}
	modifyItem(item){
		if (item._id){
			Meteor.call("shoppingList.update", item);
		} else {
			Meteor.call("shoppingList.insert", item);
		}
	}
	removeItem(itemId){
		Meteor.call("shoppingList.remove", itemId);
	}
	togglePurchased(item){
		this.modifyItem(item);
	}
}

export default angular.module('shoppingList', [
	angularMeteor,
	uiRouter
])
	.component('shoppingList',{
		templateUrl: 'imports/components/shoppingList/shoppingList.html',
		controller: ['$scope', '$stateParams', '$state', ShoppingListController]
	});

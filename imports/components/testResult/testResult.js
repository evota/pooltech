import angular from 'angular';
import angularMeteor from 'angular-meteor';
import ngMaterial from 'angular-material';
import ngMessages from 'angular-messages';
import { Meteor } from 'meteor/meteor';
import { TestResults } from '../../api/testResults.js';
import { SwimmingPools} from '../../api/swimmingPool.js';
import template from './testResult.html';
import detailtemplate from './testDetail.html'
import uiRouter from 'angular-ui-router';


class TestResultController {
	constructor($scope, $stateParams, $state, $filter) {
		'ngInject';
		$scope.viewModel(this);
		this.$state = $state;
		this.$filter = $filter;
		this.subscribe('testResults');
		this.subscribe('swimmingPools');
		this.testResult = {};
		this.lastResult = {};
		this.isNew = true;
		this.numDrops = Array.from(Array(51).keys());
		if ($stateParams.testResultId){
			this.testResult = this.editResult($stateParams.testResultId);
		}else{
			this.testResult = {};
		}	
		this.showNumberOfDays = -1;
		this.displayedRecords = 0;
		this.helpers({
			testResults() {
				const selector = {};
				selector.owner = {
					$eq: Meteor.userId()
				}
				if (this.getReactively('showNumberOfDays') > 0) {
					dateFrom = new Date();
					dateFrom.setDate(dateFrom.getDate() - this.showNumberOfDays);
					selector.datetime = {
						$gte: new Date(dateFrom)
					};
				}
				this.displayedRecords = TestResults.find(selector, {}).count();
				return TestResults.find(selector, {
					sort: {
						datetime: -1
					}
				});
			},
			totalRecordCount() {
				return TestResults.find({"owner": Meteor.userId()}).count();
			},
			currentUser() {
				return Meteor.user();
			},
			swimmingPools() {
				return SwimmingPools.find({"owner": Meteor.userId()});
			}
		})
	}
	getPoolLastResult(poolId){
		const selector = {};
		selector.owner = { $eq: Meteor.userId()};
		selector.poolId = { $eq: poolId };
		this.lastResult = TestResults.findOne(selector, {sort: {datetime: -1}});
	}
	getPoolDetails(poolId) {
		return this.$filter('filter')(this.swimmingPools, {'_id': poolId});
	}
	calculateChlorine(testResult){
		let pool = this.getPoolDetails(testResult.poolId);
		let diff = testResult.freeChlorine - pool.targets.fac;
		return diff * (pool.size/10000)*10.7;
	}
	
	setNumberOfDays(days){
		this.showNumberOfDays = days;
	}
	modifyTestResult(testResult) {
		if ( !testResult._id ) {
			Meteor.call('testResults.insert', testResult);
		} else {
			Meteor.call('testResults.update', testResult);
		}
		this.$state.go('testResult');
	}
	editResult(id){
		let result = TestResults.findOne({"_id": id});
		if (result){
			this.isNew = false;
			this.facNumberOfDrops = result.freeChlorine / .5;
			this.ccNumberOfDrops = result.combinedChlorine / .5;
			this.taNumberOfDrops = result.totalAlkalinity / 10;
			this.chNumberOfDrops = result.calciumHardness / 25;
			return result;
		}else{
			console.log('Could not load ID ' + id);
		}
	}
	initResult(){
		this.isNew = true;
		this.testResult = {};
		this.facNumberOfDrops = 0;
		this.ccNumberOfDrops = 0;
		this.taNumberOfDrops = 0;
		this.chNumberOfDrops = 0;
		this.testResult.datetime = new Date();
		$state.go('testDetail({testResult._id})');
	}
	removeResult(result){
/*		this.confirm = $mdDialog.confirm()
			.title('Confirm Delete')
			.textContent('Are you sure you want to delete the result from {{result.datetime}}')
			.ariaLabel('Delete Confirmation')
			.targetEvent()
			.ok('Yes please')
			.cancel('No thanks');
			$mdDialog.show(this.confirm);
*/		
		Meteor.call('testResults.remove', result._id);
	}
}

export default angular.module('testResult', [
	angularMeteor,
	uiRouter
])
	.component('testResult',{
		templateUrl: 'imports/components/testResult/testResult.html',
		controller: ['$scope', '$stateParams', '$state', '$filter', TestResultController]
	})
	.component('testDetail', {
		templateUrl: detailtemplate,
		controller: ['$scope', '$stateParams', '$state', '$filter', TestResultController]
	});

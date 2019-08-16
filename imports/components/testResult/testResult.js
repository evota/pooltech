import angular from 'angular';
import angularMeteor from 'angular-meteor';
import ngMaterial from 'angular-material';
import ngMessages from 'angular-messages';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { TestResults } from '../../api/testResults.js';
import { SwimmingPools} from '../../api/swimmingPool.js';
import template from './testResult.html';
import detailtemplate from './testDetail.html'
import uiRouter from 'angular-ui-router';
import { isUndefined } from 'util';

class TestResultController {
	constructor($scope, $stateParams, $state, $filter, $mdDialog) {
		'ngInject';
		$scope.viewModel(this);
		this.$mdDialog = $mdDialog;
		this.$state = $state;
		this.$filter = $filter;
		this.subscribe('testResults');
		this.subscribe('swimmingPools');
		this.testResult = {};
		this.lastResult = {};
		this.chemMaint = {};
		this.poolTargets = {};
		this.isNew = true;
		this.showBalance = false
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
					let dateFrom = new Date();
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
	getPoolDetails(poolId) {
		const selector = {};
		selector.owner = { $eq: Meteor.userId()};
		selector._id = { $eq: poolId };
		let poolDetail = SwimmingPools.findOne(selector);
		this.poolTargets = poolDetail.targets;
		return poolDetail;
	}
	getPoolLastResult(poolId){
		const selector = {};
		selector.owner = { $eq: Meteor.userId()};
		selector.poolId = { $eq: poolId };
		this.lastResult = TestResults.findOne(selector, {sort: {datetime: -1}});
	}
	calculateChemicals(testResult){
		if (testResult!==undefined){
			//Get Pool Information
			let pool = this.getPoolDetails(testResult.poolId);
			if (pool !== undefined){
				let targets = pool.targets;
				let poolSize = pool.size;
				this.chemMaint.chlorine = this.calculateChlorine(testResult.freeChlorine, targets.fac, poolSize);
				this.chemMaint.muriaticAcid = this.calculateAcid(testResult.ph, testResult.totalAlkalinity, targets.ph, poolSize);
				this.chemMaint.bakingSoda = this.calculateBakingSoda(testResult.totalAlkalinity, targets.ta, poolSize);
				this.chemMaint.calciumCarbonate = this.calculateCalcium(testResult.calciumHardness, targets.ch, poolSize);
			}else{
				this.chemMaint.chlorine = 0;
				this.chemMaint.muriaticAcid = 0;
				this.chemMaint.bakingSoda = 0;
				this.chemMaint.calciumCarbonate = 0;
			}	
			if (this.showBalance ? this.showBalance = false : this.showBalance = true);
		}
	}
	calculateChlorine(currentFac, targetFac, poolSize){
		/*PoolMath Calculation for Chlorine:  
		Target - Current * Gallons/ ((75.71 * clPercent + 0.746 * clPercent * clPercent) * ( if clPercent > 9 then (1.02 -0.008 * clPercent) else 1))*/
		let diff = targetFac - currentFac;
		return diff * poolSize / ((75.71 * 12 + 0.746 * 12 * 12) * (1.02 - 0.008 * 12));
	}
	calculateAcid(currentPh, currentTa, targetPh, poolSize){
		/*Pool Math calculation for PH lowering
		var mamul = [2.0, 1.11111, 1.0, .909091, 2.16897, 1.08448]; used for the level of acid, the kind I use = 1
		get delta (target - current)*poolSize
		(average)?temp = (current + target) / 2  
		adjustment = (192.1626 + -60.1221 * temp + 6.0752 * temp * temp + 09.1943 * temp * temp * temp ) * (totalAlkilinity + 13.91) / 114.6
		extra (if we use Borates) = (-5.476259 + 2.414292 * temp + -0.355882 * temp * temp + 0.01755 * temp * temp * temp) + BORATES
		extra = extra*delta;
		delta = delta * adj
		acid = (delta/ -240.15 * 1) + ( extra / -240.15 * 1 )	
		*/
		let diff = targetPh - currentPh;
		diff *= poolSize;
		let average = (targetPh + currentPh) / 2;

		let adjustment = (192.1626 + -60.1221 * average 
							+ 6.0752 * average * average 
							+ -0.1943 * average * average * average) * (currentTa + 13.91) / 114.6;
		let delta = (diff * adjustment)
		return ( delta / -240.15 * 1 );
	}
	calculateBakingSoda(currentTa, targetTa, poolSize){
		/* var temp;
                // Baking soda
                temp = (parseInt(document.F.TAto.value) -
                        parseInt(document.F.TAfrom.value)) *
                    GetGallons() / 4259.15;
                document.F.TAoz.value = PutWeight(temp);
                document.F.TAvol.value = PutVolume(temp * 0.7988);
            } else document.F.TAoz.value = document.F.TAvol.value = 0;

		*/
		let diff = targetTa - currentTa;
		let adjustment = diff * poolSize / 4259.15;
		return adjustment * 0.7988;
	}
	calculateCalcium(currentCh, targetCh, poolSize){
		let diff = targetCh - currentCh;
		let adjustment = diff * poolSize / 6754.11;
		return adjustment * 0.7988;
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
		const selector = {};
		selector.owner = { $eq: Meteor.userId()};
		selector._id = { $eq: id };
		let result = TestResults.findOne(selector);
		
		/*let newObjectId = new Mongo.Collection.ObjectID();
		newObjectId._str = id;
		let result = TestResults.findOne({_id: newObjectId._str});
		*/
		
		
		if (result) {
			this.isNew = false;
			this.facNumberOfDrops = result.freeChlorine / .5;
			this.ccNumberOfDrops = result.combinedChlorine / .5;
			this.taNumberOfDrops = result.totalAlkalinity / 10;
			this.chNumberOfDrops = result.calciumHardness / 25;
			//this.calculateChemicals(result);
			return result;
		} else {
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
		this.$state.go('testDetail({testResult._id})');
	}
	removeResult(result){
		Meteor.call('testResults.remove', result._id);
		this.$state.go('testResult');
	
	}
	confirmDelete(result){
		let confirm = this.$mdDialog.confirm()
		.title('Delete Confirmation')
		.textContent('Are you sure you want to delete?')
		.ariaLabel('Confirmation Modal')
		.ok('Yes I do')
		.cancel('No');
		this.$mdDialog.show(confirm).then(this.$bindToContext(()=> {this.removeResult(result)}), function(){console.log('No delete')});
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
		controller: ['$scope', '$stateParams', '$state', '$filter', '$mdDialog', TestResultController]
	});

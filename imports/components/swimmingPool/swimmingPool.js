import angular from 'angular';
import angularMeteor from 'angular-meteor';
import ngMaterial from 'angular-material';
import { Meteor } from 'meteor/meteor';
import { SwimmingPools } from '../../api/swimmingPool.js';
import template from './swimmingPool.html';
import poolDetail from './swimmingPoolDetail.html'; 
import uiRouter from 'angular-ui-router';
import poolTestList from '../../components/poolTestList/poolTest.js';


class SwimmingPoolController{
	constructor($scope, $stateParams, $state) {
		'ngInject';
		$scope.viewModel(this);
		this.$state = $state;
		this.subscribe('swimmingPools');
		if ($stateParams.poolId){
			this.pool = this.editPool($stateParams.poolId);
		}else{
			this.pool = {};
		}	
		this.states = ('AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS ' +
		            'MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI ' +
		            'WY').split(' ').map(function (state) { return { abbrev: state }; });
		this.poolSurfaces = ["Plaster", "Vinyl", "Fiberglass"];
		this.chlorineTypes = ["Chlorine", "Trichlor", "SaltWater"];
		this.poolTests = 			this.poolTests = [
			{
			"id": "fac",
			"minLevel": 0,
			"maxLevel": 7,
			"idealLevel": 4,
			"increment": 1,				
			"name": "Free Available Chlorine (FAC)",
			"description": "Maintaining an appropriate FC level is the most important part of keeping your water in balance. It is important that you do not allow FC to get too low, or you run the risk of getting algae. If FC gets down to zero, or you have algae, the pool is not safe to swim in.  Free chlorine shows the level of disinfecting chlorine available (active plus reserve) to keep your pool sanitary. FC should be tested, and chlorine added daily. If you have an automatic feeder or SWG, you can test it every couple of days. FC is consumed by sunlight, and by breaking down organic material in your pool. The level of FC you need to maintain depends on your CYA level and how much you use the pool. See the Chlorine / CYA Chart for guidelines on the appropriate FC level to maintain based on your CYA level.  Recommended ways to raise FC include: household bleach, liquid chlorine, and salt water chlorine generators (SWG).",
			"howTo": [	"1. Fill the Chlorine Only graduated cynlinder to 10ml with pool water.",
				 		"2. Add one heaping scoop of the R-0870 powder.",
						"3. Add R-00871 one drop at a time and record number of drops.",
				 		"4. Keep result for use in combined chlorine test."]
			},
			{
			"id": "cc",
			"minLevel": 0,
			"maxLevel": 1,
			"idealLevel": .5,
			"increment": .5,				
			"name": "Combined Chlorine (CC)",
			"description":	"Combined chlorine is an intermediate breakdown product created in the process of sanitizing the pool. CC causes the 'chlorine' smell many people associate with chlorine pools. If CC is above 0.5, you should SLAM your pool. CC indicates that there is something in the water that the FC is in the process of breaking down. In an outdoor pool, CC will normally stay at or near zero as long as you maintain an appropriate FC level and the pool gets some direct sunlight.  Potassium monopersulfate (a common non-chlorine shock) will show up on FAS-DPD chlorine tests as CC. There is a special reagent you can get to neutralize the potassium monopersulfate so you can get a true CC reading.",
			"howTo": [	"1. Using the sample from the free available chlorine test, add 5 drops of R-0003.",
						"2. If it remains clear, you have no combined chlorine (this is good).",
						"3. If it turns pink, add R-0871 one drop at a time until it turns clear and record number of drops"]
			},
			{
			"id": "ph",
			"minLevel": 7.0,
			"maxLevel": 7.8,
			"idealLevel": 7.5,
			"increment": .1,
			"name": "PH Level",
			"description":	"PH indicates how acidic or basic the water is. PH should be tested daily at first. Once you gain experience with your pool, less frequent monitoring may be appropriate, depending on your pool's typical rate of PH change. A PH level of 7.7 and 7.8 is ideal, but really anything between 7.5 and 7.8 is doing fine, while levels between 7.2 and 8.0 are acceptable for swimming.  PH levels below 7.2 tend to make eyes sting or burn. PH below 6.8 can cause damage to metal parts, particularly pool heaters with copper heat exchange coils. High PH can lead to calcium scaling.  Many pools will drift up towards higher PH over time. This is particularly true for fresh plaster (particularly in the first month and continuing for perhaps a year) or when TA is high and the water is being aerated (because of a spa, waterfall, fountain, SWG, rain, kids splashing in the pool, etc).  For lowering PH use either muriatic acid (preferred) or dry acid. To raise PH use borax or soda ash.",
			"howTo": [	"1.  Fill PH test tube to top of line.",
						"2.  Add 5 drops of R-0014 and mix.",
						"3.  Holding the PH tube to the sky, record the PH level closest to the color of the solution."]
			},
			{
			"id": "ta",
			"minLevel": 50,
			"maxLevel": 150,
			"idealLevel": 80,
			"increment": 10,				
			"name": "Total Alkalinity (TA)",
			"description":	"Total alkalinity indicates the water's ability to buffer PH changes. Buffering means you need to use a larger quantity of a chemical to change the PH. At low TA levels, the PH tends to swing around wildly. At high TA levels, the PH tends to drift up.  You can raise TA with baking soda. It is often best to make large TA adjustments in a couple of steps, testing the water after each one, as adding large quantities of baking soda can raise the PH a little and you don't want the PH going out of range. If you need to lower your TA level, see How To Lower Total Alkalinity.",
			"howTo": [	"1.  Rinse and fill clear plastic cynlinder to the 25 ml mark.",
						"2.  Add 2 drops of R-0007 and mix.",
						"3.  Add 5 drops of R-0008 and mix. Solution should turn green.",
						"4.  Add R-0009 one drop at a time.  Wipe the tip of the bottle after every drop with a damp cloth.  Continue until the solution turns red.  Record number of drops"]
			},
			{
			"id": "ch",
			"minLevel": 100,
			"maxLevel": 350,
			"idealLevel": 250,
			"increment": 10,				
			"name": "Calcium Hardness (CH)",
			"description":	"Calcium hardness indicates the amount of calcium in the water. Over time, water with low calcium levels will tend to dissolve calcium out of plaster, pebble, tile, stone, concrete, and to some extent fiberglass surfaces. You can prevent this from happening by keeping the water saturated with calcium. In a vinyl liner pool there is no need for calcium, though high levels can still cause problems. A plaster pool without a SWG should have CH levels between 250 and 350 if possible. With a SWG, CH should be kept between 350 to 450. Calcium helps fiberglass pools resist staining and cobalt spotting. If you have a spa you might want to keep CH at at least 100 to 150 to reduce foaming.  You increase CH with calcium chloride, sold as a deicer and by pool stores, or calcium chloride dihydrate, sold by pools stores for increasing calcium. You lower calcium by replacing water or using a reverse osmosis water treatment.",
			"howTo": [	"1.  Rinse and fill clear plastic cynlinder to the 10 ml mark.",
						"2.  Add 10 drops of R-0010 and mix.",
						"3.  Add 3 drops of R-0011L and mix.  Solution should turn red if there is calcium present.",
						"4.  Add R-0012 one drop at a time until the color changes to blue.  Record number of drops."]
			},
			{
			"id": "cya",
			"minLevel": 30,
			"maxLevel": 50,
			"idealLevel": 40,
			"increment": 10,
			"name": "Cyanuric Acid (CYA)",
			"description":	"Cyanuric acid, often called stabilizer or conditioner, both protects FC from sunlight and lowers the effective strength of the FC (by holding some of the FC in reserve). The higher your CYA level, the more FC you need to use to get the same effect. It is important to know your CYA level so you can figure out what FC level to aim for. If you don't have a SWG, CYA is typically kept between 30 and 50. If you have a SWG, CYA is typically kept between 70 and 80. You increase CYA by adding cyanuric acid, often sold as stabilizer or conditioner. CYA is available as a solid and as a liquid. The liquid costs a lot more, and generally isn't worth the extra expense. Solid stabilizer can take up to a week to fully register on the test, so don't retest your CYA level for a week after adding some. Solid stabilizer is best added by placing it in a sock in the skimmer basket. The pump should be run for 24 hours after adding solid stabilizer and you should avoid backwashing/cleaning the filter for a week.  In nearly all cases the best way to lower CYA is to replace water. If replacement water is extremely expensive you might want to look into a reverse osmosis water treatment.",
			"howTo": [	"1.  Fill the red-capped CYA mixing bottle to the bottom of the label with pool water.",
						"2.  Fill the bottle to the top of the label with R-0013 and mix well.",
						"3.  Let it sit for 1 minute",
						"4.  Shake it one more time.",
						"5.  Fill the CYA View Tube slowly until you no longer see the black dot at the bottom of the CYA View Tube (looking from the top at about waist height)",
						"6.  Record the number on the side of the view tube closest to the top of the solution."]
			}
		];
		this.helpers({
			swimmingPools(){
				return SwimmingPools.find({"owner": Meteor.userId()});
			},
			currentUser() {
				return Meteor.user();
			}
		})
	}
	editPool(poolId){
		result = SwimmingPools.findOne({"_id": poolId});
		if (result){
			return result;
		}else{
			console.log('Could not load ID ' + poolId);
		}
	}
	modifyPool(pool){
		if (pool._id){
			Meteor.call("swimmingPool.update", pool);
		} else {
			Meteor.call("swimmingPool.insert", pool);
		}
		this.$state.go('swimmingPool');
	}
	removePool(poolId){
		Meteor.call("swimmingPool.remove", poolId);
	}
}

export default angular.module('swimmingPool', [
	angularMeteor,
	uiRouter
])
	.component('swimmingPool',{
		templateUrl: 'imports/components/swimmingPool/swimmingPool.html',
		controller: ['$scope', '$stateParams', '$state', SwimmingPoolController]
	})
	.component('swimmingPoolDetail',{
		templateUrl: poolDetail,
		controller: ['$scope', '$stateParams', '$state', SwimmingPoolController]
	})
	;

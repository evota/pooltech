 import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Mongo } from 'meteor/mongo';

export const TestResults = new Mongo.Collection('TestResults');
if (Meteor.isServer) {
	Meteor.publish('testResults', function() {
		return TestResults.find({owner: this.userId});
	})
}
Meteor.methods({
	'testResults.insert' (result){
		if (!Meteor.userId()){
			throw new Meteor.Error('not-authorized');
		}
		TestResults.insert({
		datetime: result.datetime,
		freeChlorine: result.freeChlorine,
		combinedChlorine: result.combinedChlorine,
		ph: result.ph,
		totalAlkalinity: result.totalAlkalinity,
		calciumHardness: result.calciumHardness,
		cyanuricAcid: result.cyanuricAcid,
		poolTemperature: result.poolTemperature,
		outdoorTemperature: result.outdoorTemperature,
		notes: result.notes,
		poolId: result.poolId,
		owner: Meteor.userId()
	});
	},
	'testResults.remove' (testResultId){
		TestResults.remove(testResultId);
	},
	'testResults.update' (result){
		TestResults.update(result._id,{
			datetime: result.datetime,
			freeChlorine: result.freeChlorine,
			combinedChlorine: result.combinedChlorine,
			ph: result.ph,
			totalAlkalinity: result.totalAlkalinity,
			calciumHardness: result.calciumHardness,
			cyanuricAcid: result.cyanuricAcid,
			poolTemperature: result.poolTemperature,
			outdoorTemperature: result.outdoorTemperature,
			notes: result.notes,
			poolId: result.poolId,
			owner: Meteor.userId()
		});
	}
})
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Mongo } from 'meteor/mongo';

export const SwimmingPools = new Mongo.Collection('SwimmingPools');
if (Meteor.isServer) {
	Meteor.publish('swimmingPools', function() {
//		return ShoppingList.find({owner: this.userId});
				return SwimmingPools.find();
	})
}
Meteor.methods({
	'swimmingPool.insert' (pool){
		if (!Meteor.userId()){
			throw new Meteor.Error('not-authorized');
		}
		SwimmingPools.insert({
			name: pool.name,
			size: pool.size,
			sizeUnit: 'GAL',
			poolOwner: pool.poolOwner,
			address: pool.address,
			type:  pool.type,
			chlorineSource: pool.chlorineSource,
			image: pool.image,
			lastFilterChange: pool.lastFilterChange,
			targets: pool.targets,
			chemicals: pool.chemicals,
			owner: Meteor.userId()
		});
	},
	'swimmingPool.remove' (poolId){
		SwimmingPools.remove(poolId);
	},
	'swimmingPool.update' (pool){
		SwimmingPools.update(pool._id,{
			name: pool.name,
			size: pool.size,
			sizeUnit: pool.sizeUnit,
			poolOwner: pool.poolOwner,
			address: pool.address,
			type:  pool.type,
			chlorineSource: pool.chlorineSource,
			image: pool.image,
			lastFilterChange: pool.lastFilterChange,
			targets: pool.targets,
			chemicals: pool.chemicals,
			owner: Meteor.userId()
		});
	}
})
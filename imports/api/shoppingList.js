import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Mongo } from 'meteor/mongo';

export const ShoppingList = new Mongo.Collection('ShoppingList');
if (Meteor.isServer) {
	Meteor.publish('shoppingList', function() {
//		return ShoppingList.find({owner: this.userId});
				return ShoppingList.find();
	})
}
Meteor.methods({
	'shoppingList.insert' (item){
		if (!Meteor.userId()){
			throw new Meteor.Error('not-authorized');
		}
		if (item.datePurchased) {
			item.purchased = true;
		}else{
		 item.purchased = false;
	 	}
		ShoppingList.insert({
		product: item.product,
		cost: item.cost,
		purchased: item.purchased,
		poolId: item.poolId,
		datePurchased: item.datePurchased,
		owner: Meteor.userId()
	});
	},
	'shoppingList.remove' (itemId){
		ShoppingList.remove(itemId);
	},
	'shoppingList.update' (item){
		if (item.datePurchased) {
			item.purchased = true;
		}else{
		 item.purchased = false;
	 	}
		ShoppingList.update(item._id,{
			product: item.product,
			cost: item.cost,
			purchased: item.purchased,
			poolId: item.poolId,
			datePurchased: item.datePurchased,
			owner: Meteor.userId()
		});
	}
})
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
		ShoppingList.insert({
		product: item.product,
		cost: item.cost,
		purchased: false
	});
	},
	'shoppingList.remove' (itemId){
		ShoppingList.remove(itemId);
	},
	'shoppingList.update' (item){
		ShoppingList.update(item._id,{
			product: item.product,
			cost: item.cost,
			purchased: item.purchased
		});
	}
})
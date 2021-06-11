import { PopulatedItem } from '../models/populated-item.model';

export class ShoppingList {
	constructor(
		private shoppingItems: Map<string, PopulatedItem>,
		private name: string
	) {}

	get(id: string) {
		return this.shoppingItems.get(id);
	}

	getAllItems() {
		return this.shoppingItems;
	}

	add(item: PopulatedItem) {
		this.shoppingItems.set(item.itemID, item);
	}

	remove(id: string) {
		this.shoppingItems.delete(id);
	}

	update(item: PopulatedItem) {
		this.shoppingItems.set(item.itemID, item);
	}

	updateName(newName: string) {
		this.name = newName;
	}

	getName() {
		return this.name;
	}
}

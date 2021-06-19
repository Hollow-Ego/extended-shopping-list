import { EDIT_MODE, SHOPPING_MODE } from '../constants';
import { PopulatedItem } from '../models/populated-item.model';

export class ShoppingList {
	constructor(
		private shoppingItems: Map<string, PopulatedItem>,
		private name: string,
		private id: string,
		private mode: string = EDIT_MODE
	) {}

	get(id: string) {
		return this.shoppingItems.get(id);
	}

	getListID() {
		return this.id;
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

	getMode() {
		return this.mode;
	}

	isShoppingMode() {
		return this.mode === SHOPPING_MODE;
	}

	toggleMode() {
		this.mode = this.isShoppingMode() ? EDIT_MODE : SHOPPING_MODE;
	}
}

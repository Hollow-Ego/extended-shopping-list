import {
	EDIT_MODE,
	SHOPPING_MODE,
	SORT_ASCENDING,
	SORT_BY_NAME,
} from '../constants';
import { PopulatedItem } from '../models/populated-item.model';

export class ShoppingList {
	constructor(
		private shoppingItems: Map<string, PopulatedItem>,
		private name: string,
		private id: string,
		private mode: string = EDIT_MODE,
		private sortMode: string = SORT_BY_NAME,
		private sortDirection: string = SORT_ASCENDING
	) {}

	get(id: string) {
		return this.shoppingItems.get(id);
	}

	add(item: PopulatedItem) {
		this.shoppingItems.set(item.itemId, item);
	}

	remove(id: string) {
		this.shoppingItems.delete(id);
	}

	update(item: PopulatedItem) {
		this.shoppingItems.set(item.itemId, item);
	}

	getListID() {
		return this.id;
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

	getAllItems() {
		return this.shoppingItems;
	}

	getSortDetails() {
		return { sortMode: this.sortMode, sortDirection: this.sortDirection };
	}

	setSortDetails(newMode: string, newDirection: string) {
		this.sortMode = newMode;
		this.sortDirection = newDirection;
	}
}

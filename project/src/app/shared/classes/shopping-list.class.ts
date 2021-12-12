import { Mode } from '../enums/mode.enum';
import { Sort } from '../enums/sorting.enum';
import { PopulatedItem } from '../interfaces/populated-item.interface';

export class ShoppingList {
	constructor(
		private shoppingItems: Map<string, PopulatedItem>,
		private name: string,
		private id: string,
		private mode: string = Mode.Edit,
		private sortMode: number = Sort.ByName,
		private sortDirection: number = Sort.Ascending
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
		return this.mode === Mode.Shopping;
	}

	toggleMode() {
		this.mode = this.isShoppingMode() ? Mode.Edit : Mode.Shopping;
	}

	getAllItems() {
		return this.shoppingItems;
	}

	getSortDetails() {
		return { sortMode: this.sortMode, sortDirection: this.sortDirection };
	}

	setSortDetails(newMode: number, newDirection: number) {
		this.sortMode = newMode;
		this.sortDirection = newDirection;
	}
}

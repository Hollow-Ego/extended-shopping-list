import { Mode } from '../enums/mode.enum';
import { Sort } from '../enums/sorting.enum';
import { PopulatedItem } from '../interfaces/populated-item.interface';
import { SortDetails } from '../interfaces/sort-details.interface';

export class ShoppingList {
	public shoppingItems: Map<string, PopulatedItem>;
	public name: string;
	public id: string;
	public mode: string;
	public sortMode: number;
	public sortDirection: number;

	constructor(
		shoppingItems: Map<string, PopulatedItem>,
		name: string,
		id: string,
		mode: string = Mode.Edit,
		sortMode: number = Sort.ByName,
		sortDirection: number = Sort.Ascending
	) {
		this.shoppingItems = shoppingItems;
		this.name = name;
		this.id = id;
		this.mode = mode;
		this.sortMode = sortMode;
		this.sortDirection = sortDirection;
	}

	getItem(id: string): PopulatedItem | null {
		const map = this.shoppingItems.get(id);
		if (!map) return null;
		return map;
	}

	addItem(item: PopulatedItem): void {
		const existingItem = this.getItemByLibraryId(item.libraryId || null);

		if (existingItem) {
			const newAmount = (item.amount || 0) + (existingItem.amount || 0);
			this.updateItem({ ...existingItem, amount: newAmount });
			return;
		}
		this.shoppingItems.set(item.id, item);
	}

	removeItem(id: string): void {
		this.shoppingItems.delete(id);
	}

	updateItem(item: PopulatedItem): void {
		this.shoppingItems.set(item.id, item);
	}

	updateName(newName: string): void {
		this.name = newName;
	}

	isShoppingMode(): boolean {
		return this.mode === Mode.Shopping;
	}

	toggleMode(): void {
		this.mode = this.isShoppingMode() ? Mode.Edit : Mode.Shopping;
	}

	getAllItems(): Map<string, PopulatedItem> {
		return this.shoppingItems;
	}

	getSortDetails(): SortDetails {
		return { sortMode: this.sortMode, sortDirection: this.sortDirection };
	}

	setSortDetails(newMode: number, newDirection: number): void {
		this.sortMode = newMode;
		this.sortDirection = newDirection;
	}

	private getItemByLibraryId(libraryId: string | null): PopulatedItem | null {
		if (!libraryId) return null;
		for (const item of this.shoppingItems.values()) {
			if (item.libraryId === libraryId) return item;
		}
		return null;
	}
}

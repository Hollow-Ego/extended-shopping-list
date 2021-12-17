import { Sort } from '../enums/sorting.enum';
import { LibraryItem } from '../interfaces/library-item.interface';
import { NameIdObject } from '../interfaces/name-id-object.interface';
import { SortDetails } from '../interfaces/sort-details.interface';

export class ItemLibrary {
	public items: Map<string, LibraryItem>;
	public sortMode: number;
	public sortDirection: number;

	constructor(
		items: Map<string, LibraryItem> = new Map(),
		sortMode: number = Sort.ByName,
		sortDirection: number = Sort.Ascending
	) {
		this.items = items;
		this.sortMode = sortMode;
		this.sortDirection = sortDirection;
	}

	getItem(id: string): LibraryItem | null {
		const item = this.items.get(id);
		if (!item) return null;
		return item;
	}

	addItem(id: string, item: LibraryItem): void {
		this.items.set(id, item);
	}

	removeItem(id: string): void {
		this.items.delete(id);
	}

	updateItem(id: string, item: LibraryItem): void {
		this.items.set(id, item);
	}

	has(key: string): boolean {
		return this.items.has(key);
	}

	get size(): number {
		return this.items.size;
	}

	get itemsArray(): LibraryItem[] {
		return Array.from(this.items.values());
	}

	get tags(): NameIdObject[] {
		const tags: NameIdObject[] = [];
		this.items.forEach(item => {
			if (item.tags.length > 0) {
				tags.push(...item.tags);
			}
		});
		return [...new Set(tags)];
	}

	get units(): string[] {
		const units: string[] = [];
		this.items.forEach(item => {
			const unit = item.unit;
			if (unit && typeof unit !== 'undefined') {
				units.push(unit);
			}
		});
		return [...new Set(units)];
	}

	get sortDetails(): SortDetails {
		return { sortMode: this.sortMode, sortDirection: this.sortDirection };
	}

	set sortDetails(newValue: SortDetails) {
		const { sortMode, sortDirection } = newValue;
		this.sortMode = sortMode;
		this.sortDirection = sortDirection;
	}
}

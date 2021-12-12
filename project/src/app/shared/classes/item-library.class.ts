import { Sort } from '../enums/sorting.enum';
import { LibraryItem } from '../interfaces/library-item.interface';

export class ItemLibrary {
	constructor(
		private items: Map<string, LibraryItem> = new Map(),
		private sortMode: number = Sort.ByName,
		private sortDirection: number = Sort.Ascending
	) {}

	get(id: string) {
		return this.items.get(id);
	}

	add(id: string, item: LibraryItem) {
		this.items.set(id, item);
	}

	remove(id: string) {
		this.items.delete(id);
	}

	update(id: string, item: LibraryItem) {
		this.items.set(id, item);
	}

	setItems(items: Map<string, LibraryItem>) {
		this.items = items;
	}

	has(key: string) {
		return this.items.has(key);
	}

	size() {
		return this.items.size;
	}

	values() {
		return this.items.values();
	}

	getAllItems() {
		return this.items;
	}

	getAllTags() {
		const tags = [];
		this.items.forEach(item => {
			if (item.tags.length > 0) {
				tags.push(...item.tags);
			}
		});
		return [...new Set(tags)];
	}

	getAllUnits() {
		const units = [];
		this.items.forEach(item => {
			const unit = item.unit;
			if (unit && typeof unit !== 'undefined') {
				units.push(unit);
			}
		});
		return [...new Set(units)];
	}

	getSortDetails() {
		return { sortMode: this.sortMode, sortDirection: this.sortDirection };
	}

	setSortDetails(newMode: string, newDirection: string) {
		this.sortMode = newMode;
		this.sortDirection = newDirection;
	}
}

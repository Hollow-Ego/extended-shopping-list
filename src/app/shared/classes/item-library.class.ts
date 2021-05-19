import { LibraryItem } from '../models/library-item.model';

export class ItemLibrary {
	constructor(private items: Map<string, LibraryItem> = new Map()) {}

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
}

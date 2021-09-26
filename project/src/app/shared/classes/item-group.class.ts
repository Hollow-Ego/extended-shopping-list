import { LibraryItem } from '../models/library-item.model';

export class ItemGroup {
	constructor(
		public name: string,
		public groupMembers: string[],
		private id: string
	) {}

	add(itemId: string) {
		const newMembers = [...this.groupMembers, itemId];
		this.groupMembers = newMembers;
	}

	getId() {
		return this.id;
	}

	remove(itemId: string) {
		const newMembers = this.groupMembers.filter(el => el !== itemId);
		this.groupMembers = newMembers;
	}

	rename(newName: string) {
		this.name = newName;
	}
}

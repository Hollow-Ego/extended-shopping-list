import { LibraryItem } from '../models/library-item.model';

export class ItemGroup {
	constructor(
		public name: string,
		public groupMembers: string[],
		private id: string
	) {}

	add(itemID: string) {
		const newMembers = [...this.groupMembers, itemID];
		this.groupMembers = newMembers;
	}

	getId() {
		return this.id;
	}

	remove(itemID: string) {
		const newMembers = this.groupMembers.filter(el => el !== itemID);
		this.groupMembers = newMembers;
	}

	rename(newName: string) {
		this.name = newName;
	}
}

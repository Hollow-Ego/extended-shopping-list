import { LibraryItem } from '../interfaces/library-item.interface';

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

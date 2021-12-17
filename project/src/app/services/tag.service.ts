import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { BehaviorSubject } from 'rxjs';
import { StorageKey } from '../shared/enums/storage-key.enum';
import { NameIdObject } from '../shared/interfaces/name-id-object.interface';
import { createOrCopyID } from '../shared/utilities/utils';
import { Storage } from '@ionic/storage';

@Injectable({
	providedIn: 'root',
})
export class TagService {
	public tags: BehaviorSubject<NameIdObject[]> = new BehaviorSubject<
		NameIdObject[]
	>([]);
	private _tags: NameIdObject[] = [];

	constructor(private storage: Storage) {
		this.initialize();
	}

	async initialize() {
		const loadedTags = await this.storage.get(StorageKey.Tags);
		if (!loadedTags || loadedTags.length === 0) {
			return;
		}

		this._tags = cloneDeep(loadedTags);
		this.updatedTags();
	}

	addTag(name: string): NameIdObject | null {
		const existingTags = this._tags.filter(x => x.name === name);
		if (existingTags.length > 0) return null;
		this._tags = cloneDeep(this._tags);
		const newTag = {
			id: createOrCopyID(null),
			name,
		};
		this._tags.push(newTag);
		this.updatedTags();
		return newTag;
	}

	addTagRange(names: string[]): void {
		this._tags = cloneDeep(this._tags);
		for (let name of names) {
			const existingTags = this._tags.filter(x => x.name === name);
			if (existingTags.length > 0) continue;
			const newTag = {
				id: createOrCopyID(null),
				name,
			};
			this._tags.push(newTag);
		}
		this.updatedTags();
	}

	findTagByName(name: string): NameIdObject | null {
		return this._tags.find(x => x.name === name) || null;
	}

	removeTag(id: string): void {
		this._tags = cloneDeep(this._tags).filter(tag => tag.id !== id);
		this.updatedTags();
	}

	updateTag(id: string, name: string): void {
		this._tags = cloneDeep(this._tags);
		const tagIndex = this._tags.findIndex(x => x.id === id);
		if (tagIndex < 0) return;

		const updatedTag = { ...this._tags[tagIndex], name };
		this._tags[tagIndex] = updatedTag;
		this.updatedTags();
	}

	private updatedTags() {
		this.storage.set(StorageKey.Tags, this._tags);
		this.tags.next(this._tags);
	}
}

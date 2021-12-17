import { Component, Input, OnInit } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { TagService } from '../../../services/tag.service';
import { NameIdObject } from '../../interfaces/name-id-object.interface';

@Component({
	selector: 'pxsl1-tag-input',
	templateUrl: './tag-input.component.html',
	styleUrls: ['./tag-input.component.scss'],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			multi: true,
			useExisting: TagInputComponent,
		},
	],
})
export class TagInputComponent implements ControlValueAccessor, OnInit {
	public availableTags$: BehaviorSubject<NameIdObject[]> | undefined;
	public disabled = false;
	public isOpenDropdown = false;
	public newTagName = '';
	public tags: NameIdObject[] = [];
	public touched = false;

	public onChange = (tags: NameIdObject[]) => {};
	public onTouched = () => {};

	constructor(private tagService: TagService) {}

	ngOnInit(): void {
		this.availableTags$ = this.tagService.tags;
	}

	addNewTag(name: string): void {
		this.markAsTouched();
		this.newTagName = '';
		this.isOpenDropdown = false;
		const newTag = this.tagService.addTag(name);

		if (!newTag) {
			const tag = this.tagService.findTagByName(name);
			if (!tag) return;
			this.addTag(tag);
			return;
		}
		this.tags.push(newTag);
		this.onChange(this.tags);
	}

	addTag(tag: NameIdObject): void {
		this.markAsTouched();
		this.newTagName = '';
		this.isOpenDropdown = false;
		this.tags.push(tag);
		this.onChange(this.tags);
	}

	canBeSelected(tag: NameIdObject): boolean {
		const isAlreadySelected = this.tags.find(
			x => x.id === tag.id || x.name === tag.name
		);
		const filter = this.newTagName.toLowerCase();
		const isFiltered = tag.name.toLowerCase().indexOf(filter) > -1;
		return !isAlreadySelected && isFiltered;
	}

	onChipSelect(tag: NameIdObject): void {
		if (this.disabled) {
			return;
		}
		this.addTag(tag);
	}

	onClickDropdown(): void {
		if (this.disabled) {
			return;
		}
		this.markAsTouched();
		this.isOpenDropdown = !this.isOpenDropdown;
	}

	onConfirm(): void {
		if (this.disabled) {
			return;
		}
		if (this.newTagName.length <= 0) return;
		this.addNewTag(this.newTagName);
	}

	onRemoveTag(index: number): void {
		if (this.disabled) {
			return;
		}
		this.markAsTouched();
		this.tags.splice(index, 1);
		this.onChange(this.tags);
	}

	markAsTouched(): void {
		if (!this.touched) {
			this.onTouched();
			this.touched = true;
		}
	}

	registerOnChange(onChange: any): void {
		this.onChange = onChange;
	}

	registerOnTouched(onTouched: any): void {
		this.onTouched = onTouched;
	}

	setDisabledState(disabled: boolean): void {
		this.disabled = disabled;
		this.isOpenDropdown = false;
	}

	writeValue(tags: NameIdObject[]): void {
		this.tags = tags;
	}
}

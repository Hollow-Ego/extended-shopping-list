import { Component, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

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
export class TagInputComponent implements ControlValueAccessor {
	public onChange = tags => {};
	public onTouched = () => {};
	public touched = false;
	public disabled = false;

	@Input() availableTags: string[] = [];

	public newTag = '';
	public tags: string[] = [];
	public isOpenDropdown = false;

	onClickDropdown() {
		if (this.disabled) {
			return;
		}
		this.markAsTouched();
		this.isOpenDropdown = !this.isOpenDropdown;
	}

	canBeSelected(tag: string) {
		const isAlreadySelected = this.tags.includes(tag);
		const filter = this.newTag.toLowerCase();
		const isFiltered = tag.toLowerCase().indexOf(filter) > -1;
		return !isAlreadySelected && isFiltered;
	}

	onChipSelect(tag: string) {
		if (this.disabled) {
			return;
		}
		this.addTag(tag);
	}

	onConfirm() {
		if (this.disabled) {
			return;
		}
		if (this.newTag.length <= 0) return;
		const alreadyExists = this.tags.find(tag => {
			return tag.toLowerCase() === this.newTag.toLowerCase();
		});
		if (alreadyExists) {
			this.newTag = '';
			this.isOpenDropdown = false;
			return;
		}
		this.addTag(this.newTag);
	}

	onRemoveTag(index: number) {
		if (this.disabled) {
			return;
		}
		this.markAsTouched();
		this.tags.splice(index, 1);
		this.onChange(this.tags);
	}

	addTag(tag: string) {
		this.markAsTouched();
		this.tags.push(tag);
		this.newTag = '';
		this.isOpenDropdown = false;
		this.onChange(this.tags);
	}

	writeValue(tags: string[]): void {
		this.tags = tags;
	}
	registerOnChange(onChange: any): void {
		this.onChange = onChange;
	}
	registerOnTouched(onTouched: any): void {
		this.onTouched = onTouched;
	}
	markAsTouched() {
		if (!this.touched) {
			this.onTouched();
			this.touched = true;
		}
	}
	setDisabledState(disabled: boolean) {
		this.disabled = disabled;
		this.isOpenDropdown = false;
	}
}

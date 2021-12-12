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
	@Input() availableTags: string[] = [];

	public disabled = false;
	public isOpenDropdown = false;
	public newTag = '';
	public tags: string[] = [];
	public touched = false;

	public onChange = (tags: string[]) => {};
	public onTouched = () => {};

	addTag(tag: string): void {
		this.markAsTouched();
		this.tags.push(tag);
		this.newTag = '';
		this.isOpenDropdown = false;
		this.onChange(this.tags);
	}

	canBeSelected(tag: string): boolean {
		const isAlreadySelected = this.tags.includes(tag);
		const filter = this.newTag.toLowerCase();
		const isFiltered = tag.toLowerCase().indexOf(filter) > -1;
		return !isAlreadySelected && isFiltered;
	}

	onChipSelect(tag: string): void {
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

	writeValue(tags: string[]): void {
		this.tags = tags;
	}
}

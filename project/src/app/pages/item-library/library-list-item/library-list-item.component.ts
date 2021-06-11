import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { LibraryItem } from '../../../shared/models/library-item.model';

@Component({
	selector: 'pxsl1-library-list-item',
	templateUrl: './library-list-item.component.html',
	styleUrls: ['./library-list-item.component.scss'],
})
export class LibraryListItemComponent implements OnInit {
	@Input() item: LibraryItem;
	@Output() editItem = new EventEmitter<LibraryItem>();
	@Output() deleteItem = new EventEmitter<string>();
	@Output() addItemToList = new EventEmitter<LibraryItem>();
	constructor() {}

	ngOnInit() {}

	onAddToList() {
		this.addItemToList.emit(this.item);
	}

	hasImage() {
		return this.item.imgData.webviewPath !== '';
	}

	onEditItem() {
		this.editItem.emit(this.item);
	}
	onDeleteItem() {
		this.deleteItem.emit(this.item.itemID);
	}
}

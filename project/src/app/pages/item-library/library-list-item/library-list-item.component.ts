import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { ActionPopoverComponent } from '../../../components/action-popover/action-popover.component';
import { ACTION_EDIT, ACTION_DELETE } from '../../../shared/constants';
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
	constructor(private popoverCtrl: PopoverController) {}

	ngOnInit() {}

	onAddToList() {
		this.addItemToList.emit(this.item);
	}

	hasImage() {
		return this.item.imgData.webviewPath !== '';
	}

	async onItemActions($event) {
		const popover = await this.popoverCtrl.create({
			component: ActionPopoverComponent,
			event: $event,
			translucent: true,
			componentProps: { options: [ACTION_EDIT, ACTION_DELETE] },
		});

		await popover.present();
		const { data: action } = await popover.onDidDismiss();

		switch (action) {
			case ACTION_DELETE:
				this.deleteItem.emit(this.item.itemID);
				return;
			case ACTION_EDIT:
				this.editItem.emit(this.item);
				return;
			default:
				return;
		}
	}

	onEditItem() {
		this.editItem.emit(this.item);
	}
	onDeleteItem() {
		this.deleteItem.emit(this.item.itemID);
	}
}

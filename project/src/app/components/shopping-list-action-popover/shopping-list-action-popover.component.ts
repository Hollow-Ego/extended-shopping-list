import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { LIST_ACTION_DELETE, LIST_ACTION_RENAME } from '../../shared/constants';

@Component({
	selector: 'pxsl1-shopping-list-action-popover',
	templateUrl: './shopping-list-action-popover.component.html',
	styleUrls: ['./shopping-list-action-popover.component.scss'],
})
export class ShoppingListActionPopoverComponent implements OnInit {
	constructor(public popoverController: PopoverController) {}

	ngOnInit() {}

	onRenameList() {
		this.popoverController.dismiss(LIST_ACTION_RENAME);
	}
	onDeleteList() {
		this.popoverController.dismiss(LIST_ACTION_DELETE);
	}
}

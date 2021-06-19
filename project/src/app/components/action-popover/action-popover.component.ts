import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import {
	ACTION_DELETE,
	ACTION_EDIT,
	ACTION_RENAME,
} from '../../shared/constants';

@Component({
	selector: 'pxsl1-action-popover',
	templateUrl: './action-popover.component.html',
	styleUrls: ['./action-popover.component.scss'],
})
export class ActionPopoverComponent implements OnInit {
	@Input() options = [];
	constructor(public popoverController: PopoverController) {}
	public edit = true;
	public rename = true;
	public delete = true;

	ngOnInit() {
		if (!this.options) {
			return;
		}
		this.edit = this.options.includes(ACTION_EDIT);
		this.rename = this.options.includes(ACTION_RENAME);
		this.delete = this.options.includes(ACTION_DELETE);
	}

	onRename() {
		this.popoverController.dismiss(ACTION_RENAME);
	}
	onEdit() {
		this.popoverController.dismiss(ACTION_EDIT);
	}
	onDelete() {
		this.popoverController.dismiss(ACTION_DELETE);
	}
}

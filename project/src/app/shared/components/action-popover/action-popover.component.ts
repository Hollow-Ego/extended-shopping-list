import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { ModalAction } from '../../enums/modal-action.enum';

@Component({
	selector: 'pxsl1-action-popover',
	templateUrl: './action-popover.component.html',
})
export class ActionPopoverComponent implements OnInit {
	@Input() options: number[] = [];
	constructor(public popoverController: PopoverController) {}
	public edit = true;
	public rename = true;
	public delete = true;

	ngOnInit() {
		if (!this.options) {
			return;
		}
		this.edit = this.options.includes(ModalAction.Edit);
		this.rename = this.options.includes(ModalAction.Rename);
		this.delete = this.options.includes(ModalAction.Delete);
	}

	onRename() {
		this.popoverController.dismiss(ModalAction.Rename);
	}
	onEdit() {
		this.popoverController.dismiss(ModalAction.Edit);
	}
	onDelete() {
		this.popoverController.dismiss(ModalAction.Delete);
	}
}

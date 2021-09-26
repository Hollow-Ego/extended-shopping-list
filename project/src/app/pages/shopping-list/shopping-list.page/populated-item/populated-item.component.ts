import {
	Component,
	ElementRef,
	EventEmitter,
	Input,
	OnInit,
	Output,
	ViewChild,
} from '@angular/core';
import { PopoverController } from '@ionic/angular';

import { ImageModalComponent } from '../../../../components/modals/image-modal/image-modal.component';
import { ActionPopoverComponent } from '../../../../components/action-popover/action-popover.component';
import { ACTION_DELETE, ACTION_EDIT } from '../../../../shared/constants';
import { PopulatedItem } from '../../../../shared/models/populated-item.model';

@Component({
	selector: 'pxsl1-populated-item',
	templateUrl: './populated-item.component.html',
	styleUrls: ['./populated-item.component.scss'],
})
export class PopulatedItemComponent implements OnInit {
	@Input() item: PopulatedItem;
	@Input() isEditMode = true;
	@Output() editItem = new EventEmitter<PopulatedItem>();
	@Output() deleteItem = new EventEmitter<PopulatedItem>();

	private lastOnStart = 0;
	private DOUBLE_CLICK_THRESHOLD = 500;

	public hasImage = false;
	public amountString: string;

	constructor(private popoverCtrl: PopoverController) {}

	ngOnInit() {
		this.hasImage = this.item?.imgData?.fileName.trim().length > 0;
		this.amountString = this.buildAmountString();
	}

	buildAmountString(): string {
		if (!this.item?.amount && !this.item?.unit) return;
		return (
			(this.item?.amount ? this.item?.amount : '') +
			(this.item?.unit ? ` ${this.item.unit}` : '')
		);
	}

	onStartDoubleClick() {
		if (this.isEditMode) return;
		const now = Date.now();
		if (Math.abs(now - this.lastOnStart) <= this.DOUBLE_CLICK_THRESHOLD) {
			this.deleteItem.emit(this.item);
			this.lastOnStart = 0;
		} else {
			this.lastOnStart = now;
		}
	}

	async onItemClick(title: string, imageUrl: string) {
		const popover = await this.popoverCtrl.create({
			component: ImageModalComponent,
			cssClass: 'image-modal',
			componentProps: {
				title,
				imageUrl,
			},
			showBackdrop: true,
			backdropDismiss: true,
		});
		await popover.present();
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
				this.deleteItem.emit(this.item);
				return;
			case ACTION_EDIT:
				this.editItem.emit(this.item);
				return;
			default:
				return;
		}
	}

	onError() {
		console.log('This is an error');
	}
}

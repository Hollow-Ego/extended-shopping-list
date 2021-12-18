import {
	Component,
	EventEmitter,
	Input,
	OnChanges,
	Output,
} from '@angular/core';
import { PopoverController } from '@ionic/angular';

import { ImageModalComponent } from '../../../../shared/components/image-modal/image-modal.component';
import { ActionPopoverComponent } from '../../../../shared/components/action-popover/action-popover.component';

import { PopulatedItem } from '../../../../shared/interfaces/populated-item.interface';
import { ModalAction } from '../../../../shared/enums/modal-action.enum';

@Component({
	selector: 'pxsl1-populated-item',
	templateUrl: './populated-item.component.html',
	styleUrls: ['./populated-item.component.scss'],
})
export class PopulatedItemComponent implements OnChanges {
	@Input() isEditMode = true;
	@Input() item: PopulatedItem | null = null;

	@Output() editItem = new EventEmitter<PopulatedItem>();
	@Output() deleteItem = new EventEmitter<PopulatedItem>();

	public amountString: string = '';

	public hasImage = false;

	private doubleClickThreshold = 1000;
	private lastOnStart = 0;

	constructor(private popoverCtrl: PopoverController) {}

	ngOnChanges(): void {
		if (!this.item) return;
		const filename = this.item.imgData?.webviewPath;
		this.hasImage = !!filename && filename.trim().length > 0;
		this.amountString = this.buildAmountString();
	}

	buildAmountString(): string {
		if (!this.item?.amount && !this.item?.unit) return '';
		return (
			(this.item?.amount ? this.item?.amount : '') +
			(this.item?.unit ? ` ${this.item.unit}` : '')
		);
	}

	onStartDoubleClick(): void {
		if (!this.item) return;
		if (this.isEditMode) return;
		const now = Date.now();
		if (Math.abs(now - this.lastOnStart) <= this.doubleClickThreshold) {
			this.deleteItem.emit(this.item);
			this.lastOnStart = 0;
		} else {
			this.lastOnStart = now;
		}
	}

	async onItemClick(title: string, imageUrl: string): Promise<void> {
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

	async onItemActions($event: any): Promise<void> {
		if (!this.item) return;
		const popover = await this.popoverCtrl.create({
			component: ActionPopoverComponent,
			event: $event,
			translucent: true,
			componentProps: { options: [ModalAction.Edit, ModalAction.Delete] },
		});

		await popover.present();
		const { data: action } = await popover.onDidDismiss();

		switch (action) {
			case ModalAction.Delete:
				this.deleteItem.emit(this.item);
				return;
			case ModalAction.Edit:
				this.editItem.emit(this.item);
				return;
			default:
				return;
		}
	}

	onError(): void {
		console.log('This is an error');
	}
}

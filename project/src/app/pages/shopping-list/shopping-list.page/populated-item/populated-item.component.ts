import {
	Component,
	ElementRef,
	EventEmitter,
	Input,
	OnInit,
	Output,
	ViewChild,
} from '@angular/core';
import {
	IonItemSliding,
	ModalController,
	PopoverController,
} from '@ionic/angular';

import { ImageModalComponent } from '../../../../components/modals/image-modal/image-modal.component';
import { PopulatedItem } from '../../../../shared/models/populated-item.model';

@Component({
	selector: 'pxsl1-populated-item',
	templateUrl: './populated-item.component.html',
	styleUrls: ['./populated-item.component.scss'],
})
export class PopulatedItemComponent implements OnInit {
	@Input() item: PopulatedItem;
	@Output() editItem = new EventEmitter<PopulatedItem>();
	@Output() deleteItem = new EventEmitter<PopulatedItem>();
	@ViewChild('shoppingItem') shoppingItemRef: ElementRef;
	private lastOnStart = 0;
	private DOUBLE_CLICK_THRESHOLD = 500;

	constructor(private popoverCtrl: PopoverController) {}

	ngOnInit() {}

	onStartDoubleClick() {
		const now = Date.now();
		if (Math.abs(now - this.lastOnStart) <= this.DOUBLE_CLICK_THRESHOLD) {
			// this.shoppingListService.removeItem(this.item[0]).subscribe(() => {
			// 	this.lastOnStart = 0;
			// });
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

	async onEditItem(item: PopulatedItem, slidingItem: IonItemSliding) {
		slidingItem.close();
		this.editItem.emit(item);
	}

	onDeleteItem(item: PopulatedItem, slidingItem: IonItemSliding) {
		slidingItem.close();
		this.deleteItem.emit(item);
	}

	onError() {
		console.log('This is an error');
	}
}

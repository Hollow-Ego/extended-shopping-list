import { Component, Input, OnInit } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { ActionPopoverComponent } from '../../../shared/components/action-popover/action-popover.component';
import { AddEditModalComponent } from '../../../shared/components/add-edit-modal/add-edit-modal.component';
import { LibraryService } from '../../../services/library.service';
import { ShoppingListService } from '../../../services/shopping-list.service';
import { ToastService } from '../../../services/toast.service';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import {
	ACTION_EDIT,
	ACTION_DELETE,
	MODAL_EDIT_MODE,
} from '../../../shared/constants';
import { TranslationService } from '../../../services/translation.service';
import { AddEditModalOutput } from '../../../shared/interfaces/add-edit-modal-data.interface';
import { LibraryItem } from '../../../shared/interfaces/library-item.interface';
import { PopulatedItem } from '../../../shared/interfaces/populated-item.interface';

@Component({
	selector: 'pxsl1-library-list-item',
	templateUrl: './library-list-item.component.html',
})
export class LibraryListItemComponent implements OnInit {
	@Input() item: LibraryItem;
	private addItemToastMessage: string;

	constructor(
		private popoverCtrl: PopoverController,
		private modalCtrl: ModalController,
		private libraryService: LibraryService,
		private SLService: ShoppingListService,
		private toastService: ToastService,
		private translate: TranslationService
	) {}

	ngOnInit() {
		this.translate
			.getTranslation('messages.addItemToast')
			.subscribe((translation: string) => {
				this.addItemToastMessage = translation;
			});
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
				this.onDeleteItem(this.item.itemId);
				return;
			case ACTION_EDIT:
				this.onEditItem(this.item);
				return;
			default:
				return;
		}
	}

	async onEditItem(item: LibraryItem) {
		const modal = await this.modalCtrl.create({
			component: AddEditModalComponent,
			componentProps: {
				item,
				mode: MODAL_EDIT_MODE,
			},
		});
		await modal.present();
		const {
			canceled,
			itemData,
		}: { canceled: boolean; itemData: AddEditModalOutput } = (
			await modal.onWillDismiss()
		).data;

		if (canceled) {
			return;
		}

		this.libraryService.updateLibraryItem(itemData);
	}

	onDeleteItem(itemId: string) {
		this.libraryService.removeLibraryItem(itemId);
	}

	async onAddToList(item: LibraryItem) {
		const { amount } = item;
		const newShoppingItem: PopulatedItem = {
			amount,
			itemId: null,
			name: item.name,
			tags: [],
		};
		this.SLService.addListItem(newShoppingItem, amount);
		Haptics.notification({ type: NotificationType.Success });
		this.toastService.showSimpleToast(
			`${item.name} ${this.addItemToastMessage} `
		);
	}
}

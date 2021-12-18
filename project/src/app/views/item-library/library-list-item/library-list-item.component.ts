import { Component, Input, OnInit } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { ActionPopoverComponent } from '../../../shared/components/action-popover/action-popover.component';
import { AddEditModalComponent } from '../../../shared/components/add-edit-modal/add-edit-modal.component';
import { LibraryService } from '../../../services/library.service';
import { ShoppingListService } from '../../../services/shopping-list.service';
import { ToastService } from '../../../services/toast.service';
import { Haptics, NotificationType } from '@capacitor/haptics';

import { TranslationService } from '../../../services/translation.service';
import { AddEditModalOutput } from '../../../shared/interfaces/add-edit-modal-data.interface';
import { LibraryItem } from '../../../shared/interfaces/library-item.interface';
import { PopulatedItem } from '../../../shared/interfaces/populated-item.interface';
import { ModalMode } from '../../../shared/enums/modal-mode.enum';
import { ModalAction } from '../../../shared/enums/modal-action.enum';
import { take } from 'rxjs/operators';

@Component({
	selector: 'pxsl1-library-list-item',
	templateUrl: './library-list-item.component.html',
})
export class LibraryListItemComponent implements OnInit {
	@Input() item: LibraryItem | undefined;

	private addItemToastMessage: string = '';

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
			.pipe(take(1))
			.subscribe((translation: string) => {
				this.addItemToastMessage = translation;
			});
	}

	async onAddToList(item: LibraryItem): Promise<void> {
		let { amount } = item;

		if (!amount || amount < 0) amount = 0;

		const newShoppingItem: PopulatedItem = {
			amount,
			id: '',
			libraryId: item.id,
			name: item.name,
			tags: [],
		};

		this.SLService.addListItem(newShoppingItem, amount);
		Haptics.notification({ type: NotificationType.Success });
		this.toastService.showSimpleToast(
			`${item.name} ${this.addItemToastMessage} `
		);
	}

	onDeleteItem(itemId: string): void {
		this.libraryService.removeLibraryItem(itemId);
	}

	async onEditItem(item: LibraryItem): Promise<void> {
		const modal = await this.modalCtrl.create({
			component: AddEditModalComponent,
			componentProps: {
				item,
				mode: ModalMode.Edit,
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
				this.onDeleteItem(this.item.id);
				return;
			case ModalAction.Edit:
				this.onEditItem(this.item);
				return;
			default:
				return;
		}
	}
}

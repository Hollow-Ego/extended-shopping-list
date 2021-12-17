import { Component, Input, OnInit } from '@angular/core';
import { PopulatedItem } from '../../interfaces/populated-item.interface';
import { AlertController, ModalController } from '@ionic/angular';
import { SingleCurrencyData } from '../../interfaces/currency-data.interface';
import { LibraryItem } from '../../interfaces/library-item.interface';

import { ImageService } from '../../../services/image.service';

import { ModalMode } from '../../enums/modal-mode.enum';
import { currencies } from './../../../i18n/currency-map';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NameIdObject } from '../../interfaces/name-id-object.interface';

@Component({
	selector: 'pxsl1-add-edit-modal',
	templateUrl: './add-edit-modal.component.html',
	styleUrls: ['./add-edit-modal.component.scss'],
})
export class AddEditModalComponent implements OnInit {
	@Input() isNewLibraryItem: boolean = true;
	@Input() item: PopulatedItem | LibraryItem | null = null;
	@Input() mode: number = ModalMode.Add;

	public allCurrencyData: SingleCurrencyData[] = currencies;
	public availableUnits: NameIdObject[] = [];
	public itemForm: FormGroup | undefined;
	public modalMode = ModalMode;
	public updateLibrary = false;

	// TODO To be refactored into a setting
	private defaultCurrency: SingleCurrencyData = {
		symbol: '\u20AC',
		code: 'EUR',
		symbol_native: '\u20AC',
		decimal_digits: 2,
		rounding: 0.0,
	};

	constructor(
		public formBuilder: FormBuilder,
		public modalController: ModalController,
		public alertController: AlertController,
		private imageService: ImageService
	) {}

	ngOnInit() {
		if (!this.item) {
			this.item = {
				itemId: '',
				name: '',
				imgData: { filepath: '', fileName: '', webviewPath: '' },
				amount: 1,
				tags: [],
				unit: '',
				price: 0,
				currency: this.defaultCurrency,
			};
		}

		this.itemForm = this.formBuilder.group({
			itemId: this.item.itemId,
			name: [this.item.name, [Validators.required, Validators.minLength(3)]],
			amount: this.item.amount,
			imgData: this.item.imgData,
			tags: [[...this.item.tags]],
			unit: this.item.unit,
			price: this.item.price,
			currency: this.item.currency,
		});
	}

	cancelInput(): void {
		this.dismissModal(true);
	}

	compareWith(cur1: SingleCurrencyData, cur2: SingleCurrencyData): boolean {
		return cur1 && cur2 ? cur1.code === cur2.code : cur1 === cur2;
	}

	dismissModal(canceled = false): void {
		const itemData = this.itemForm!.value;
		if (!this.itemForm!.dirty) {
			canceled = true;
		}
		if (canceled || (!this.isNewItem() && !this.updateLibrary)) {
			this.imageService.clearDeletionStack();
		}
		this.imageService.deleteImagesFromStack();

		this.modalController.dismiss({
			canceled,
			itemData,
			updateLibrary: this.updateLibrary,
		});
	}

	async inputNewUnit(): Promise<string> {
		const inputAlert = await this.alertController.create({
			inputs: [
				{
					type: 'text',
					attributes: { autoComplete: 'off' },
				},
			],
			buttons: [{ text: 'Cancel' }, { text: 'Ok' }],
		});
		await inputAlert.present();
		const { data } = await inputAlert.onDidDismiss();
		if (!data.values) {
			data.values = [];
		}
		const newUnit = data.values[0];
		return newUnit;
	}

	isNewItem(): boolean {
		return this.mode === ModalMode.Add;
	}

	onSubmit(): void {
		this.dismissModal();
	}

	async onUnitChanged(unitSelect: any): Promise<void> {
		const selectedUnit = unitSelect.value;
		if (selectedUnit === 'new') {
			const newUnit = await this.inputNewUnit();
			if (!newUnit || newUnit.length <= 0) {
				this.itemForm!.controls['unit'].reset();
				return;
			}
			// if (!this.availableUnits.includes(newUnit)) {
			// 	this.availableUnits.push(newUnit);
			// }
			this.itemForm!.controls['unit'].setValue(newUnit);
		}
	}
}

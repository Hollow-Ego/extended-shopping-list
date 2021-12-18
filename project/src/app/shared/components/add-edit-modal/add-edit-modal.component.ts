import { Component, Input, OnInit } from '@angular/core';
import { PopulatedItem } from '../../interfaces/populated-item.interface';
import { AlertController, ModalController } from '@ionic/angular';
import { SingleCurrencyData } from '../../interfaces/currency-data.interface';
import { LibraryItem } from '../../interfaces/library-item.interface';

import { ImageService } from '../../../services/image.service';

import { ModalMode } from '../../enums/modal-mode.enum';

import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NameIdObject } from '../../interfaces/name-id-object.interface';
import { SettingsService } from '../../../services/settings.service';
import { CurrencyService } from '../../../services/currency.service';

@Component({
	selector: 'pxsl1-add-edit-modal',
	templateUrl: './add-edit-modal.component.html',
	styleUrls: ['./add-edit-modal.component.scss'],
})
export class AddEditModalComponent implements OnInit {
	@Input() isNewLibraryItem: boolean = true;
	@Input() item: PopulatedItem | LibraryItem | null = null;
	@Input() mode: number = ModalMode.Add;

	public allCurrencyData: SingleCurrencyData[] = [];
	public availableUnits: NameIdObject[] = [];
	public itemForm: FormGroup | undefined;
	public modalMode = ModalMode;
	public updateLibrary = false;

	private defaultCurrency: SingleCurrencyData | null = null;
	private libraryId: string | null = null;

	constructor(
		private formBuilder: FormBuilder,
		private modalController: ModalController,
		private alertController: AlertController,
		private imageService: ImageService,
		private settingsService: SettingsService,
		private currencyService: CurrencyService
	) {}

	ngOnInit() {
		this.allCurrencyData = this.currencyService.getAllCurrencies();
		this.defaultCurrency = this.settingsService.getDefaultCurrency();
		console.log(this.defaultCurrency);

		if (!this.item) {
			this.item = {
				id: '',
				name: '',
				imgData: { filepath: '', fileName: '', webviewPath: '' },
				amount: null,
				tags: [],
				unit: null,
				price: null,
				currency: this.defaultCurrency,
			};
		}
		if (!this.isNewLibraryItem) {
			this.libraryId = (this.item as PopulatedItem).libraryId || null;
		}

		this.itemForm = this.formBuilder.group({
			id: this.item.id,
			libraryId: this.libraryId,
			name: [this.item.name, [Validators.required, Validators.minLength(3)]],
			amount: this.item.amount,
			imgData: this.item.imgData,
			tags: [[...this.item.tags]],
			unit: this.item.unit,
			price: this.item.price,
			currency: this.item.currency || this.defaultCurrency,
		});
	}

	cancelInput(): void {
		this.dismissModal(true);
	}

	compareWith(cur1: SingleCurrencyData, cur2: SingleCurrencyData): boolean {
		return cur1 && cur2 ? cur1.code === cur2.code : cur1 === cur2;
	}

	dismissModal(canceled = false): void {
		if (!this.itemForm) {
			this.modalController.dismiss({
				canceled: true,
			});
		}
		const itemData = this.itemForm!.value;
		if (this.updateLibrary) this.itemForm!.markAsDirty();

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

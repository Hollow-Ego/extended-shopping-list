import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Image } from '../../shared/models/image.model';
import { ImageService } from '../../services/image.service';
import { Photo } from '@capacitor/camera';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
@Component({
	selector: 'pxsl1-image-picker',
	templateUrl: './image-picker.component.html',
	styleUrls: ['./image-picker.component.scss'],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			multi: true,
			useExisting: ImagePickerComponent,
		},
	],
})
export class ImagePickerComponent implements OnInit, ControlValueAccessor {
	public onChange = pickedImage => {};
	public onTouched = () => {};
	public touched = false;
	public disabled = false;

	public pickedImg: Image;

	public imgPlaceholderPath = 'assets/img-placeholder.png';
	private emptyImg = {
		filepath: '',
		webviewPath: '',
		fileName: '',
	};

	@ViewChild('filePicker') filePickerRef: ElementRef<HTMLInputElement>;
	public failedLoading: boolean;

	constructor(private imageService: ImageService) {}

	ngOnInit() {}

	async onPickImage() {
		if (!Capacitor.isPluginAvailable('Camera')) {
			this.filePickerRef.nativeElement.click();
			return;
		}
		const capturedImage: Photo = await this.imageService
			.takeImage()
			.catch(error => {
				return null;
			});

		if (capturedImage) {
			this.pickedImg = await this.imageService.savePicture(capturedImage);
			this.onChange(this.pickedImg);
		}
	}

	onClearImage() {
		this.failedLoading = false;
		this.imageService.markForDeletion(this.pickedImg.fileName);
		this.pickedImg = this.emptyImg;
		this.onChange(this.pickedImg);
	}

	getImgSource() {
		if (!this.pickedImg.webviewPath || !this.pickedImg) {
			return this.imgPlaceholderPath;
		}
		return this.pickedImg.webviewPath;
	}

	onLoadError() {
		this.failedLoading = true;
	}

	onDidLoad() {
		this.failedLoading = false;
	}

	writeValue(pickedImg: Image): void {
		this.pickedImg = pickedImg;
	}
	registerOnChange(onChange: any): void {
		this.onChange = onChange;
	}
	registerOnTouched(onTouched: any): void {
		this.onTouched = onTouched;
	}
	markAsTouched() {
		if (!this.touched) {
			this.onTouched();
			this.touched = true;
		}
	}
	setDisabledState(disabled: boolean) {
		this.disabled = disabled;
	}
}

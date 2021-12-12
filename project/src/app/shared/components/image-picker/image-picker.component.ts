import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Image } from '../../interfaces/image.interface';
import { ImageService } from '../../../services/image.service';
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
	@ViewChild('filePicker') filePickerRef:
		| ElementRef<HTMLInputElement>
		| undefined;

	public failedLoading: boolean = false;
	public disabled = false;
	public imgPlaceholderPath = 'assets/img-placeholder.png';
	public touched = false;
	public pickedImg: Image | null = null;

	public onChange = (pickedImage: Image | null) => {};
	public onTouched = () => {};

	private emptyImg: Image = {
		filepath: '',
		webviewPath: '',
		fileName: '',
	};

	constructor(private imageService: ImageService) {}

	ngOnInit() {}

	getImgSource(): string {
		if (!this.pickedImg || !this.pickedImg.webviewPath) {
			return this.imgPlaceholderPath;
		}
		return this.pickedImg.webviewPath;
	}

	markAsTouched() {
		if (!this.touched) {
			this.onTouched();
			this.touched = true;
		}
	}

	onClearImage(): void {
		this.failedLoading = false;
		if (!this.pickedImg) return;
		this.imageService.markForDeletion(this.pickedImg.fileName);
		this.pickedImg = this.emptyImg;
		this.onChange(this.pickedImg);
	}

	onDidLoad() {
		this.failedLoading = false;
	}

	onLoadError() {
		this.failedLoading = true;
	}

	async onPickImage(): Promise<void> {
		if (!Capacitor.isPluginAvailable('Camera')) {
			this.filePickerRef!.nativeElement.click();
			return;
		}
		const capturedImage: Photo | null = await this.imageService
			.takeImage()
			.catch(error => {
				return null;
			});

		if (capturedImage) {
			this.pickedImg = await this.imageService.savePicture(capturedImage);
			this.onChange(this.pickedImg);
		}
	}

	registerOnChange(onChange: any): void {
		this.onChange = onChange;
	}

	registerOnTouched(onTouched: any): void {
		this.onTouched = onTouched;
	}

	setDisabledState(disabled: boolean) {
		this.disabled = disabled;
	}

	writeValue(pickedImg: Image): void {
		this.pickedImg = pickedImg;
	}
}

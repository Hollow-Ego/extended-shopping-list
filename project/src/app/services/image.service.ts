import { Injectable } from '@angular/core';
import {
	Camera,
	CameraResultType,
	CameraSource,
	Photo,
} from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Toast } from '@capacitor/toast';
import { Platform } from '@ionic/angular';
import { TranslationService } from '../shared/i18n/translation.service';

@Injectable({
	providedIn: 'root',
})
export class ImageService {
	constructor(
		private platform: Platform,
		private translate: TranslationService
	) {}

	private deletionStack: string[] = [];

	async takeImage() {
		const result = await this.translate
			.getTranslations([
				'uiStrings.fromGalleryText',
				'uiStrings.takePictureText',
				'common.cancelText',
				'titles.photoPromptTitle',
			])
			.toPromise();
		console.log(result);

		const labelPhoto = result['uiStrings.fromGalleryText'];
		const labelPicture = result['uiStrings.takePictureText'];
		const labelCancel = result['common.cancelText'];
		const labelHeader = result['titles.photoPromptTitle'];

		const capturedImage = await Camera.getPhoto({
			resultType: CameraResultType.Uri,
			source: CameraSource.Prompt,
			quality: 100,
			promptLabelPhoto: labelPhoto,
			promptLabelPicture: labelPicture,
			promptLabelCancel: labelCancel,
			promptLabelHeader: labelHeader,
		});
		return capturedImage;
	}

	async savePicture(rawPhoto: Photo) {
		if (!rawPhoto) {
			return;
		}

		// Write the file to the data directory
		const fileName = new Date().getTime() + '.jpeg';

		const base64Data = await this.readAsBase64(rawPhoto);

		const savedFile = await Filesystem.writeFile({
			data: base64Data,
			path: fileName,
			directory: Directory.Data,
		});

		if (this.platform.is('hybrid')) {
			return {
				filepath: savedFile.uri,
				webviewPath: Capacitor.convertFileSrc(savedFile.uri),
				fileName,
			};
		}
		const webPath = await this.getWebViewPathImage(fileName);
		return {
			filepath: fileName,
			webviewPath: webPath,
			fileName,
		};
	}

	async getWebViewPathImage(filePath: string) {
		const readFile = await Filesystem.readFile({
			path: filePath,
			directory: Directory.Data,
		});

		// Web platform only: Load the photo as base64 data
		return `data:image/jpeg;base64,${readFile.data}`;
	}

	markForDeletion(path: string) {
		this.deletionStack.push(path);
	}

	needsDeletion() {
		return this.deletionStack.length > 0;
	}

	clearDeletionStack() {
		this.deletionStack = [];
	}

	async deleteImagesFromStack() {
		if (!this.needsDeletion()) return;
		this.deletionStack.forEach(async path => {
			await this.deleteImage(path);
		});
		this.clearDeletionStack();
	}

	async deleteImage(path: string) {
		Filesystem.deleteFile({
			path,
			directory: Directory.Data,
		}).catch(async err => {
			console.log(err);
			const errorMessage = await this.translate
				.getTranslation('messages.deletingImageError')
				.toPromise();
			Toast.show({ text: errorMessage });
		});
	}

	async readAsBase64(Photo: Photo) {
		// Fetch the photo, read as a blob, then convert to base64 format
		if (!Photo) {
			return;
		}
		// "hybrid" will detect Cordova or Capacitor
		if (this.platform.is('hybrid')) {
			// Read the file into base64 format
			const file = await Filesystem.readFile({
				path: Photo.path,
			});

			return file.data;
		} else {
			// Fetch the photo, read as a blob, then convert to base64 format
			const response = await fetch(Photo.webPath);
			const blob = await response.blob();
			const base64String = (await this.convertBlobToBase64(blob)) as string;
			return base64String;
		}
	}

	convertBlobToBase64 = (blob: Blob) =>
		new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onerror = reject;
			reader.onload = () => {
				resolve(reader.result);
			};
			reader.readAsDataURL(blob);
		});
}

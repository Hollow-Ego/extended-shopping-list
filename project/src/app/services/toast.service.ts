import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
	providedIn: 'root',
})
export class ToastService {
	constructor(public toastController: ToastController) {}

	async showSimpleToast(
		message: string,
		position: 'bottom' | 'middle' | 'top' = 'bottom',
		duration: number = 2000
	) {
		const toast = await this.toastController.create({
			message,
			position,
			duration,
			animated: true,
		});
		await toast.present();

		const { role } = await toast.onDidDismiss();
	}
}

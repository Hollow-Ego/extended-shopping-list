import { Component, Input, OnInit } from '@angular/core';

@Component({
	selector: 'pxsl1-image',
	templateUrl: './image-modal.component.html',
})
export class ImageModalComponent {
	@Input() imageUrl: string = '';
	@Input() title: string = '';

	public failedLoading = false;

	constructor() {}

	onDidLoad() {
		this.failedLoading = false;
	}

	onLoadError() {
		this.failedLoading = true;
	}
}

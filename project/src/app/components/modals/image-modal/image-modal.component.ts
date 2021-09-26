import { Component, Input, OnInit } from '@angular/core';

@Component({
	selector: 'pxsl1-image',
	templateUrl: './image-modal.component.html',
})
export class ImageModalComponent implements OnInit {
	@Input() imageUrl: string;
	@Input() title: string;

	public failedLoading = false;

	constructor() {}

	ngOnInit() {}

	onLoadError() {
		this.failedLoading = true;
	}

	onDidLoad() {
		this.failedLoading = false;
	}
}

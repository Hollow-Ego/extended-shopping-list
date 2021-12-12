import { Directive, HostBinding, Input } from '@angular/core';

@Directive({
	selector: 'img[default]',
	host: {
		'(error)': 'updateUrl()',
	},
})
export class ImagePreloadDirective {
	@HostBinding('src')
	@Input()
	src: string = '';
	@Input() default: string = 'assets/img-placeholder.png';

	updateUrl() {
		this.src = this.default;
	}
}

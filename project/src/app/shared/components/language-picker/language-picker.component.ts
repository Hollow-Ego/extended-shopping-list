import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LanguageDetails } from '../../interfaces/language-details.interface';
import { TranslationService } from '../../../services/translation.service';

@Component({
	selector: 'pxsl1-language-picker',
	templateUrl: './language-picker.component.html',
})
export class LanguagePickerComponent implements OnInit {
	@Input() language: string;
	public availableLanguages: LanguageDetails[];
	@Output() languageChange = new EventEmitter<string>();

	constructor(private translate: TranslationService) {}

	ngOnInit() {
		this.language = this.translate.currentLanguage;
		this.availableLanguages = this.translate.availableLanguages;
	}

	onLanguageChange() {
		this.languageChange.emit(this.language);
	}
}

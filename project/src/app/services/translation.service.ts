import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs/operators';
import { LanguageDetails } from '../shared/interfaces/language-details.interface';
import { SettingsService } from './settings.service';

@Injectable({
	providedIn: 'root',
})
export class TranslationService {
	private _availableLanguages: LanguageDetails[] = [
		{ name: 'English', short: 'en' },
		{ name: 'Deutsch', short: 'de' },
	];

	private _currentLanguage: string;

	get currentLanguage() {
		return this._currentLanguage;
	}

	get availableLanguages() {
		return this._availableLanguages;
	}

	constructor(
		private translate: TranslateService,
		private settingsService: SettingsService
	) {
		const languageShorts = this.availableLanguages.map(lang => lang.short);
		this._currentLanguage = this.settingsService.getLanguage();
		translate.addLangs(languageShorts);
		translate.setDefaultLang(this.settingsService.getDefaultLanguage());

		const browserLang = translate.getBrowserLang();
		this.changeLanguage(
			browserLang.match(/en|de/) ? browserLang : this._currentLanguage
		);
	}

	changeLanguage(lang: string) {
		this._currentLanguage = lang;
		this.translate.use(lang);
	}

	getTranslation(key: string) {
		return this.translate.get(key).pipe(take(1));
	}

	getTranslations(keys: string[]) {
		return this.translate.get(keys).pipe(take(1));
	}

	onLangChange() {
		return this.translate.onLangChange;
	}
}

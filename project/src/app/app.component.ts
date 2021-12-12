import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { BackButtonEvent } from '@ionic/core';
import { TranslationService } from './services/translation.service';
import { App } from '@capacitor/app';
import { Toast } from '@capacitor/toast';
import { SettingsService } from './services/settings.service';
import { SQLiteService } from './services/sqlite.service';

@Component({
	selector: 'app-root',
	templateUrl: 'app.component.html',
	styleUrls: ['app.component.scss'],
})
export class AppComponent {
	private lastOnStart = 0;
	private DOUBLE_CLICK_THRESHOLD = 2000;
	constructor(
		private platform: Platform,
		private splashScreen: SplashScreen,
		private statusBar: StatusBar,
		private translate: TranslationService,
		private settingsService: SettingsService,
		private database: SQLiteService
	) {
		this.initializeApp();
	}

	initializeApp() {
		this.platform.ready().then(() => {
			this.statusBar.styleDefault();
			this.splashScreen.hide();
			this.database.initializePlugin().then(ret => {
				console.log('>>>> in App  this.initPlugin ' + ret);
			});
			this.settingsService.settingChanges.subscribe(settings => {
				document.body.setAttribute('color-theme', settings.theme);
				this.translate.changeLanguage(settings.language);
			});

			document.addEventListener('ionBackButton', (ev: BackButtonEvent) => {
				ev.detail.register(-1, () => {
					const path = window.location.pathname;

					if (
						path === '/menu/tabs/tabs/lists' ||
						path === '/menu/tabs/tabs/library'
					) {
						this.onStartDoubleClick();
					}
				});
			});
		});
	}

	onStartDoubleClick() {
		const now = Date.now();
		if (Math.abs(now - this.lastOnStart) <= this.DOUBLE_CLICK_THRESHOLD) {
			App.exitApp();
		} else {
			this.lastOnStart = now;
			this.translate
				.getTranslation('messages.closeToast')
				.subscribe(closeToast => {
					Toast.show({ text: closeToast, duration: 'short' });
				});
		}
	}
}

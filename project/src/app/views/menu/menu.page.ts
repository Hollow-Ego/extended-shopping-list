import { Component, OnDestroy, OnInit } from '@angular/core';
import {
	ActivatedRoute,
	Router,
	RouterEvent,
	UrlSegment,
} from '@angular/router';
import { ShoppingListService } from '../../services/shopping-list.service';
import { App } from '@capacitor/app';
import { Subscription } from 'rxjs';

@Component({
	selector: 'pxsl1-menu',
	templateUrl: './menu.page.html',
	styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit, OnDestroy {
	public appVersion: string = '';
	public currentPath: string = '';

	private routeSubscription: Subscription | undefined;
	constructor(
		private route: ActivatedRoute,
		private SLService: ShoppingListService
	) {}

	ngOnInit() {
		this.route.url.subscribe((urlSegment: UrlSegment[]) => {
			this.currentPath = urlSegment.join('/');
			console.log(urlSegment);
		});
		App.getInfo()
			.then(appInfo => {
				this.appVersion = appInfo.version;
			})
			.catch(err => {
				this.appVersion = '0.0.0.0';
			});
	}

	async onAddShoppingList(): Promise<void> {
		this.SLService.addShoppingList();
	}

	ngOnDestroy() {
		if (this.routeSubscription) this.routeSubscription.unsubscribe();
	}
}

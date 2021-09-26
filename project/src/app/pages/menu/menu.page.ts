import { Component, OnInit } from '@angular/core';
import { Router, RouterEvent } from '@angular/router';
import { ShoppingListService } from '../../services/shopping-list.service';
import { App } from '@capacitor/app';

@Component({
	selector: 'pxsl1-menu',
	templateUrl: './menu.page.html',
	styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit {
	public currentPath: string = '';
	appVersion: string = '';
	constructor(private router: Router, private SLService: ShoppingListService) {}

	ngOnInit() {
		this.router.events.subscribe((event: RouterEvent) => {
			if (event && event.url) {
				this.currentPath = event.url;
			}
		});
		App.getInfo()
			.then(appInfo => {
				this.appVersion = appInfo.version;
			})
			.catch(err => {
				this.appVersion = '0.0.0.0';
			});
	}

	async onAddShoppingList() {
		this.SLService.addShoppingList();
	}
}

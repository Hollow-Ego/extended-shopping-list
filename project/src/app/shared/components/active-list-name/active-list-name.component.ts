import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ShoppingListService } from '../../../services/shopping-list.service';
import { TranslationService } from '../../../services/translation.service';

@Component({
	selector: 'pxsl1-active-list-name',
	templateUrl: './active-list-name.component.html',
})
export class ActiveListNameComponent implements OnInit, OnDestroy {
	constructor(
		private SLService: ShoppingListService,
		private translate: TranslationService
	) {}
	slServiceSubscription: Subscription | undefined;
	activeListName: string = '';
	ngOnInit() {
		this.slServiceSubscription = this.SLService.shoppingListChanges.subscribe(
			listState => {
				if (!this.slServiceSubscription) {
					return;
				}
				if (!listState) return;
				this.activeListName = listState.shoppingLists.get(
					listState.activeList
				)!.name;
			}
		);
	}

	ngOnDestroy() {
		if (this.slServiceSubscription) this.slServiceSubscription.unsubscribe();
	}
}

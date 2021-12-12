import {
	AfterViewInit,
	Component,
	OnDestroy,
	OnInit,
	ViewChild,
} from '@angular/core';
import { IonSlides } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ShoppingList } from '../../shared/classes/shopping-list.class';

import { ShoppingListService } from '../../services/shopping-list.service';
import { Mode } from '../../shared/enums/mode.enum';

@Component({
	selector: 'pxsl1-shopping-list',
	templateUrl: './shopping-list.view.html',
	styleUrls: ['./shopping-list.view.scss'],
})
export class ShoppingListView implements OnInit, OnDestroy, AfterViewInit {
	@ViewChild('slides') slides: IonSlides | undefined;

	public shoppingLists: ShoppingList[] = [];
	public activeListIdx: number = 0;

	public currentMode: string = Mode.Edit;
	private shoppingListSub: Subscription | undefined;

	constructor(private SLService: ShoppingListService) {}

	ngOnInit() {
		this.shoppingListSub = this.SLService.shoppingListChanges.subscribe(
			listState => {
				this.shoppingLists = Array.from(listState.shoppingLists.values());
				this.activeListIdx = this.shoppingLists.indexOf(
					listState.shoppingLists.get(listState.activeList)!
				);
			}
		);
	}

	ngAfterViewInit() {
		if (this.activeListIdx >= 0) this.slides?.slideTo(this.activeListIdx);
	}

	trackById(index: number, list: ShoppingList) {
		return list ? list.getListID() : undefined;
	}

	async onAddNewList() {
		const name = await this.SLService.addShoppingList();
	}

	onSlideChange($event: any) {
		this.slides?.getActiveIndex().then(idx => {
			const newListId = this.shoppingLists[idx].getListID();
			this.SLService.setActiveList(newListId);
		});
	}

	ngOnDestroy() {
		if (this.shoppingListSub) this.shoppingListSub.unsubscribe();
	}
}

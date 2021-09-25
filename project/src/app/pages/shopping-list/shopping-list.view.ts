import { Store } from '@ngrx/store';
import {
	AfterViewInit,
	Component,
	OnDestroy,
	OnInit,
	ViewChild,
} from '@angular/core';
import { IonSlides } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ItemGroup } from '../../shared/classes/item-group.class';
import { ShoppingList } from '../../shared/classes/shopping-list.class';

import * as fromApp from '../../store/app.reducer';
import * as SLActions from '../../store/shopping-list.actions';

import { ShoppingListService } from '../../services/shopping-list.service';
import { take } from 'rxjs/operators';
import { sortListByName } from '../../shared/sorting';

@Component({
	selector: 'pxsl1-shopping-list',
	templateUrl: './shopping-list.view.html',
	styleUrls: ['./shopping-list.view.scss'],
})
export class ShoppingListView implements OnInit, OnDestroy, AfterViewInit {
	@ViewChild('slides') slides: IonSlides;

	public itemGroups: Map<string, ItemGroup>;
	public shoppingLists: ShoppingList[];

	public currentMode: string;
	private stateSub: Subscription;

	constructor(
		private store: Store<fromApp.AppState>,
		private SLService: ShoppingListService
	) {}

	ngOnInit() {
		this.stateSub = this.store.select('mainState').subscribe(state => {
			if (!state) {
				return;
			}

			this.itemGroups = state.itemGroups;
			const stateListArray = Array.from(state.shoppingLists.values());
			this.shoppingLists = stateListArray.sort(sortListByName);
		});
	}

	ngAfterViewInit() {
		this.store
			.select('mainState')
			.pipe(take(1))
			.subscribe(state => {
				const latestListIdx = this.shoppingLists.indexOf(
					state.shoppingLists.get(state.currentListId)
				);
				this.slides.slideTo(latestListIdx);
			});
	}

	trackById(index: number, list) {
		return list ? list.id : undefined;
	}

	async onAddNewList() {
		const name = await this.SLService.getNewListName();
		if (!name) return;
		this.store.dispatch(SLActions.startAddShoppingList({ name }));
	}

	onSlideChange($event) {
		this.slides.getActiveIndex().then(idx => {
			const newListId = this.shoppingLists[idx].getListID();
			this.store.dispatch(
				SLActions.startSetNewCurrentList({ currentListId: newListId })
			);
		});
	}

	ngOnDestroy() {
		this.stateSub.unsubscribe();
	}
}

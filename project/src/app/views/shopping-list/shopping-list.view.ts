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
import { ShoppingListState } from '../../shared/interfaces/service.interface';

@Component({
	selector: 'pxsl1-shopping-list',
	templateUrl: './shopping-list.view.html',
	styleUrls: ['./shopping-list.view.scss'],
})
export class ShoppingListView implements OnInit, OnDestroy, AfterViewInit {
	@ViewChild('slides') slides: IonSlides | undefined;

	public activeListIdx: number = 0;
	public currentMode: string = Mode.Edit;
	public shoppingLists: ShoppingList[] = [];
	private shoppingListSub: Subscription | undefined;

	constructor(private SLService: ShoppingListService) {}

	ngOnInit() {
		this.shoppingListSub = this.SLService.shoppingListChanges.subscribe(
			(listState: ShoppingListState) => {
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

	async onAddNewList(): Promise<void> {
		await this.SLService.addShoppingList();
	}

	onSlideChange($event: any): void {
		this.slides?.getActiveIndex().then(idx => {
			const newListId = this.shoppingLists[idx].id;
			this.SLService.setActiveList(newListId);
		});
	}

	trackById(index: number, list: ShoppingList): string | undefined {
		return list ? list.id : undefined;
	}

	ngOnDestroy() {
		if (this.shoppingListSub) this.shoppingListSub.unsubscribe();
	}
}

import { Component, OnInit } from "@angular/core";
import { NavParams, ViewController } from "ionic-angular";
import { PopupService } from "../../../../shared/popup.service";
import { InfoModalComponent } from "../../../../shared/components/info-modal/info-modal";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../store/app.reducer";
import {
  DeleteSessionAction,
  RefreshAccessCodeAction
} from "../../store/dashboard.actions";
import * as moment from "moment";

@Component({
  selector: "app-session-detail-modal",
  templateUrl: "./session-detail-modal.component.html"
})
export class SessionDetailModalComponent implements OnInit {
  accountData;
  isModerator: boolean;
  isExpired: boolean;
  expirationDate;
  accessCodeLetters;

  constructor(
    private popupSvc: PopupService,
    private viewCtrl: ViewController,
    private params: NavParams,
    private store: Store<AppState>
  ) {}

  ngOnInit() {
    this.accountData = this.params.data.accountData;
    this.isModerator =
      this.params.data.accountData.userType === "Session Moderator";
    const now = moment();
    this.isExpired = now.isAfter(this.accountData.item.expirationDate);
    this.expirationDate = now.to(this.accountData.item.expirationDate);
    this.accessCodeLetters = this.accountData.item.accessCode.split("");
  }

  closeModal() {
    this.viewCtrl.dismiss();
  }

  refreshCode() {
    this.viewCtrl.dismiss();
    this.store.dispatch(
      new RefreshAccessCodeAction(this.accountData.item.sessionCode)
    );
  }

  deleteSession() {
    this.viewCtrl.dismiss();
    this.popupSvc.openModal({
      component: InfoModalComponent,
      componentProps: {
        title: "Are you sure?",
        text: "If you delete the session there is no come back.",
        label: "Delete",
        callback: () =>
          this.store.dispatch(
            new DeleteSessionAction(this.accountData.item.sessionCode)
          )
      }
    });
  }
}

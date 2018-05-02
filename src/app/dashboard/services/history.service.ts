import { Injectable } from '@angular/core';

import {
  AngularFirestore,
  AngularFirestoreCollection,
  DocumentChangeAction,
} from 'angularfire2/firestore';

import { Observable, BehaviorSubject, Subject, of } from 'rxjs';
import { tap, share, takeUntil, switchMap } from 'rxjs/operators';

import { AppFacade } from '@app/state/app.facade';
import { ScopingSession } from '@models/scoping-session';
import { HistoryItem } from '@models/history-item';

@Injectable({
  providedIn: 'root',
})
export class HistoryService {
  private refresh = new Subject<never>();
  private refresh$ = this.refresh.asObservable().pipe(share());

  private historyItemChanges = new Subject<DocumentChangeAction[]>();
  private historyItemChanges$ = this.historyItemChanges.asObservable().pipe(
    tap(changes => {
      const added = changes.filter(change => change.type === 'added');

      if (added.length) {
        this.lastDoc = added.pop().payload.doc;
      }
    }),
    share()
  );

  private lastDoc = null;
  private query: {
    field?: string;
    limit: number;
    direction: 'desc' | 'asc';
  } = { limit: 2, direction: 'desc' };

  constructor(private appFacade: AppFacade, private afs: AngularFirestore) {}

  loadHistoryItems() {
    this.refresh.next();

    this.appFacade.uid$
      .pipe(
        tap(uid => (this.query.field = `users.${uid}`)),
        switchMap(() => this.getHistoryItems())
      )
      .subscribe();

    return this.historyItemChanges$;
  }

  loadMoreHistoryItems() {
    this.getHistoryItems({ paginating: true }).subscribe();

    return this.historyItemChanges$;
  }

  getSession({ userId, connectionId, sessionId }: Partial<HistoryItem>) {
    return this.afs
      .doc<ScopingSession>(
        `users/${userId}/connections/${connectionId}/sessions/${sessionId}`
      )
      .valueChanges();
  }

  private getHistoryItems({ paginating } = { paginating: false }) {
    return this.afs
      .collection('public/sessions/links', refs => {
        const { field, direction, limit } = this.query;

        let query = refs.where(field, '>', 0).orderBy(field, direction);

        if (paginating) {
          query = query.startAfter(this.lastDoc);
        }

        return query.limit(limit);
      })
      .stateChanges()
      .pipe(
        takeUntil(this.refresh$),
        tap(changes => this.historyItemChanges.next(changes))
      );
  }
}

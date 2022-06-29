import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {UserService} from "../../services/user/user.service";
import {BaseMethodsService} from "../../services/base/base-methods.service";
import {state, style, trigger, transition, animate} from "@angular/animations";


@Component({
  selector: 'app-message-inbox',
  templateUrl: './message-inbox.component.html',
  styleUrls: ['./message-inbox.component.scss'],
  animations: [
    trigger('slideLeftToRight', [
      state('left', style({
        transform: 'translateX(-105%)'
      })),
      state('right', style({
        transform: 'translateX(0%)'
      })),
      transition('left => right', [
        animate('0.2s')
      ]),
      transition('right => left', [
        animate('0.2s')
      ])
    ])
  ]
})
export class MessageInboxComponent implements OnInit {
  message = null;
  open = false;
  isMobile: boolean = false;
  someExpression: boolean = false;
  @ViewChild('chatSender') chatSender: any;
  @ViewChild('chatMessageContainer') chatMessageContainer: any;

  constructor(public userService: UserService, private baseCtrl: BaseMethodsService) {
  }

  ngOnInit(): void {
    if (this.baseCtrl.isBrowser && window.innerWidth < 769) this.isMobile = true;
    this.userService.getMessageList();
    this.userService.getLandingContent();
  }

  onSendMessage() {
    if (this.message != null && this.message != "") {
      const p = {
        ChatId: this.userService.chosenInbox.ChatId,
        Message: this.message,
        ToUserName: this.userService.chosenInbox.ChatCreatedUserName,
        IsFromLoggedUser: true
      };
      if (this.baseCtrl.isBrowser) this.userService.socket.emit("Message", p);
      this.userService.chosenInbox.Messages.push(p);
      this.userService.chosenInbox.LastMessageDate = this.baseCtrl.now();
      this.userService.inbox.sort(function (o1, o2) {
        return o2.LastMessageDate ? -1 : o1.LastMessageDate ? 1 : 0;

      });
      this.userService.inbox.sort((val1, val2) => {
        // @ts-ignore
        return new Date(val2.LastMessageDate) - new Date(val1.LastMessageDate)
      });

      this.message = null;
      this.gotoEndOfToScreen();
    }
  }

  onChooseUser(ib: any) {
    this.open = !this.open;
    this.userService.chosenInbox = ib;
    this.gotoEndOfToScreen();
  }

  gotoEndOfToScreen() {
    var objDiv = document.getElementById("chatBox");
    if (objDiv != null) {
      objDiv.scrollTop = objDiv?.scrollHeight;
    }
  }

  onDeleteChat() {
    const params = {
      ChatId: this.userService.chosenInbox?.ChatId
    }
    this.userService.deleteChat(params);
    let index = this.userService.inbox.findIndex(x => x.ChatId = params.ChatId);
    this.userService.inbox.splice(index, 1);
    this.userService.chosenInbox = null;
    this.onTurnToMessageList();
  }

  onBlockUser() {
    const params = {
      BlockedUserName: this.userService.chosenInbox?.ChatCreatedUserName
    }
    this.userService.blockUserByUser(params);
    let index = this.userService.inbox.findIndex(x => x.ChatId = this.userService.chosenInbox?.ChatId);
    this.userService.inbox.splice(index, 1);
    this.userService.chosenInbox = null;
    this.onTurnToMessageList();
  }

  onTurnToMessageList() {
    this.open = !this.open;
  }

  animationDone() {
    if (!this.open) this.userService.chosenInbox = null;
  }
}
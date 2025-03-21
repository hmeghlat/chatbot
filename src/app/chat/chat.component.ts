import { Component } from '@angular/core';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {
  messages = [
    { text: "Hi, I’m Hori, nice to meet you !", sender: "bot" }
  ];
  
  newMessage: string = '';

  sendMessage() {
    if (this.newMessage.trim() !== '') {
      this.messages.push({ text: this.newMessage, sender: "user" });
      this.newMessage = '';
    }
  }
}

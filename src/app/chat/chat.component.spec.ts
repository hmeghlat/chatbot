import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { CookieService } from 'ngx-cookie-service';
import { MarkdownModule } from 'ngx-markdown';

import { ChatComponent } from './chat.component';
import { ChatService } from '../services/chat.service';
import { ReportService } from '../services/report.service';
import { ChatSessionService } from '../services/chat-session.service';

describe('ChatComponent', () => {
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ChatComponent,
        HttpClientTestingModule,
        RouterTestingModule,
        NoopAnimationsModule,
        MatDialogModule,
        MarkdownModule.forRoot()
      ],
      providers: [
        ChatService,
        ReportService,
        ChatSessionService,
        CookieService
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

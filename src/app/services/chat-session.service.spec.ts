import { TestBed } from '@angular/core/testing';
import { ChatSessionService } from './chat-session.service';

describe('ChatSessionService', () => {
  let service: ChatSessionService;
  let getItemSpy: jasmine.Spy;
  let setItemSpy: jasmine.Spy;

  const mockMessages = [
    { text: 'Hello', sender: 'user' as const },
    { text: 'Hi there!', sender: 'bot' as const }
  ];

  beforeEach(() => {
    // Mock localStorage
    getItemSpy = spyOn(localStorage, 'getItem');
    setItemSpy = spyOn(localStorage, 'setItem');
    
    // Valeur par défaut
    getItemSpy.and.returnValue(null);

    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatSessionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Guest mode management', () => {
    it('should set guest mode and save to localStorage', () => {
      service.setGuestMode(true);
      expect(service.isGuestMode()).toBeTrue();
      expect(setItemSpy).toHaveBeenCalledWith('guestMode', 'true');
      
      service.setGuestMode(false);
      expect(service.isGuestMode()).toBeFalse();
      expect(setItemSpy).toHaveBeenCalledWith('guestMode', 'false');
    });

    it('should load guest mode from localStorage on construction', () => {
      // Réinitialiser pour ce test spécifique
      TestBed.resetTestingModule();
      
      // Configurer avant de créer le service
      getItemSpy.and.returnValue('true');
      
      // Créer un nouveau service avec la mock prête
      const newService = TestBed.configureTestingModule({}).inject(ChatSessionService);
      
      expect(newService.isGuestMode()).toBeTrue();
      expect(getItemSpy).toHaveBeenCalledWith('guestMode');
    });
  });

  describe('Messages management', () => {
    it('should save and retrieve messages', () => {
      service.saveMessages(mockMessages);
      const retrievedMessages = service.getMessages();
      
      expect(retrievedMessages).toEqual(mockMessages);
    });

    it('should clear session and reset all values except guest mode', () => {
      // Setup initial state
      service.saveMessages(mockMessages);
      service.setConversationFinalized(true);
      service.setConversationId('123');
      service.saveWordCount(100);
      service.setGuestMode(true);
      
      // Clear session
      service.clearSession();
      
      // Verify all values are reset
      expect(service.getMessages()).toEqual([]);
      expect(service.isConversationFinalized()).toBeFalse();
      expect(service.getConversationId()).toBeNull();
      
      // But guest mode should remain unchanged
      expect(service.isGuestMode()).toBeTrue();
    });
  });

  describe('Conversation state management', () => {
    it('should set and get conversation finalized state', () => {
      service.setConversationFinalized(true);
      expect(service.isConversationFinalized()).toBeTrue();
      
      service.setConversationFinalized(false);
      expect(service.isConversationFinalized()).toBeFalse();
    });

    it('should set and get conversation ID', () => {
      const testId = '12345';
      service.setConversationId(testId);
      expect(service.getConversationId()).toBe(testId);
      
      service.setConversationId(null);
      expect(service.getConversationId()).toBeNull();
    });
  });

  describe('Word count management', () => {
    it('should save and retrieve word count', () => {
      const count = 150;
      service.saveWordCount(count);
      expect(service.getWordCount()).toBe(count);
    });
  });
});

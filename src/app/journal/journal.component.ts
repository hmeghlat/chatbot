import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, style, animate, transition } from '@angular/animations';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

interface JournalEntry {
  date: Date;
  text: string;
}
interface KingdomOfThree {
  thingsILikeAboutMe: string[];
  thingsIWantToChangeAboutMe: string[];
  thingsThatMakeMeHappy: string[];
  thingsThatGiveMeaning: string[];
  thingsIWantToChangeInLife: string[];
}
interface MotivationData {
  confidenceSource: string;
  excitingThings: string;
  neverGiveUpOn: string;
  heartSays: string;
  headSays: string;
  holdOnTo: string;
  effortTriggers: string;
  drivingFear: string;
  motivatingGoal: string;
}
interface GoalsData {
  health: string;
  financial: string;
  family: string;
  personal: string;
  learning: string;
  development: string;
  environment: string;
  friendship: string;
  career: string;
  creative: string;
}
interface ResolutionsData {
  small: string;
  smallStep: string;
  big: string;
  bigStep: string;
}
type WordsSnapshot = { date: Date; data: string[] };



@Component({
  selector: 'app-journal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [CookieService],
  templateUrl: './journal.component.html',
  styleUrls: ['./journal.component.scss'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})


export class JournalComponent implements OnInit {
  entryText: string = '';
  entries: JournalEntry[] = [];

  emotionsList = [
    { prompt: 'I am angry because', response: '' },
    { prompt: 'What annoys me is', response: '' },
    { prompt: 'I am frustrated due to', response: '' }
  ];

  rationalList = ['Analytical', 'Truth', 'Rational', 'Theoretical', 'Fault finder'];
  intuitiveList = ['Artistic', 'Passionate', 'Ethical', 'Sensitive', 'Empathic'];
  associations = [
    { label: 'Love', response: '' },
    { label: 'Desire', response: '' },
    { label: 'Hope', response: '' }
  ];

  tenWords: string[] = [];
  currentWord: string = '';
  maxWords: number = 10;

  
  kingdomOfThree: KingdomOfThree = {
    thingsILikeAboutMe: ['', '', ''],
    thingsIWantToChangeAboutMe: ['', '', ''],
    thingsThatMakeMeHappy: ['', '', ''],
    thingsThatGiveMeaning: ['', '', ''],
    thingsIWantToChangeInLife: ['', '', '']
  };

  motivation: MotivationData = {
    confidenceSource: '',
    excitingThings: '',
    neverGiveUpOn: '',
    heartSays: '',
    headSays: '',
    holdOnTo: '',
    effortTriggers: '',
    drivingFear: '',
    motivatingGoal: ''
  };

  objectives: GoalsData = {
    health: '', financial: '', family: '', personal: '',
    learning: '', development: '', environment: '',
    friendship: '', career: '', creative: ''
  };

  resolutions: ResolutionsData = {
    small: '',
    smallStep: '',
    big: '',
    bigStep: ''
  };
  
  

// 1. Les clés de ton Kingdom
kingdomFields: (keyof KingdomOfThree)[] = [
  'thingsILikeAboutMe',
  'thingsIWantToChangeAboutMe',
  'thingsThatMakeMeHappy',
  'thingsThatGiveMeaning',
  'thingsIWantToChangeInLife'
];

// 2. Les titres correspondants
kingdomTitles: string[] = [
  '3 things I like the most about myself:',
  '3 things I would like to change about myself:',
  '3 things that make me happy:',
  '3 things that give meaning to my life:',
  '3 things I would like to change in my life:'
];


// Clés et titres pour itération
goalsFields: (keyof GoalsData)[] = [
  'health','financial','family','personal',
  'learning','development','environment',
  'friendship','career','creative'
];
goalsTitles: string[] = [
  'Health goal:','Financial goal:','Family goal:','Personal goal:',
  'Learning goal:','Development goal:','Environmental goal:',
  'Friendship goal:','Career goal:','Creative goal:'
];

  projection = Array.from({ length: 10 }, () => '');

  //liste d’entrées guidées
  emotionEntries: { date: Date; responses: string[] }[] = [];
  associationEntries: { date: Date; responses: string[] }[] = [];
  kingdomEntries: { date: Date; data: KingdomOfThree }[] = [];
  motivationEntries: { date: Date; data: MotivationData }[] = [];
  goalsEntries: { date: Date; data: GoalsData }[] = [];
  resolutionsEntries: { date: Date; data: ResolutionsData }[] = [];
  projectionEntries: { date: Date; data: string[] }[] = [];
  tenWordsEntries: WordsSnapshot[] = [];
  

  
    constructor(
      private router: Router,
    ) {}
  


  ngOnInit(): void {
    const saved = (key: string) => localStorage.getItem(key);
    if (saved('journalEntries')) this.entries = JSON.parse(saved('journalEntries')!);
    if (saved('journalTenWords')) this.tenWords = JSON.parse(saved('journalTenWords')!);
    if (saved('kingdomOfThree')) this.kingdomOfThree = JSON.parse(saved('kingdomOfThree')!);
    if (saved('motivationSection')) this.motivation = JSON.parse(saved('motivationSection')!);
    if (saved('objectives')) this.objectives = JSON.parse(saved('objectives')!);
    if (saved('resolutions')) this.resolutions = JSON.parse(saved('resolutions')!);
    if (saved('projection10Years')) this.projection = JSON.parse(saved('projection10Years')!);
    if (saved('emotionsList')) this.emotionsList = JSON.parse(saved('emotionsList')!);
    if (saved('associationResponses')) this.associations = JSON.parse(saved('associationResponses')!);

    const savedEmotionEntries = localStorage.getItem('emotionEntries');
    if (savedEmotionEntries) {
      // Dates doivent être revues en Date
      this.emotionEntries = JSON.parse(savedEmotionEntries).map((e: any) => ({
        date: new Date(e.date),
        responses: e.responses
      }));
    }

    const savedAssocEntries = localStorage.getItem('associationEntries');
    if (savedAssocEntries) {
    this.associationEntries = JSON.parse(savedAssocEntries)
      .map((e: any) => ({ date: new Date(e.date), responses: e.responses }));
    }
    const savedKingdom = localStorage.getItem('kingdomEntries');
    if (savedKingdom) {
      this.kingdomEntries = JSON.parse(savedKingdom)
        .map((e: any) => ({
          date: new Date(e.date),
          data: e.data
        }));
    }
    const savedMotEntries = localStorage.getItem('motivationEntries');
    if (savedMotEntries) {
      this.motivationEntries = JSON.parse(savedMotEntries).map((e: any) => ({
        date: new Date(e.date),
        data: e.data as MotivationData
      }));
    }

    const rawGoals = localStorage.getItem('goalsEntries');
  if (rawGoals) {
    this.goalsEntries = JSON.parse(rawGoals)
      .map((e: any) => ({ date: new Date(e.date), data: e.data as GoalsData }));
  }

  // (Optionnel) recharge l’état courant
  const savedObj = localStorage.getItem('objectives');
  if (savedObj) {
    this.objectives = JSON.parse(savedObj);
  }

  // --- Resolutions Entries ---
  const rawRes = localStorage.getItem('resolutionsEntries');
  if (rawRes) {
    this.resolutionsEntries = JSON.parse(rawRes)
      .map((e: any) => ({ date: new Date(e.date), data: e.data as ResolutionsData }));
  }

  // (Optionnel) recharge l’état courant
  const savedRes = localStorage.getItem('resolutions');
  if (savedRes) {
    this.resolutions = JSON.parse(savedRes);
  }

  const rawProjEntries = localStorage.getItem('projectionEntries');
  if (rawProjEntries) { 
  this.projectionEntries = JSON.parse(rawProjEntries)
    .map((e: any) => ({ date: new Date(e.date), data: e.data as string[] }));

  // reload des listes sauvegardées
  const savedList = localStorage.getItem('journalTenWords');
  if (savedList) {
    this.tenWords = JSON.parse(savedList);
  }

  // reload de l’historique
  const rawEntries = localStorage.getItem('tenWordsEntries');
  if (rawEntries) {
    this.tenWordsEntries = JSON.parse(rawEntries)
      .map((e: any) => ({ date: new Date(e.date), data: e.data }));
  }
  
}
  }
  trackByIndex(index: number, item: any): number {
    return index;
  }
  // Journal libre
  saveEntry(): void {
    const trimmed = this.entryText.trim();
    if (trimmed) {
      this.entries.unshift({ date: new Date(), text: trimmed });
      this.entryText = '';
      this.saveEntries();
    }
  }
  clearEntry(): void {
    this.entryText = '';
  }
  saveEntries(): void {
    localStorage.setItem('journalEntries', JSON.stringify(this.entries));
  }
  resetEntries(): void {
    this.entries = [];
    localStorage.removeItem('journalEntries');
  }
  

  // 10 mots
  addWord(): void {
  const trimmed = this.currentWord.trim();
  if (trimmed && this.tenWords.length < this.maxWords) {
    this.tenWords.push(trimmed);
    this.currentWord = '';
  }
}
removeWord(index: number): void {
  this.tenWords.splice(index, 1);
}

// on ne persiste plus à chaque frappe mais au clic Save
saveWords(): void {
  // construit un clone de la liste courante
  const snapshot = [...this.tenWords];
  // ajoute en tête de l’historique
  this.tenWordsEntries.unshift({
    date: new Date(),
    data: snapshot
  });
  // persiste l’historique + la liste courante
  localStorage.setItem('tenWordsEntries', JSON.stringify(this.tenWordsEntries));
  localStorage.setItem('journalTenWords', JSON.stringify(this.tenWords));

  // reset live
  this.projection = Array.from({ length: 20 }, () => '');
  localStorage.removeItem('projection10Years');
}

resetWords(): void {
  // reset de la liste courante
  this.tenWords = [];
  this.currentWord = '';
  localStorage.removeItem('journalTenWords');

  // reset de l’historique
  this.tenWordsEntries = [];
  localStorage.removeItem('tenWordsEntries');
}

  // Emotions
  saveEmotions(): void {
    // on prend un snapshot des réponses courantes
    this.emotionEntries.unshift({
      date: new Date(),
      responses: this.emotionsList.map(e => e.response)
    });
    // on stocke tout
    localStorage.setItem('emotionEntries', JSON.stringify(this.emotionEntries));
    this.emotionsList.forEach(item => item.response = '');
    localStorage.removeItem('emotionsList');
  }
  resetEmotions(): void {
    // on vide les champs
    this.emotionsList = [
      { prompt: 'I am angry because', response: '' },
      { prompt: 'What annoys me is', response: '' },
      { prompt: 'I am frustrated due to', response: '' }
    ];
    // et on vide l’historique
    this.emotionEntries = [];
    localStorage.removeItem('emotionsList');
    localStorage.removeItem('emotionEntries');
  }

  

  // Associations
  saveAssociations(): void {
    // On prend un snapshot des réponses courantes
    this.associationEntries.unshift({
      date: new Date(),
      responses: this.associations.map(a => a.response)
    });
    // On stocke aussi l’historique complet
    localStorage.setItem('associationEntries', JSON.stringify(this.associationEntries));

    this.associations.forEach(a => a.response = '');
    localStorage.removeItem('associationResponses');
  }
  resetAssociations(): void {
    this.associations = [
      { label: 'Love', response: '' },
      { label: 'Desire', response: '' },
      { label: 'Hope', response: '' }
    ];
    this.associationEntries = [];
    localStorage.removeItem('associationResponses');
    localStorage.removeItem('associationEntries');
  }
  
  

  // Kingdom
  saveKingdomOfThree(): void {
    // Deep‐clone de kingdomOfThree
    const snapshotData: KingdomOfThree = {
      thingsILikeAboutMe: [...this.kingdomOfThree.thingsILikeAboutMe],
      thingsIWantToChangeAboutMe: [...this.kingdomOfThree.thingsIWantToChangeAboutMe],
      thingsThatMakeMeHappy: [...this.kingdomOfThree.thingsThatMakeMeHappy],
      thingsThatGiveMeaning: [...this.kingdomOfThree.thingsThatGiveMeaning],
      thingsIWantToChangeInLife: [...this.kingdomOfThree.thingsIWantToChangeInLife],
    };
  
    // On insère ce clone dans l’historique
    this.kingdomEntries.unshift({
      date: new Date(),
      data: snapshotData
    });
  
    // On persiste l’historique et l’état courant si besoin
    localStorage.setItem('kingdomEntries', JSON.stringify(this.kingdomEntries));
    localStorage.setItem('kingdomOfThree', JSON.stringify(this.kingdomOfThree));

    this.kingdomFields.forEach(f => this.kingdomOfThree[f] = ['', '', '']);
    localStorage.removeItem('kingdomOfThree');
  }
  
  
  resetKingdomOfThree(): void {
    this.kingdomOfThree = {
      thingsILikeAboutMe: ['', '', ''],
      thingsIWantToChangeAboutMe: ['', '', ''],
      thingsThatMakeMeHappy: ['', '', ''],
      thingsThatGiveMeaning: ['', '', ''],
      thingsIWantToChangeInLife: ['', '', '']
    };
    this.kingdomEntries = [];
    localStorage.removeItem('kingdomEntries');
    localStorage.removeItem('kingdomOfThree');
  }
  
  
  
  hasResponses(array: string[]): boolean {
    return array.some(item => item.trim() !== '');
  }
  
  

  // Motivation
  saveMotivation(): void {
    // deep clone de l’objet motivation
    const snapshot: MotivationData = JSON.parse(JSON.stringify(this.motivation));
    this.motivationEntries.unshift({ date: new Date(), data: snapshot });
    localStorage.setItem('motivationEntries', JSON.stringify(this.motivationEntries));
    localStorage.setItem('motivationSection', JSON.stringify(this.motivation));

    Object.keys(this.motivation).forEach(k => (this.motivation as any)[k] = '');
    localStorage.removeItem('motivationSection');
  }
  
  resetMotivation(): void {
    Object.keys(this.motivation).forEach(k => (this.motivation as any)[k] = '');
    this.motivationEntries = [];
    localStorage.removeItem('motivationSection');
    localStorage.removeItem('motivationEntries');
  }
  

  // Objectifs
  saveGoals(): void {
    const snapshot: GoalsData = JSON.parse(JSON.stringify(this.objectives));
    this.goalsEntries.unshift({ date: new Date(), data: snapshot });
    localStorage.setItem('goalsEntries', JSON.stringify(this.goalsEntries));
    localStorage.setItem('objectives', JSON.stringify(this.objectives));

    this.goalsFields.forEach(field => {
      this.objectives[field] = '';
    });
  }

  resetGoals(): void {
    this.goalsFields.forEach(f => this.objectives[f] = '');
    this.goalsEntries = [];
    localStorage.removeItem('objectives');
    localStorage.removeItem('goalsEntries');
  }
  // Objectifs individuels
  onObjectiveChange(key: keyof GoalsData, value: string): void {
    this.objectives[key] = value;
  }

  // Résolutions
  saveResolutions(): void {
    // Deep-clone de l’objet résolutions
    const snapshot: ResolutionsData = JSON.parse(JSON.stringify(this.resolutions));
    
    // On ajoute en tête du tableau
    this.resolutionsEntries.unshift({
      date: new Date(),
      data: snapshot
    });
  
    // On persiste l’historique et l’état courant
    localStorage.setItem('resolutionsEntries', JSON.stringify(this.resolutionsEntries));
    localStorage.setItem('resolutions', JSON.stringify(this.resolutions));

    // reset live
    Object.keys(this.resolutions)
   .forEach(k => (this.resolutions as any)[k] = '');
    localStorage.removeItem('resolutions');
  }
  resetResolutions(): void {
    // On efface les champs “live”
    Object.keys(this.resolutions)
      .forEach(k => (this.resolutions as any)[k] = '');
  
    // On vide l’historique
    this.resolutionsEntries = [];
  
    // On supprime du localStorage
    localStorage.removeItem('resolutions');
    localStorage.removeItem('resolutionsEntries');
  }
  

  // Projection
  saveProjection(): void {
    // clone profond du tableau actuel
    const snapshot = [...this.projection];
    this.projectionEntries.unshift({
      date: new Date(),
      data: snapshot
    });
    // persistance
    localStorage.setItem('projectionEntries', JSON.stringify(this.projectionEntries));
    localStorage.setItem('projection10Years', JSON.stringify(this.projection));

    // reset live
  this.projection = Array.from({ length: 10 }, () => '');
  localStorage.removeItem('projection10Years');
  }
  resetProjection(): void {
    this.projection = Array.from({ length: 10 }, () => '');
    this.projectionEntries = [];
    localStorage.removeItem('projection10Years');
    localStorage.removeItem('projectionEntries');
  }

  goToChat() {
    this.router.navigate(['/chat']);
  }
}

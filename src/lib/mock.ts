// All påhittad demodata bor här. Inga riktiga personer, inga riktiga foton.
// Tider anges relativt "nu" (i minuter) så att demon alltid ser levande ut.

export type Season = 'vinter' | 'vår' | 'sommar' | 'höst';
export type Weather = 'sol' | 'moln' | 'regn' | 'snö';
export type Holiday =
	| 'allhelgona'
	| 'lucia'
	| 'jul'
	| 'nyår'
	| 'påsk'
	| 'valborg'
	| 'midsommar'
	| 'kräftskiva';
export type Presence = 'on' | 'away' | 'off';

// ---------------------------------------------------------------- Användare

export interface User {
	id: string;
	name: string;
	area: string;
	status: string;
	presence: Presence;
	age: number;
	song: string;
	about: string;
	topPlaces: string[];
	topFriends: string[];
	color: string;
	joined: string;
	mod?: boolean;
}

export const users: User[] = [
	{
		id: 'gubben940',
		name: 'Gubben940',
		area: 'Skiljebo',
		status: 'Har kaffe på. Någon som vill gå runt Djäkneberget?',
		presence: 'on',
		age: 52,
		song: 'Dansbandet Svartåns – Kom hem till Västerås (1998)',
		about:
			'Uppvuxen på Skiljebo, jobbade på verkstan i trettio år. Gillar korvgrillning, gamla mopeder och att prata med folk. Startade söndagspromenaderna för att jag tröttnade på att bara se grannarna på Facebook-grupper. Säg hej om du ser mig vid grillplatsen!',
		topPlaces: ['djakneberget', 'bjorno', 'vasaparken', 'framnas', 'anundshog', 'lovudden', 'halla', 'kokpunkten'],
		topFriends: ['matteok', 'sannas', 'erik-pa-raby', 'linnea-l', 'backby-pelle', 'johanna-v', 'fotofredrik', 'mopedmia'],
		color: '#3a6ea5',
		joined: 'mars 2026'
	},
	{
		id: 'matteok',
		name: 'MatteoK',
		area: 'Viksäng',
		status: 'brännboll på söndag?? säg till!!',
		presence: 'on',
		age: 27,
		song: 'Lokalbandet Tegelbruket – Sista bussen från Centrum',
		about: 'Spelar innebandy, äter för mycket bullar. Flyttade hit för jobbet och känner fortfarande typ fem personer. Ändra på det!',
		topPlaces: ['vasaparken', 'lovudden', 'framnas', 'kokpunkten', 'djakneberget', 'halla', 'bjorno', 'anundshog'],
		topFriends: ['gubben940', 'sannas', 'johanna-v', 'erik-pa-raby', 'elinb', 'hampus-o', 'fotofredrik', 'linnea-l'],
		color: '#a5543a',
		joined: 'april 2026'
	},
	{
		id: 'sannas',
		name: 'SannaS',
		area: 'Vallby',
		status: 'nattbad imorgon om vattnet inte är för kallt brr',
		presence: 'away',
		age: 34,
		song: 'Kören Mälarstämmor – Höstvisa',
		about: 'Sjuksköterska, kallbadare och evig optimist. Jag tror på att man ska säga ja oftare.',
		topPlaces: ['framnas', 'bjorno', 'lovudden', 'vasaparken', 'anundshog', 'djakneberget', 'halla', 'kokpunkten'],
		topFriends: ['johanna-v', 'linnea-l', 'gubben940', 'matteok', 'elinb', 'sofia-bjurhovda', 'kicki61', 'fotofredrik'],
		color: '#7a3aa5',
		joined: 'mars 2026'
	},
	{
		id: 'erik-pa-raby',
		name: 'Erik_på_Råby',
		area: 'Råby',
		status: 'fixar cykeln, kom förbi om du har en 13:a',
		presence: 'on',
		age: 41,
		song: 'Garagebandet Rostfritt – Tisdagsblues',
		about: 'Pappa till två, cykelnörd. Har ett förråd fullt av verktyg som någon annan borde få användning av.',
		topPlaces: ['vasaparken', 'djakneberget', 'halla', 'bjorno', 'lovudden', 'framnas', 'anundshog', 'kokpunkten'],
		topFriends: ['gubben940', 'backby-pelle', 'mopedmia', 'matteok', 'tobbe-tillberga', 'nisse-irsta', 'hampus-o', 'johanna-v'],
		color: '#3aa55e',
		joined: 'maj 2026'
	},
	{
		id: 'linnea-l',
		name: 'Linnea.L',
		area: 'Kristiansborg',
		status: 'stickar en halsduk som aldrig blir klar',
		presence: 'on',
		age: 29,
		song: 'Syskonen Ek – Pappersbåtar',
		about: 'Bibliotekarie, syr om gamla kläder och samlar på gamla vykort från Västerås.',
		topPlaces: ['vasaparken', 'anundshog', 'djakneberget', 'framnas', 'bjorno', 'lovudden', 'halla', 'kokpunkten'],
		topFriends: ['sannas', 'johanna-v', 'gubben940', 'rut-rocklunda', 'elinb', 'kicki61', 'fotofredrik', 'matteok'],
		color: '#a53a6e',
		joined: 'mars 2026'
	},
	{
		id: 'backby-pelle',
		name: 'Bäckby-Pelle',
		area: 'Bäckby',
		status: 'vinyl på lördag, ta med en skiva du skäms över',
		presence: 'away',
		age: 58,
		song: 'Orkester Västerbro – Twist på Folkets park',
		about: 'Har bott på Bäckby sedan 1974. Spelar skivor, lagar mat till för många och vet var alla bra fiskeställen är.',
		topPlaces: ['lovudden', 'bjorno', 'djakneberget', 'vasaparken', 'framnas', 'anundshog', 'halla', 'kokpunkten'],
		topFriends: ['gubben940', 'erik-pa-raby', 'nisse-irsta', 'kicki61', 'tobbe-tillberga', 'mopedmia', 'rut-rocklunda', 'linnea-l'],
		color: '#a58f3a',
		joined: 'mars 2026'
	},
	{
		id: 'johanna-v',
		name: 'Johanna_V',
		area: 'Hammarby',
		status: 'någon som vill spela Alfapet ikväll?',
		presence: 'on',
		age: 31,
		song: 'Ljudbandet Kvällsljus – Mälarnatt',
		about: 'Brädspelsfantast. Har över 80 spel hemma och vill att de ska spelas.',
		topPlaces: ['vasaparken', 'halla', 'framnas', 'djakneberget', 'lovudden', 'bjorno', 'anundshog', 'kokpunkten'],
		topFriends: ['linnea-l', 'sannas', 'matteok', 'gubben940', 'hampus-o', 'elinb', 'fotofredrik', 'sofia-bjurhovda'],
		color: '#3a9aa5',
		joined: 'april 2026'
	},
	{
		id: 'fotofredrik',
		name: 'FotoFredrik',
		area: 'Kungsängen',
		status: 'dimman över Mälaren i morse alltså',
		presence: 'off',
		age: 45,
		song: 'Duon Silverhavet – Kamerans öga',
		about: 'Fotograferar allt som rör sig och allt som inte gör det. Lånar gärna ut gamla kameror.',
		topPlaces: ['framnas', 'anundshog', 'bjorno', 'lovudden', 'djakneberget', 'vasaparken', 'kokpunkten', 'halla'],
		topFriends: ['gubben940', 'linnea-l', 'sannas', 'mopedmia', 'johanna-v', 'elinb', 'matteok', 'backby-pelle'],
		color: '#5b5ba5',
		joined: 'maj 2026'
	},
	{
		id: 'mopedmia',
		name: 'Mopedmia',
		area: 'Pettersberg',
		status: 'garaget är öppet, däckbyte hela dagen',
		presence: 'on',
		age: 24,
		song: 'Tvåtaktarna – Puch i solnedgången',
		about: 'Mekar med mopeder och gamla bilar. Lär gärna ut, men du får hålla i skiftnyckeln själv.',
		topPlaces: ['halla', 'lovudden', 'djakneberget', 'vasaparken', 'bjorno', 'framnas', 'anundshog', 'kokpunkten'],
		topFriends: ['erik-pa-raby', 'gubben940', 'backby-pelle', 'tobbe-tillberga', 'hampus-o', 'fotofredrik', 'matteok', 'nisse-irsta'],
		color: '#a53a3a',
		joined: 'juni 2026'
	},
	{
		id: 'tobbe-tillberga',
		name: 'Tobbe_i_Tillberga',
		area: 'Tillberga',
		status: 'ny här! hej!',
		presence: 'on',
		age: 38,
		song: 'Bygdens Blåsorkester – Marsch för Tillberga',
		about: 'Nyinflyttad från Norrland. Söker folk att fiska och grilla med.',
		topPlaces: ['lovudden', 'bjorno', 'framnas', 'djakneberget', 'vasaparken', 'anundshog', 'halla', 'kokpunkten'],
		topFriends: ['erik-pa-raby', 'mopedmia', 'backby-pelle', 'nisse-irsta', 'gubben940', 'matteok', 'hampus-o', 'kicki61'],
		color: '#3a7aa5',
		joined: 'november 2026'
	},
	{
		id: 'kicki61',
		name: 'Kicki61',
		area: 'Vallby',
		status: 'korsordet är löst, nu kaffe',
		presence: 'away',
		age: 65,
		song: 'Sångerskan Margit – Vals vid Mälaren',
		about: 'Pensionerad lärare. Bjuder på kaffe på altanen om ni hjälper till med korsordet.',
		topPlaces: ['anundshog', 'vasaparken', 'djakneberget', 'framnas', 'bjorno', 'lovudden', 'halla', 'kokpunkten'],
		topFriends: ['linnea-l', 'sannas', 'backby-pelle', 'rut-rocklunda', 'gubben940', 'johanna-v', 'elinb', 'sofia-bjurhovda'],
		color: '#8a5a3a',
		joined: 'mars 2026'
	},
	{
		id: 'hampus-o',
		name: 'Hampus.Ö',
		area: 'Haga',
		status: 'LAN hos mig fredag, ta med egen sladd',
		presence: 'off',
		age: 22,
		song: 'Chiptune-Kalle – Level 940',
		about: 'Pluggar data, spelar gamla spel, äger fortfarande en tjock-tv.',
		topPlaces: ['halla', 'vasaparken', 'kokpunkten', 'lovudden', 'djakneberget', 'framnas', 'bjorno', 'anundshog'],
		topFriends: ['matteok', 'johanna-v', 'mopedmia', 'erik-pa-raby', 'elinb', 'tobbe-tillberga', 'fotofredrik', 'gubben940'],
		color: '#3aa58f',
		joined: 'augusti 2026'
	},
	{
		id: 'elinb',
		name: 'ElinB',
		area: 'Centrum',
		status: 'löprunda runt Svartån 18:00, långsamt tempo',
		presence: 'on',
		age: 26,
		song: 'Popgruppen Juni – Cykla hem',
		about: 'Springer långsamt och pratar mycket. Vill hitta folk som gillar både löpning och bullar efteråt.',
		topPlaces: ['framnas', 'vasaparken', 'lovudden', 'djakneberget', 'bjorno', 'anundshog', 'halla', 'kokpunkten'],
		topFriends: ['sannas', 'matteok', 'linnea-l', 'johanna-v', 'sofia-bjurhovda', 'hampus-o', 'kicki61', 'gubben940'],
		color: '#a5703a',
		joined: 'maj 2026'
	},
	{
		id: 'rut-rocklunda',
		name: 'Rut_på_Rocklunda',
		area: 'Rocklunda',
		status: 'bakar till söndagsfikat',
		presence: 'off',
		age: 71,
		song: 'Kapellet Gammeldans – Rocklundapolkan',
		about: 'Har sett Västerås växa. Berättar gärna hur det var förr, om ni lovar att berätta hur det är nu.',
		topPlaces: ['anundshog', 'vasaparken', 'djakneberget', 'framnas', 'bjorno', 'lovudden', 'halla', 'kokpunkten'],
		topFriends: ['kicki61', 'linnea-l', 'backby-pelle', 'gubben940', 'sannas', 'johanna-v', 'elinb', 'nisse-irsta'],
		color: '#6e3aa5',
		joined: 'mars 2026'
	},
	{
		id: 'nisse-irsta',
		name: 'Nisse_Irsta',
		area: 'Irsta',
		status: 'abborren nappar vid Lövudden',
		presence: 'away',
		age: 49,
		song: 'Trubaduren från Irsta – Flötet',
		about: 'Fiskar året runt. Har extra spön för den som vill testa.',
		topPlaces: ['lovudden', 'bjorno', 'framnas', 'anundshog', 'djakneberget', 'vasaparken', 'halla', 'kokpunkten'],
		topFriends: ['backby-pelle', 'tobbe-tillberga', 'erik-pa-raby', 'gubben940', 'mopedmia', 'rut-rocklunda', 'kicki61', 'hampus-o'],
		color: '#3a5ea5',
		joined: 'juni 2026'
	},
	{
		id: 'sofia-bjurhovda',
		name: 'Sofia_Bjurhovda',
		area: 'Bjurhovda',
		status: 'någon som vill gå på konstmuseet på lördag?',
		presence: 'on',
		age: 36,
		song: 'Stråkkvartetten Kåre – Novemberljus',
		about: 'Illustratör. Ritar folk på kaféer (med lov!).',
		topPlaces: ['vasaparken', 'anundshog', 'framnas', 'djakneberget', 'bjorno', 'lovudden', 'halla', 'kokpunkten'],
		topFriends: ['sannas', 'elinb', 'johanna-v', 'linnea-l', 'kicki61', 'fotofredrik', 'matteok', 'gubben940'],
		color: '#a53a8f',
		joined: 'juli 2026'
	},
	{
		id: 'anna-mod',
		name: 'Anna_Mod',
		area: 'Västerås',
		status: 'kollar kön, återkommer!',
		presence: 'on',
		age: 44,
		song: 'Kören Mälarstämmor – Vi ses vid ån',
		about: 'Frivillig moderator. Jag tar bort så lite som möjligt och förklarar alltid varför.',
		topPlaces: ['vasaparken', 'djakneberget', 'framnas', 'bjorno', 'anundshog', 'lovudden', 'halla', 'kokpunkten'],
		topFriends: ['gubben940', 'linnea-l', 'kicki61', 'sannas', 'johanna-v', 'rut-rocklunda', 'elinb', 'matteok'],
		color: '#3a8a5a',
		joined: 'februari 2026',
		mod: true
	}
];

export const userById = (id: string) => users.find((u) => u.id === id);

/** Gubben940:s vänner (den inloggade demoanvändaren). */
export const myFriends = [
	'matteok',
	'sannas',
	'erik-pa-raby',
	'linnea-l',
	'backby-pelle',
	'johanna-v',
	'fotofredrik',
	'mopedmia',
	'elinb',
	'kicki61'
];

export const friendRequest = {
	from: 'tobbe-tillberga',
	message: 'Hej! Såg att du grillar på Djäkneberget ibland. Får jag hänga på nästa gång?'
};

// ---------------------------------------------------------------- Platser

export interface Place {
	id: string;
	name: string;
	lat: number;
	lng: number;
	kind: string;
	text: string;
}

export const places: Place[] = [
	{ id: 'bjorno', name: 'Björnö', lat: 59.5545, lng: 16.6335, kind: 'Naturreservat', text: 'Skog, klippor och badvikar ut mot Mälaren. Grillplatser och vindskydd.' },
	{ id: 'framnas', name: 'Framnäs', lat: 59.5975, lng: 16.5745, kind: 'Badplats', text: 'Sandstrand nära stan, bastu på vintern. Klassiskt ställe för nattbad.' },
	{ id: 'lovudden', name: 'Lövudden', lat: 59.5885, lng: 16.4985, kind: 'Strand och bryggor', text: 'Solnedgångar, kubb på gräset och bra abborrfiske från bryggorna.' },
	{ id: 'vasaparken', name: 'Vasaparken', lat: 59.6112, lng: 16.5478, kind: 'Park', text: 'Mitt i stan. Brännboll, picknick och folk som säger hej.' },
	{ id: 'anundshog', name: 'Anundshög', lat: 59.6316, lng: 16.6262, kind: 'Fornlämning', text: 'Sveriges största gravhög, skeppssättningar och runsten. Fint för söndagspromenader.' },
	{ id: 'halla', name: 'Hälla', lat: 59.6178, lng: 16.6115, kind: 'Område', text: 'Butiker och verkstäder. Härifrån utgår många garagekvällar.' },
	{ id: 'djakneberget', name: 'Djäkneberget', lat: 59.6138, lng: 16.5355, kind: 'Park och utsikt', text: 'Klippor, inskriptioner och grillplats med utsikt över stan.' },
	{ id: 'kokpunkten', name: 'Kokpunkten-backen', lat: 59.6072, lng: 16.5598, kind: 'Pulkabacke', text: 'Den lilla backen vid Kokpunkten. Pulka när det finns snö, fika när det inte gör det.' }
];

export const placeById = (id: string) => places.find((p) => p.id === id);

// ---------------------------------------------------------------- Lappar / aktiviteter

export type Visibility = 'alla' | 'vänner' | 'grupp';

export interface Activity {
	id: string;
	title: string;
	place: string;
	placeId?: string;
	lat: number;
	lng: number;
	/** Minuter från "nu". */
	startIn: number;
	bring: string;
	by: string;
	visibility: Visibility;
	groupId?: string;
	recurring: boolean;
	attendees: string[];
	comments: number;
	text: string;
}

export const activities: Activity[] = [
	{
		id: 'a-bradspel',
		title: 'Brädspel och te på biblioteket',
		place: 'Stadsbiblioteket, studierummet',
		lat: 59.6105,
		lng: 16.5465,
		startIn: 95,
		bring: 'Ett spel om du har, annars lånar vi',
		by: 'johanna-v',
		visibility: 'alla',
		recurring: true,
		attendees: ['johanna-v', 'linnea-l', 'hampus-o', 'elinb'],
		comments: 6,
		text: 'Vi kör lätta spel i början så alla hinner komma in i det. Te finns.'
	},
	{
		id: 'a-pannlampa',
		title: 'Kvällspromenad med pannlampa',
		place: 'Djäkneberget, vid stora stenen',
		placeId: 'djakneberget',
		lat: 59.6142,
		lng: 16.5349,
		startIn: 50,
		bring: 'Pannlampa eller ficklampa, termos',
		by: 'gubben940',
		visibility: 'alla',
		recurring: false,
		attendees: ['gubben940', 'kicki61', 'tobbe-tillberga'],
		comments: 3,
		text: 'Lugnt tempo, cirka en timme. Vi går runt berget och tittar på stan från toppen.'
	},
	{
		id: 'a-kallbad',
		title: 'Kallbad och bastu',
		place: 'Framnäs, bastun vid bryggan',
		placeId: 'framnas',
		lat: 59.5979,
		lng: 16.575,
		startIn: 290,
		bring: 'Handduk, badmössa, något varmt att dricka',
		by: 'sannas',
		visibility: 'alla',
		recurring: true,
		attendees: ['sannas', 'elinb', 'sofia-bjurhovda', 'johanna-v', 'linnea-l', 'matteok'],
		comments: 9,
		text: 'Doppa så kort eller länge du vill – ingen tävling. Vi är alltid minst två i vattnet samtidigt.'
	},
	{
		id: 'a-grill',
		title: 'Korvgrillning i duggregnet',
		place: 'Björnö, vindskyddet vid Ängsviken',
		placeId: 'bjorno',
		lat: 59.5531,
		lng: 16.6372,
		startIn: 1500,
		bring: 'Egen korv och dricka. Ved finns.',
		by: 'backby-pelle',
		visibility: 'alla',
		recurring: false,
		attendees: ['backby-pelle', 'nisse-irsta', 'erik-pa-raby', 'tobbe-tillberga', 'gubben940'],
		comments: 4,
		text: 'Vindskyddet håller oss torra. Jag tar med extra bröd och senap.'
	},
	{
		id: 'a-brannboll',
		title: 'Höstbrännboll (om det är torrt)',
		place: 'Vasaparken, stora gräsmattan',
		placeId: 'vasaparken',
		lat: 59.6115,
		lng: 16.5486,
		startIn: 1280,
		bring: 'Vantar. Slagträ och boll finns.',
		by: 'matteok',
		visibility: 'alla',
		recurring: true,
		attendees: ['matteok', 'hampus-o', 'elinb', 'johanna-v', 'erik-pa-raby', 'sannas', 'fotofredrik'],
		comments: 12,
		text: 'Lag lottas på plats. Ingen behöver kunna reglerna, vi lär oss under tiden.'
	},
	{
		id: 'a-fiske',
		title: 'Morgonfiske från bryggan',
		place: 'Lövudden, bryggorna',
		placeId: 'lovudden',
		lat: 59.5881,
		lng: 16.4972,
		startIn: 1020,
		bring: 'Varma kläder. Spö finns att låna.',
		by: 'nisse-irsta',
		visibility: 'grupp',
		groupId: 'fiskegänget',
		recurring: false,
		attendees: ['nisse-irsta', 'backby-pelle', 'tobbe-tillberga'],
		comments: 2,
		text: 'Abborren har varit på hugget vid andra bryggan.'
	},
	{
		id: 'a-anundshog',
		title: 'Söndagspromenad runt Anundshög',
		place: 'Anundshög, parkeringen',
		placeId: 'anundshog',
		lat: 59.6309,
		lng: 16.6248,
		startIn: 1220,
		bring: 'Fika att dela',
		by: 'gubben940',
		visibility: 'grupp',
		groupId: 'sondagspromenaderna',
		recurring: true,
		attendees: ['gubben940', 'rut-rocklunda', 'kicki61', 'linnea-l', 'fotofredrik'],
		comments: 5,
		text: 'Rut berättar om skeppssättningarna. Vi går i Ruts tempo.'
	},
	{
		id: 'a-loprunda',
		title: 'Långsam löprunda längs Svartån',
		place: 'Svartån, vid Turbinbron',
		lat: 59.6125,
		lng: 16.5418,
		startIn: 200,
		bring: 'Reflexväst',
		by: 'elinb',
		visibility: 'vänner',
		recurring: true,
		attendees: ['elinb', 'sannas'],
		comments: 1,
		text: 'Pratvänligt tempo, 5 km. Bullar efteråt för den som vill.'
	}
];

// ---------------------------------------------------------------- Öppen dörr

export interface OpenDoor {
	id: string;
	title: string;
	host: string;
	area: string;
	lat: number;
	lng: number;
	radius: number;
	when: string;
	text: string;
}

export const openDoors: OpenDoor[] = [
	{ id: 'od-garage', title: 'Öppet garage – däckbyte och kaffe', host: 'mopedmia', area: 'Pettersberg', lat: 59.6265, lng: 16.5655, radius: 650, when: 'Lördag 10–15', text: 'Kom och lär dig byta däck själv. Domkraft och kaffe finns.' },
	{ id: 'od-vinyl', title: 'Vinylkväll i vardagsrummet', host: 'backby-pelle', area: 'Bäckby', lat: 59.6285, lng: 16.4895, radius: 700, when: 'Lördag 19–23', text: 'Ta med en skiva du skäms över. Max åtta personer.' },
	{ id: 'od-korsord', title: 'Kaffe och korsord på altanen', host: 'kicki61', area: 'Vallby', lat: 59.6205, lng: 16.5105, radius: 600, when: 'Varje tisdag 14–16', text: 'Korsordet i lokaltidningen löses tillsammans. Kakor ingår.' },
	{ id: 'od-syjunta', title: 'Syjunta – laga och sy om', host: 'linnea-l', area: 'Kristiansborg', lat: 59.6045, lng: 16.5265, radius: 550, when: 'Onsdag 18–21', text: 'Ta med plagg som behöver lagas. Två symaskiner finns.' }
];

// ---------------------------------------------------------------- Tärningen

export interface Idea {
	id: string;
	text: string;
	bring?: string;
	place?: string;
	seasons?: Season[];
	holidays?: Holiday[];
	indoor?: boolean;
	rainOk?: boolean;
	needsSnow?: boolean;
	minTemp?: number;
	maxTemp?: number;
}

const ALL: Season[] = ['vinter', 'vår', 'sommar', 'höst'];
const WARM: Season[] = ['vår', 'sommar', 'höst'];

export const ideas: Idea[] = [
	{ id: 'i01', text: 'Nattbad vid Framnäs', place: 'Framnäs', bring: 'Handduk och ficklampa', seasons: ['sommar'], minTemp: 16 },
	{ id: 'i02', text: 'Korvgrillning på Djäkneberget', place: 'Djäkneberget', bring: 'Korv, bröd och tändstickor', seasons: ALL, rainOk: true },
	{ id: 'i03', text: 'Brännboll i Vasaparken', place: 'Vasaparken', bring: 'Slagträ och boll', seasons: ['vår', 'sommar'], minTemp: 10 },
	{ id: 'i04', text: 'Öppet garage – skruva på mopeden tillsammans', place: 'Ditt garage', bring: 'Verktyg och kaffe', seasons: ALL, indoor: true },
	{ id: 'i05', text: 'Brädspelskväll med te', place: 'Biblioteket eller hemma', bring: 'Ett spel', seasons: ALL, indoor: true },
	{ id: 'i06', text: 'Söndagspromenad runt Björnö', place: 'Björnö', bring: 'Termos', seasons: ALL, rainOk: true },
	{ id: 'i07', text: 'Fika vid Anundshög', place: 'Anundshög', bring: 'Kanelbullar att dela', seasons: WARM },
	{ id: 'i08', text: 'Pulkaåkning i Kokpunkten-backen', place: 'Kokpunkten-backen', bring: 'Pulka och varm choklad', seasons: ['vinter'], needsSnow: true },
	{ id: 'i09', text: 'Långfärdsskridsko på kommunens plogade isbana', place: 'Plogad bana på Mälaren', bring: 'Isdubbar och ryggsäck med extrakläder', seasons: ['vinter'], maxTemp: -3 },
	{ id: 'i10', text: 'Kvällspromenad bland gravljusen på kyrkogården', place: 'Närmaste kyrkogård', bring: 'Ett eget ljus', holidays: ['allhelgona'], rainOk: true },
	{ id: 'i11', text: 'Urholka pumpor och tänd dem på trappen', place: 'Hemma hos någon', bring: 'En pumpa och en kniv', holidays: ['allhelgona'], indoor: true },
	{ id: 'i12', text: 'Lussefika med hembakade lussekatter', place: 'Hemma hos någon', bring: 'Saffran eller pepparkakor', holidays: ['lucia'], indoor: true },
	{ id: 'i13', text: 'Pepparkaksbak och glöggsnack', place: 'Ett stort kök', bring: 'Kavel och forminar', seasons: ['vinter'], holidays: ['jul', 'lucia'], indoor: true },
	{ id: 'i14', text: 'Sjunga julsånger utomhus i Vasaparken', place: 'Vasaparken', bring: 'Varm dryck och sånghäfte', holidays: ['jul'] },
	{ id: 'i15', text: 'Titta på nyårsfyrverkerierna från Djäkneberget', place: 'Djäkneberget', bring: 'Termos och filt', holidays: ['nyår'] },
	{ id: 'i16', text: 'Valborgsbrasa och vårsång', place: 'Den officiella brasan', bring: 'Varma kläder', holidays: ['valborg'] },
	{ id: 'i17', text: 'Klä och resa en midsommarstång', place: 'En gräsplätt', bring: 'Blommor och snöre', holidays: ['midsommar'] },
	{ id: 'i18', text: 'Påskäggsjakt för vuxna', place: 'En park', bring: 'Godis att gömma', holidays: ['påsk'] },
	{ id: 'i19', text: 'Svamppromenad i skogen', place: 'Björnö', bring: 'Korg och svampbok', seasons: ['höst'], rainOk: true },
	{ id: 'i20', text: 'Plocka blåbär och baka paj', place: 'Skogen', bring: 'Bunkar', seasons: ['sommar'] },
	{ id: 'i21', text: 'Plocka äpplen och pressa must', place: 'Någons trädgård', bring: 'Kasse och flaskor', seasons: ['höst'] },
	{ id: 'i22', text: 'Cykeltur längs Mälarstranden', place: 'Mälarstranden', bring: 'Cykel och hjälm', seasons: WARM, minTemp: 5 },
	{ id: 'i23', text: 'Kubb på Lövudden', place: 'Lövudden', bring: 'Kubbspel', seasons: ['vår', 'sommar'], minTemp: 10 },
	{ id: 'i24', text: 'Abborrfiske från bryggan', place: 'Lövudden', bring: 'Spö och mask', seasons: WARM, rainOk: true },
	{ id: 'i25', text: 'Picknick i gräset', place: 'Vasaparken', bring: 'Filt och något att dela', seasons: ['sommar'], minTemp: 15 },
	{ id: 'i26', text: 'Grilla vid vattnet på Björnö', place: 'Björnö', bring: 'Grillkol och mat', seasons: ['sommar'] },
	{ id: 'i27', text: 'Bastu och kallbad', place: 'Framnäs', bring: 'Handduk och badmössa', seasons: ['höst', 'vinter', 'vår'], rainOk: true },
	{ id: 'i28', text: 'Filmkväll med gamla DVD:er', place: 'Någons soffa', bring: 'Popcorn', seasons: ALL, indoor: true },
	{ id: 'i29', text: 'LAN-kväll med spel från förr', place: 'Någons källare', bring: 'Dator och nätverkssladd', seasons: ALL, indoor: true },
	{ id: 'i30', text: 'Pussla ett 1000-bitarspussel', place: 'Ett stort bord', bring: 'Ett pussel', seasons: ALL, indoor: true },
	{ id: 'i31', text: 'Stickcafé', place: 'Ett kafé', bring: 'Garn och stickor', seasons: ALL, indoor: true },
	{ id: 'i32', text: 'Tipspromenad i kvarteret', place: 'Ditt kvarter', bring: 'Frågor på lappar', seasons: WARM },
	{ id: 'i33', text: 'Frisbeegolf', place: 'Närmaste bana', bring: 'Frisbees', seasons: WARM, minTemp: 3 },
	{ id: 'i34', text: 'Boule i parken', place: 'Vasaparken', bring: 'Boulekulor', seasons: ['vår', 'sommar'], minTemp: 12 },
	{ id: 'i35', text: 'Stjärnskådning utanför stan', place: 'En åker utan gatlyktor', bring: 'Filt och stjärnkarta', seasons: ['höst', 'vinter'] },
	{ id: 'i36', text: 'Fågelskådning vid Mälaren', place: 'Björnö', bring: 'Kikare', seasons: ['vår'], rainOk: true },
	{ id: 'i37', text: 'Laga soppa och bjud grannarna', place: 'Ditt kök', bring: 'Grönsaker', seasons: ['höst', 'vinter'], indoor: true },
	{ id: 'i38', text: 'Karaoke i vardagsrummet', place: 'Någons vardagsrum', bring: 'Mod', seasons: ALL, indoor: true },
	{ id: 'i39', text: 'Quizkväll med egna frågor', place: 'Biblioteket', bring: 'Tio frågor var', seasons: ALL, indoor: true },
	{ id: 'i40', text: 'Klädbyte – ta med, ta hem', place: 'En samlingslokal', bring: 'Kläder du inte använder', seasons: ALL, indoor: true },
	{ id: 'i41', text: 'Plocka skräp längs Svartån', place: 'Svartån', bring: 'Handskar och säckar', seasons: ['vår', 'höst'], rainOk: true },
	{ id: 'i42', text: 'Skriv vykort till varandra', place: 'Ett kafé', bring: 'Frimärken', seasons: ALL, indoor: true },
	{ id: 'i43', text: 'Spela gamla tv-spel på tjock-tv', place: 'Någons källare', bring: 'Handkontroller', seasons: ALL, indoor: true },
	{ id: 'i44', text: 'Pannkaksfrukost', place: 'Ett stort kök', bring: 'Sylt', seasons: ALL, indoor: true },
	{ id: 'i45', text: 'Bygg snögubbar i Vasaparken', place: 'Vasaparken', bring: 'Morot och halsduk', seasons: ['vinter'], needsSnow: true },
	{ id: 'i46', text: 'Snällt snöbollskrig', place: 'Djäkneberget', bring: 'Vantar', seasons: ['vinter'], needsSnow: true },
	{ id: 'i47', text: 'Fotboll på konstgräset', place: 'Närmaste konstgräsplan', bring: 'Boll', seasons: WARM, minTemp: 4, rainOk: true },
	{ id: 'i48', text: 'Beachvolley på Lövudden', place: 'Lövudden', bring: 'Boll', seasons: ['sommar'], minTemp: 17 },
	{ id: 'i49', text: 'Paddla kanot på Svartån', place: 'Svartån', bring: 'Flytväst', seasons: ['sommar'], minTemp: 14 },
	{ id: 'i50', text: 'Långpromenad med termos längs ån', place: 'Svartån', bring: 'Termos', seasons: ['höst', 'vinter'], rainOk: true },
	{ id: 'i51', text: 'Se solnedgången från Lövudden', place: 'Lövudden', bring: 'Filt', seasons: ['vår', 'sommar'] },
	{ id: 'i52', text: 'Sy om gamla kläder', place: 'Någons vardagsrum', bring: 'Symaskin om du har', seasons: ALL, indoor: true },
	{ id: 'i53', text: 'Fotopromenad med gamla kameror', place: 'Centrum', bring: 'Kamera eller mobil', seasons: ALL, rainOk: true },
	{ id: 'i54', text: 'Bokcirkel med en tunn bok', place: 'Biblioteket', bring: 'Boken', seasons: ALL, indoor: true },
	{ id: 'i55', text: 'Skissa i parken', place: 'Vasaparken', bring: 'Block och penna', seasons: ['sommar'], minTemp: 14 },
	{ id: 'i56', text: 'Pyssla adventsljusstakar', place: 'Ett stort bord', bring: 'Mossa och ljus', seasons: ['vinter'], holidays: ['jul'], indoor: true },
	{ id: 'i57', text: 'Hjälp en granne att kratta löv', place: 'Någons trädgård', bring: 'Kratta', seasons: ['höst'] },
	{ id: 'i58', text: 'Schack i parken', place: 'Vasaparken', bring: 'Schackbräde', seasons: ['sommar'], minTemp: 14 },
	{ id: 'i59', text: 'Leta vitsippor', place: 'Björnö', bring: 'Kamera', seasons: ['vår'] },
	{ id: 'i60', text: 'Glasspromenad längs Mälaren', place: 'Mälarstranden', bring: 'Växel', seasons: ['sommar'], minTemp: 18 },
	{ id: 'i61', text: 'Varm choklad vid en eld', place: 'Djäkneberget', bring: 'Kakao och termos', seasons: ['höst', 'vinter'] },
	{ id: 'i62', text: 'Kortspel – plump, uno eller kille', place: 'Ett kafé', bring: 'En kortlek', seasons: ALL, indoor: true },
	{ id: 'i63', text: 'Konstmuseet och fika efteråt', place: 'Konstmuseet', bring: 'Nyfikenhet', seasons: ALL, indoor: true },
	{ id: 'i64', text: 'Öppet garage – byt däck tillsammans', place: 'Någons garage', bring: 'Domkraft', seasons: ['höst', 'vår'], indoor: true },
	{ id: 'i65', text: 'Kräftskiva på gården', place: 'En innergård', bring: 'Hattar och visor', holidays: ['kräftskiva'] },
	{ id: 'i66', text: 'Lyktvandring med marschaller', place: 'Björnö', bring: 'Marschaller och tändare', seasons: ['höst', 'vinter'] },
	{ id: 'i67', text: 'Torsdagsärtor och kortspel', place: 'Någons kök', bring: 'Punsch eller lingondricka', seasons: ['höst', 'vinter'], indoor: true },
	{ id: 'i68', text: 'Gemensam städdag i trapphuset', place: 'Ditt trapphus', bring: 'Kaffe till efteråt', seasons: ['vår'], indoor: true }
];

export interface SeasonPreset {
	id: string;
	label: string;
	dateText: string;
	season: Season;
	temp: number;
	weather: Weather;
	weatherText: string;
	holiday: Holiday | null;
	holidayText?: string;
	sunset: string;
}

export const seasonPresets: SeasonPreset[] = [
	{ id: 'nov', label: 'November – allhelgonahelg', dateText: 'Lördag i allhelgonahelgen', season: 'höst', temp: 4, weather: 'regn', weatherText: 'duggregn', holiday: 'allhelgona', holidayText: 'allhelgonahelg', sunset: '15:52' },
	{ id: 'dec', label: 'December – lucia', dateText: 'Söndag 13 december', season: 'vinter', temp: -6, weather: 'snö', weatherText: 'lätt snöfall', holiday: 'lucia', holidayText: 'lucia', sunset: '14:47' },
	{ id: 'jan', label: 'Januari – vanlig vardag', dateText: 'Tisdag 19 januari', season: 'vinter', temp: -11, weather: 'sol', weatherText: 'kallt och klart', holiday: null, sunset: '15:28' },
	{ id: 'apr', label: 'April – valborg', dateText: 'Torsdag 30 april', season: 'vår', temp: 9, weather: 'sol', weatherText: 'klart men kyligt', holiday: 'valborg', holidayText: 'valborgsmässoafton', sunset: '20:41' },
	{ id: 'jun', label: 'Juni – midsommar', dateText: 'Fredag 19 juni', season: 'sommar', temp: 22, weather: 'sol', weatherText: 'sol och lätt bris', holiday: 'midsommar', holidayText: 'midsommarafton', sunset: '22:12' },
	{ id: 'aug', label: 'Augusti – vanlig tisdag', dateText: 'Tisdag 18 augusti', season: 'sommar', temp: 19, weather: 'moln', weatherText: 'halvklart', holiday: null, sunset: '20:39' }
];

// ---------------------------------------------------------------- Dagboken

export interface DiaryPost {
	id: string;
	by: string;
	ago: string;
	text: string;
	photo?: { caption: string; color: string; icon?: string };
	schysst: number;
}

export const diary: DiaryPost[] = [
	{ id: 'd1', by: 'sannas', ago: '23 min sedan', text: 'Fyra grader i vattnet vid Framnäs i morse. Jag skrek lite. Sedan bastu. Livet är bra.', photo: { caption: 'Bryggan vid Framnäs, 07:10', color: '#5d7fa3', icon: 'water' }, schysst: 14 },
	{ id: 'd2', by: 'gubben940', ago: '1 tim sedan', text: 'Tack alla som kom på grillningen i lördags! Sju nya ansikten. Pelle hade med sig senap från 1987 (skämt, tror jag).', photo: { caption: 'Grillplatsen på Djäkneberget', color: '#a3745d', icon: 'sausage' }, schysst: 21 },
	{ id: 'd3', by: 'linnea-l', ago: '2 tim sedan', text: 'Hittade ett vykort från 1962 på loppis med Stadshuset på. Någon skrev "Vädret är fint, maten är god, Sven är sur". Tidlöst.', schysst: 9 },
	{ id: 'd4', by: 'mopedmia', ago: '3 tim sedan', text: 'Puchen startade på första kicken efter tre veckors mek. Erik, du är en legend som hade rätt packning.', photo: { caption: 'En gammal moped i garaget', color: '#8a5d5d', icon: 'star' }, schysst: 17 },
	{ id: 'd5', by: 'johanna-v', ago: 'i går', text: 'Elva personer på brädspelskvällen! Vi behöver fler bord. Och fler som kan reglerna till det långa spelet med fåren.', schysst: 12 },
	{ id: 'd6', by: 'fotofredrik', ago: 'i går', text: 'Dimman över Mälaren från Lövudden. Ingen filter, bara november.', photo: { caption: 'Dimma över vattnet', color: '#7d8a99', icon: 'cloud' }, schysst: 25 },
	{ id: 'd7', by: 'backby-pelle', ago: '2 dagar sedan', text: 'Lånade ut fiskespöt till en kille från Tillberga som just flyttat hit. Han fick en abborre direkt. Nybörjartur heter det.', schysst: 8 },
	{ id: 'd8', by: 'erik-pa-raby', ago: '3 dagar sedan', text: 'Sorterade förrådet. Har tre cykelpumpar för mycket. Kom och ta en, jag bjuder på kaffe.', photo: { caption: 'Förrådet, äntligen sorterat', color: '#5d8a6e', icon: 'house' }, schysst: 6 }
];

// ---------------------------------------------------------------- Gästboken efteråt (nattbadet)

export const afterNattbad = {
	title: 'Nattbad vid Framnäs – i augusti',
	text: 'Arton personer, en fullmåne och ett vatten på 19 grader. Här är bilder och hälsningar från kvällen.',
	photos: [
		{ caption: 'Månen över bryggan', color: '#2f4b73', icon: 'moon' },
		{ caption: 'Handdukar på räcket', color: '#73582f', icon: 'water' },
		{ caption: 'Någon tog med marschaller', color: '#8a4b2f', icon: 'fire' },
		{ caption: 'Gänget efter doppet (bakifrån!)', color: '#2f735a', icon: 'group' }
	],
	comments: [
		{ by: 'sannas', ago: 'aug', text: 'Bästa kvällen i somras. Tack till alla som höll koll på varandra i vattnet!' },
		{ by: 'matteok', ago: 'aug', text: 'Jag som aldrig badat i Mälaren förut. Nu fattar jag grejen.' },
		{ by: 'kicki61', ago: 'aug', text: 'Jag satt på bryggan med termosen och hade det minst lika trevligt.' },
		{ by: 'elinb', ago: 'aug', text: 'Samma tid nästa år? Jag tar med kanelbullar.' }
	]
};

// ---------------------------------------------------------------- Grupper

export interface Group {
	id: string;
	name: string;
	open: boolean;
	members: number;
	text: string;
	note?: string;
	icon: string;
}

export const groups: Group[] = [
	{ id: 'nattbadarna', name: 'Nattbadarna – tjejer', open: false, members: 46, text: 'Nattbad och kallbad för tjejer. Vi badar aldrig ensamma.', note: 'Sluten grupp: moderatorerna läser ansökan.', icon: 'water' },
	{ id: 'bilfolk', name: 'Västerås bilfolk', open: true, members: 212, text: 'Gamla bilar, öppna garage, fika på parkeringen. Ingen buskörning.', icon: 'star' },
	{ id: 'bradspel', name: 'Brädspelsklubben', open: true, members: 88, text: 'Spelkvällar varje vecka. Nybörjare är extra välkomna.', icon: 'dice' },
	{ id: 'sondagspromenaderna', name: 'Söndagspromenaderna', open: true, members: 134, text: 'En promenad varje söndag, olika ställen, alltid fika.', icon: 'tree' },
	{ id: 'fiskegänget', name: 'Fiskegänget', open: false, members: 29, text: 'Fiske från bryggor och båt. Vi lånar ut spön.', note: 'Sluten grupp: för att hålla fiskeställena hemliga.', icon: 'water' },
	{ id: '18-25', name: '18–25 i Västerås', open: false, members: 157, text: 'För dig mellan 18 och 25 som vill hitta folk i samma läge.', note: 'Ålder ej verifierad – gruppen bygger på förtroende.', icon: 'group' }
];

// ---------------------------------------------------------------- Forum

export interface ForumCategory {
	id: string;
	name: string;
	text: string;
}

export const forumCategories: ForumCategory[] = [
	{ id: 'motor', name: 'Motor & garage', text: 'Mopeder, bilar, verktyg och öppna garage.' },
	{ id: 'natur', name: 'Ute i naturen', text: 'Bad, fiske, svamp, promenader och allt som händer utomhus.' },
	{ id: 'kultur', name: 'Kultur & nattliv', text: 'Konserter, utställningar, fester och var man fikar efter tio.' },
	{ id: 'idrott', name: 'Idrott', text: 'Brännboll, löpning, innebandy och allt som ger träningsvärk.' },
	{ id: 'kopsalj', name: 'Köp/sälj/byt', text: 'Bara privatpersoner. Inga företag, ingen reklam.' },
	{ id: 'snack', name: 'Västerås-snack', text: 'Om stan och stadsdelarna. Ingen rikspolitik.' }
];

export interface ForumPost {
	by: string;
	ago: string;
	text: string;
}

export interface ForumThread {
	id: string;
	cat: string;
	title: string;
	by: string;
	views: number;
	last: string;
	posts: ForumPost[];
}

const p = (by: string, ago: string, text: string): ForumPost => ({ by, ago, text });

export const forumThreads: ForumThread[] = [
	{
		id: 'vinterbad',
		cat: 'natur',
		title: 'Bästa stället för vinterbad i Västerås?',
		by: 'sannas',
		views: 1204,
		last: 'i dag 09:12',
		posts: [
			p('sannas', '2 nov 18:02', 'Nu är det dags igen! Var badar ni när det börjar bli kallt på riktigt? Jag har kört Framnäs men funderar på något nytt.'),
			p('elinb', '2 nov 18:20', 'Framnäs är svårslaget pga bastun. Men Lövudden har bättre stege.'),
			p('nisse-irsta', '2 nov 19:01', 'Bada aldrig ensam, och kolla isen om det har frusit. Det är det enda tipset som spelar roll.'),
			p('gubben940', '2 nov 19:45', 'Instämmer med Nisse. Och ta med något varmt att dricka, inte något starkt.'),
			p('matteok', '3 nov 08:13', 'Som nybörjare: hur länge ska man vara i? Jag tänkte typ fem minuter.'),
			p('sannas', '3 nov 08:30', 'Börja med 30 sekunder! Kroppen vänjer sig. Fem minuter är för mycket i början.'),
			p('johanna-v', '3 nov 12:44', 'Jag har en badmössa i ull jag stickat. Rekommenderas starkt, man fryser mest om huvudet.'),
			p('linnea-l', '3 nov 13:02', 'Johanna, kan du lära mig sticka en sådan? Jag byter mot en lagad jacka.'),
			p('fotofredrik', '4 nov 07:55', 'Fotade soluppgången vid Framnäs i morse. Det var tre personer i vattnet redan 06:45. Imponerande.'),
			p('kicki61', '4 nov 10:10', 'Jag badade i Mälaren varje vinter på 70-talet. Då fanns ingen bastu, bara en vedeldad tunna.'),
			p('rut-rocklunda', '4 nov 15:30', 'Och man gick hem i blöta yllesockor. Det var inte bättre förr, Kicki.'),
			p('erik-pa-raby', '5 nov 19:22', 'Några som vill köra en gemensam premiär på söndag? Jag kan sätta upp en lapp.'),
			p('sannas', 'i dag 09:12', 'Erik: ja! Sätt upp en lapp så kommer jag.')
		]
	},
	{ id: 'svamp', cat: 'natur', title: 'Trattkantareller kvar på Björnö?', by: 'linnea-l', views: 233, last: 'i går 21:40', posts: [p('linnea-l', '4 nov 10:00', 'Någon som hittat trattisar senaste veckan?'), p('backby-pelle', 'i går 21:40', 'Några stycken norr om parkeringen. Mer säger jag inte.')] },
	{ id: 'stigar', cat: 'natur', title: 'Pannlampa eller ficklampa för kvällspromenader?', by: 'kicki61', views: 98, last: '3 nov', posts: [p('kicki61', '3 nov 17:00', 'Vad använder ni när det är mörkt redan fyra?'), p('gubben940', '3 nov 17:30', 'Pannlampa. Händerna fria för termosen.')] },
	{ id: 'puch', cat: 'motor', title: 'Packning till gammal Puch – vem har?', by: 'mopedmia', views: 412, last: 'i dag 08:02', posts: [p('mopedmia', '1 nov 12:00', 'Letar topplockspackning. Byter mot hjälp med däckbyte.'), p('erik-pa-raby', '1 nov 13:12', 'Har en i förrådet! Kom förbi.'), p('mopedmia', 'i dag 08:02', 'Den passade. Tack!!')] },
	{ id: 'vinterdack', cat: 'motor', title: 'Öppet garage på Pettersberg – däckbyte', by: 'mopedmia', views: 301, last: 'i går 14:15', posts: [p('mopedmia', '3 nov 09:00', 'Lördag 10–15. Lär dig byta själv, jag visar.'), p('tobbe-tillberga', 'i går 14:15', 'Kommer med min gamla Volvo!')] },
	{ id: 'lan', cat: 'kultur', title: 'LAN som 2004 – vem är med?', by: 'hampus-o', views: 187, last: '4 nov', posts: [p('hampus-o', '2 nov 20:00', 'Har plats för sex datorer. Ta med egen sladd.'), p('matteok', '4 nov 11:11', 'Jag har en laptop från 2009, räknas det?')] },
	{ id: 'konstmuseet', cat: 'kultur', title: 'Konstmuseet på lördag – sällskap?', by: 'sofia-bjurhovda', views: 76, last: 'i går', posts: [p('sofia-bjurhovda', 'i går 10:00', 'Går vid lunch, fika efteråt. Häng på!')] },
	{ id: 'brannboll', cat: 'idrott', title: 'Brännbollsregler – vad gäller egentligen?', by: 'matteok', views: 655, last: 'i dag 07:30', posts: [p('matteok', '30 okt 19:00', 'Vi bråkade om "lyra". Vad gäller?'), p('hampus-o', '30 okt 19:20', 'Lyra = en poäng. Inget mer att säga.'), p('erik-pa-raby', 'i dag 07:30', 'Vi kör det enkelt: alla får slå, ingen behöver springa fort.')] },
	{ id: 'loprunda', cat: 'idrott', title: 'Långsamma löpare i stan?', by: 'elinb', views: 142, last: '2 nov', posts: [p('elinb', '1 nov 18:00', 'Jag springer runt 7:30/km. Någon mer?'), p('sannas', '2 nov 09:00', 'Ja! Pratvänligt tempo är det enda tempot.')] },
	{ id: 'symaskin', cat: 'kopsalj', title: 'Byter: symaskin mot cykel', by: 'linnea-l', views: 64, last: 'i går', posts: [p('linnea-l', '4 nov 12:00', 'Har en fungerande symaskin, vill ha en damcykel. Privat byte.')] },
	{ id: 'pulkor', cat: 'kopsalj', title: 'Skänkes: två pulkor', by: 'kicki61', views: 58, last: '3 nov', posts: [p('kicki61', '3 nov 08:00', 'Barnbarnen har vuxit ur dem. Hämtas i Vallby.')] },
	{ id: 'svartan', cat: 'snack', title: 'Vad hände med fiket vid Svartån?', by: 'rut-rocklunda', views: 820, last: 'i dag 10:01', posts: [p('rut-rocklunda', '1 nov 10:00', 'Det var öppet i 30 år. Vet någon något?'), p('linnea-l', 'i dag 10:01', 'Nya ägare enligt skylten. Öppnar i vår!')] },
	{ id: 'gatlyktor', cat: 'snack', title: 'Mörkt på gångvägen vid Bäckby', by: 'backby-pelle', views: 311, last: 'i går', posts: [p('backby-pelle', '2 nov 17:00', 'Tre lyktor ur funktion. Felanmält till kommunen. Gör ni också så går det fortare.')] }
];

// ---------------------------------------------------------------- Utforska & Hett

export const eldsjal = {
	user: 'backby-pelle',
	text: 'Pelle har stått för fyra grillningar, lånat ut sitt fiskespö sju gånger och lärt en nyinflyttad var abborren nappar. Nominerad av tolv personer.',
	stats: { aktiviteter: 4, kommer: 41, nya: 7 }
};

export const openPhotos = [
	{ id: 'f1', caption: 'Dimma över Mälaren', by: 'fotofredrik', color: '#7d8a99', icon: 'cloud', schysst: 25 },
	{ id: 'f2', caption: 'Grillplatsen på Djäkneberget', by: 'gubben940', color: '#a3745d', icon: 'sausage', schysst: 21 },
	{ id: 'f3', caption: 'Bryggan vid Framnäs', by: 'sannas', color: '#5d7fa3', icon: 'water', schysst: 14 },
	{ id: 'f4', caption: 'Spelbordet efter elva', by: 'johanna-v', color: '#6e5da3', icon: 'dice', schysst: 12 },
	{ id: 'f5', caption: 'Löv i Vasaparken', by: 'elinb', color: '#a38a5d', icon: 'tree', schysst: 11 },
	{ id: 'f6', caption: 'Skeppssättningen i frost', by: 'rut-rocklunda', color: '#5d8a8a', icon: 'star', schysst: 19 },
	{ id: 'f7', caption: 'Garaget på Pettersberg', by: 'mopedmia', color: '#8a5d5d', icon: 'house', schysst: 9 },
	{ id: 'f8', caption: 'Kvällsljus vid Svartån', by: 'linnea-l', color: '#3f5d8a', icon: 'moon', schysst: 16 },
	{ id: 'f9', caption: 'Abborre nummer ett', by: 'tobbe-tillberga', color: '#5d8a6e', icon: 'water', schysst: 13 }
];

// ---------------------------------------------------------------- Gästböcker på profiler

export const guestbooks: Record<string, { by: string; ago: string; text: string }[]> = {
	gubben940: [
		{ by: 'matteok', ago: 'i går 22:14', text: 'Tack för grillningen! Ses på brännbollen?' },
		{ by: 'kicki61', ago: '3 nov', text: 'Kul att gå med dig runt berget. Ta med den där goda kakan nästa gång.' },
		{ by: 'erik-pa-raby', ago: '1 nov', text: 'Cykelpumpen är din om du vill ha den. Kram från Råby' },
		{ by: 'linnea-l', ago: '28 okt', text: 'Har ett vykort på Skiljebo från 1958 – ska jag ta med det på söndag?' }
	]
};

export const defaultGuestbook = (id: string) => {
	const u = userById(id);
	const f = u?.topFriends ?? [];
	return [
		{ by: f[0] ?? 'gubben940', ago: 'i går', text: 'Kul att ses sist! Hörs snart.' },
		{ by: f[1] ?? 'sannas', ago: '3 nov', text: 'Tack för senast, du är bäst.' }
	];
};

// ---------------------------------------------------------------- Moderering

export type QueueType = 'anmälan' | 'plats' | 'tärningsidé' | 'gruppansökan';

export interface QueueItem {
	id: string;
	type: QueueType;
	title: string;
	detail: string;
	from: string;
	approve: { label: string; message: string };
	remove: { label: string; message: string; logReason: string };
}

const APPEAL =
	'Tycker du att vi gjort fel? Svara på det här meddelandet inom 14 dagar så tittar en annan moderator på beslutet. Du får svar inom tre dagar.';

export const modQueue: QueueItem[] = [
	{
		id: 'q1',
		type: 'anmälan',
		title: 'Anmält inlägg: "50 % rabatt på solarium på Hälla!!"',
		detail: 'Inlägg i Köp/sälj/byt av ett nyregistrerat konto. Anmält av tre personer som reklam.',
		from: 'Anmält av Kicki61, MatteoK och ElinB',
		approve: { label: 'Låt ligga kvar', message: 'Hej! Vi har tittat på anmälan och låter inlägget ligga kvar. Inget regelbrott hittades.' },
		remove: {
			label: 'Ta bort',
			message: `Hej! Ditt inlägg "50 % rabatt på solarium på Hälla!!" är borttaget. Regel 3: Ingen reklam – företag får inte marknadsföra sig här, inte ens lokala. Vill du träffa folk som privatperson är du jättevälkommen. ${APPEAL}`,
			logReason: 'reklam'
		}
	},
	{
		id: 'q2',
		type: 'anmälan',
		title: 'Anmält inlägg: tråd om regeringens budget i Västerås-snack',
		detail: 'Länk till en riksnyhet och lång diskussion om rikspolitik. Anmält som "riksnyhet".',
		from: 'Anmält av Rut_på_Rocklunda',
		approve: { label: 'Låt ligga kvar', message: 'Hej! Vi har tittat på anmälan och låter tråden ligga kvar eftersom den handlar om hur Västerås påverkas lokalt.' },
		remove: {
			label: 'Ta bort',
			message: `Hej! Din tråd om regeringens budget är borttagen. Regel 4: Ingen rikspolitik – vi håller oss till Västerås. Lokala frågor, som en gångväg eller ett fik, är välkomna. ${APPEAL}`,
			logReason: 'riksnyhet'
		}
	},
	{
		id: 'q3',
		type: 'plats',
		title: 'Ny plats föreslagen: "Grillplatsen vid Johannisbergs strand"',
		detail: 'Föreslagen av Erik_på_Råby med koordinater och beskrivning: "Bänkar, grillgaller och lä."',
		from: 'Förslag från Erik_på_Råby',
		approve: { label: 'Godkänn plats', message: 'Hej! Din plats "Grillplatsen vid Johannisbergs strand" ligger nu på kartan. Tack för tipset!' },
		remove: {
			label: 'Avslå',
			message: `Hej! Vi har inte lagt till platsen än – vi behöver en bild eller en mer exakt beskrivning. Regel 6: Platser ska vara allmänna och gå att hitta. ${APPEAL}`,
			logReason: 'plats saknar information'
		}
	},
	{
		id: 'q4',
		type: 'tärningsidé',
		title: 'Tärningsidé: "Spela minigolf på Lövudden"',
		detail: 'Tips om ny idé till tärningen. Föreslagen säsong: sommar.',
		from: 'Tips från ElinB',
		approve: { label: 'Lägg i tärningen', message: 'Hej! Din idé "Spela minigolf på Lövudden" finns nu i tärningen. Den dyker upp oftare på sommaren.' },
		remove: {
			label: 'Avslå',
			message: `Hej! Vi har inte lagt till idén, eftersom det redan finns en liknande. Regel 6: Tärningen ska bara innehålla lagliga och säkra idéer, och helst inga dubbletter. ${APPEAL}`,
			logReason: 'dubblett'
		}
	},
	{
		id: 'q5',
		type: 'gruppansökan',
		title: 'Gruppansökan: Sofia_Bjurhovda vill gå med i Nattbadarna – tjejer',
		detail: 'Meddelande: "Har kallbadat i tre år och vill gärna hitta fler att bada med på kvällarna."',
		from: 'Ansökan till gruppens moderatorer',
		approve: { label: 'Godkänn', message: 'Hej! Välkommen till Nattbadarna – tjejer. Läs gärna gruppens regler först i listan.' },
		remove: {
			label: 'Neka',
			message: `Hej! Din ansökan till Nattbadarna – tjejer är nekad den här gången. Gruppen är full till våren. Regel 7: Slutna grupper bestämmer själva vem som går med, men måste alltid motivera. ${APPEAL}`,
			logReason: 'gruppen full'
		}
	}
];

export const modLog = [
	{ when: 'i dag 10:42', text: 'Inlägg borttaget – reklam', mod: 'Mod Anna' },
	{ when: 'i dag 08:15', text: 'Plats godkänd – Vindskyddet på Björnö', mod: 'Mod Anna' },
	{ when: 'i går 21:03', text: 'Kommentar borttagen – personangrepp', mod: 'Mod Jonas' },
	{ when: 'i går 17:40', text: 'Tråd flyttad – från Idrott till Ute i naturen', mod: 'Mod Jonas' },
	{ when: '4 nov 19:12', text: 'Inlägg borttaget – riksnyhet', mod: 'Mod Anna' },
	{ when: '4 nov 11:30', text: 'Överklagan beviljad – inlägget återställt', mod: 'Mod Leila' },
	{ when: '3 nov 22:05', text: 'Bild borttagen – person i bild utan lov', mod: 'Mod Leila' }
];

// ---------------------------------------------------------------- Ordningsregler

export const rules = [
	{ n: 1, title: 'Var schysst', text: 'Inga påhopp, inga trakasserier. Säg det du skulle säga ansikte mot ansikte.' },
	{ n: 2, title: 'Träffas tryggt', text: 'Första gången ses man på en allmän plats. Adresser till hem delas bara privat.' },
	{ n: 3, title: 'Ingen reklam', text: 'Privatpersoner får byta och sälja eget. Företag får inte marknadsföra sig.' },
	{ n: 4, title: 'Ingen rikspolitik', text: 'Västerås-frågor går bra. Riksnyheter och partipolitik hör hemma någon annanstans.' },
	{ n: 5, title: '18+', text: 'Du måste ha fyllt 18 för att vara med.' },
	{ n: 6, title: 'Lagligt och säkert', text: 'Bara aktiviteter som är lagliga och säkra. Bada aldrig ensam.' },
	{ n: 7, title: 'Respektera andra', text: 'Inga bilder på andra utan lov. Slutna grupper bestämmer själva vem som går med.' },
	{ n: 8, title: 'Öppna beslut', text: 'Moderatorerna motiverar alltid och allt går att överklaga.' }
];

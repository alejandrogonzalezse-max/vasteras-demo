// Guidad rundtur: sex steg som visar idén på ungefär två minuter.
export interface TourStep {
	path: string;
	target: string;
	title: string;
	text: string;
}

export const TOUR: TourStep[] = [
	{
		path: '/hem',
		target: '#tarningen',
		title: 'Tärningen',
		text: 'Vet du inte vad du ska hitta på? Slå tärningen. Den väljer bland 68 idéer och väger in årstid, väder och högtid. Testa en annan årstid så ser du skillnaden.'
	},
	{
		path: '/hem',
		target: '#spontant',
		title: 'Spontant just nu',
		text: 'Allt som händer de närmaste sex timmarna. Tryck "Jag kommer" – ingen OSA, inget krångel. Man dyker bara upp.'
	},
	{
		path: '/anslagstavlan',
		target: '#ny-lapp',
		title: 'Sätt upp en lapp',
		text: 'Rubrik, plats och tid – sedan är det klart. Sätt upp en lapp och vänta några sekunder, så får du se vad som händer.'
	},
	{
		path: '/kartan',
		target: '.map-layout',
		title: 'Kartan',
		text: 'Se vad som händer i stan. "Öppen dörr" – någons garage eller vardagsrum – visas bara som en streckad ring över stadsdelen, aldrig var någon bor.'
	},
	{
		path: '/profil/gubben940',
		target: '.p-grid',
		title: 'Som förr, fast schysstare',
		text: 'Topp 8, gästbok, "Låt just nu" och tre profilteman. Inga likes att jaga: bara du ser hur många som tycker att ditt inlägg är schysst.'
	},
	{
		path: '/moderering',
		target: '#kon',
		title: 'Öppna beslut',
		text: 'Ingen reklam, ingen rikspolitik, 18+. Frivilliga moderatorer motiverar alltid sina beslut och allt går att överklaga. Loggen är öppen för alla.'
	}
];

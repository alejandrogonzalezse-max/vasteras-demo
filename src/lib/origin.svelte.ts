// Adressen sajten faktiskt ligger på. Börjar som SITE_URL (används vid förrendering)
// och byts till webbläsarens egen adress när appen startar, så att QR-koder och
// vänlänkar stämmer oavsett vilken Netlify-adress sajten publiceras på.
import { SITE_URL } from './config.ts';

export const site = $state({ origin: SITE_URL });

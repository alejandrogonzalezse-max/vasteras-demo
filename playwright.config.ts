import { existsSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';

// I molnmiljön finns en förinstallerad Chromium; annars används Playwrights egen.
const PREINSTALLED = '/opt/pw-browsers/chromium';
const launchOptions = existsSync(PREINSTALLED) ? { executablePath: PREINSTALLED } : {};

export default defineConfig({
	testDir: 'tests',
	testMatch: '**/*.e2e.ts',
	fullyParallel: true,
	reporter: [['list']],
	use: {
		baseURL: 'http://localhost:4173',
		trace: 'off',
		locale: 'sv-SE',
		launchOptions
	},
	projects: [
		{ name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } } },
		{ name: 'mobil', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, hasTouch: true } }
	],
	webServer: {
		command: 'npm run build && npm run preview -- --port 4173 --strictPort',
		port: 4173,
		reuseExistingServer: true,
		timeout: 120_000
	}
});

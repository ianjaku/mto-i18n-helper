import * as vscode from 'vscode';
import { findSuggestions, translate } from './translate';
import { updateTranslationFiles } from './languageFile';
import { findConfig } from './config';
import { promptFOrTranslationKey, promptForTranslations } from './prompt';


export function activate(context: vscode.ExtensionContext) {

	const translateCommand = vscode.commands.registerCommand('mto-lang.translate', async () => {
		// Current selection

		
		const translationKey = await promptFOrTranslationKey();
		if (translationKey == null) return;

		const translations = await promptForTranslations();
		if (translations == null) return;

		await updateTranslationFiles(translationKey, translations);
	});

	context.subscriptions.push(translateCommand);
}

export interface Translation {
	lang: string;
	value: string;
}


export function deactivate() {
	// No cleanup necessary
}

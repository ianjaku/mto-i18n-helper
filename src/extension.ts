import * as vscode from 'vscode';
import { findSuggestions, translate } from './translate';
import { updateTranslationFiles } from './languageFile';
import { findConfig } from './config';
import { promptForTranslationKey, promptForTranslations } from './prompt';
import { withMaybeReplaceSelectedText } from './replaceSelectedText';


export function activate(context: vscode.ExtensionContext) {

	const translateCommand = vscode.commands.registerCommand('mto-lang.translate', async () => {
		withMaybeReplaceSelectedText(async (selectedText?: string) => {
			const translationKey = await promptForTranslationKey();
			if (translationKey == null) return null;

			const translations = await promptForTranslations(selectedText);
			if (translations == null) return null;

			await updateTranslationFiles(translationKey, translations);

			return translationKey;
		});
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

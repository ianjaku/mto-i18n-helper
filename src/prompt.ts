import * as vscode from "vscode";
import { findConfig } from "./config";
import { Translation } from "./extension";
import { findSuggestions } from "./translate";

export const promptForTranslationKey = async (): Promise<string | null> => {
  let translationKey = await vscode.window.showInputBox({
    prompt: "Key of the sentece in the translation file",
    placeHolder: "Edit_Something",
  });
  return translationKey ?? null;
};

export const promptForTranslations = async (
  masterLanguageSuggestion?: string
): Promise<Translation[] | null> => {
	const config = findConfig();
	let masterLangText = await vscode.window.showInputBox({
		prompt: `${config.masterLang} translation`,
    value: masterLanguageSuggestion ?? ""
	});
	if (masterLangText == null) return null;


	const suggestions = await findSuggestions(masterLangText);

	let translations: {lang: string; value: string}[] = [
		{lang: config.masterLang, value: masterLangText}
	];

	for (const languageCode of config.languageCodes) {
    if (languageCode === config.masterLang) continue;
		const suggestion = suggestions.find(s => s.lang === languageCode)?.suggestion ?? "";
		const text = await vscode.window.showInputBox({
			prompt: `${languageCode} translation`,
			value: suggestion,
			valueSelection: [0, suggestion.length]
		});
		if (text == null) return null;
		translations.push({
			lang: languageCode,
			value: text
		});
	}
	return translations;
};
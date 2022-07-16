import * as vscode from 'vscode';
import { findConfig } from './config';
import { Translation } from './extension';
import { copyIndentation } from './textUtil';

export const updateTranslationFiles = async (
	translationKey: string,
	translations: Translation[]
) => {
	const config = findConfig();
	for (const translation of translations) {
		const path = config.languagePaths[translation.lang];
		if (path == null) {
			throw new Error(`mto-lang.languages.paths is missing for language ${translation.lang}`);
		}
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (workspaceFolders == null) {
			throw new Error(`WorkspaceFolders is undefined`);
		}
		let rootUri = workspaceFolders[0].uri;
		const fileUri = vscode.Uri.joinPath(rootUri, path);
		await addTranslationToLanguageFile(fileUri, translation.value, translationKey);
	}
};

const addTranslationToLanguageFile = async (
  fileUri: vscode.Uri,
  key: string,
  translation: string
) => {
		const textDoc = await vscode.workspace.openTextDocument(fileUri);
    await vscode.window.showTextDocument(textDoc);
    const editor = vscode.window.activeTextEditor;
    if (editor == null) throw new Error("No active editor?");
    if (editor.document !== textDoc) throw new Error("Where is my language file?");

    let text = textDoc.getText();
    let lines = text.split("\n");

    const bestInsertionLine = findBestInsertionLine(key, lines);
    editor.edit(edit => {
      // Maybe insert comma at the end of the previous line
      if (!lines[bestInsertionLine].trim().endsWith(",")) {
        const insertPosition = new vscode.Position(
          bestInsertionLine,
          lines[bestInsertionLine].trimEnd().length
        );
        edit.insert(insertPosition, ",");
      }
      // Add new translation
      let indentation = copyIndentation(lines[bestInsertionLine]);
      edit.insert(
        new vscode.Position(bestInsertionLine+1, 0),
        `${indentation}${key}: "${translation}",\n`
      );
    });
    editor.revealRange(
      new vscode.Range(
        new vscode.Position(bestInsertionLine, 0),
        new vscode.Position(bestInsertionLine+1, 0)
      ),
      vscode.TextEditorRevealType.InCenter
    );
};

const findMatchingKeyPrefixLine = (
  lines: string[],
  keyPrefix: string
): number | null => {
  for (let i = lines.length - 1; i >= 0; i--) {
    let line = lines[i];
    if (line.trim().startsWith(keyPrefix)) {
      return i;
    }
  }
  return null;
};

const findEndOfListLine = (lines: string[]): number => {
  for (let i = lines.length - 1; i >= 0; i--) {
    let line = lines[i];
    if (line.trim().startsWith("}")) {
      return i;
    }
  }
  throw new Error("End of list not found");
};

// Insertion should be made after this line
const findBestInsertionLine = (key: string, lines: string[]) => {
  const keyPrefix = key.split("_")[0];
  if (keyPrefix === key) {
    return findEndOfListLine(lines) - 1;
  } else {
    let matchingKeyPrefixLine = findMatchingKeyPrefixLine(lines, keyPrefix);
    if (matchingKeyPrefixLine) {
      return matchingKeyPrefixLine;
    }
    return findEndOfListLine(lines) - 1;
  }
};
import * as vscode from "vscode";

export const withMaybeReplaceSelectedText = async (
  // Needs to return the translation key
  updateTranslationFiles: (selectedText?: string) => Promise<string | null>
) => {
  console.log("Here0");
  const editor = vscode.window.activeTextEditor;
  if (editor == null) return updateTranslationFiles();
  console.log("Here1");

  const selection = editor.selection;
  if (selection.isEmpty) return updateTranslationFiles();
  console.log("Here2");

  const selectedText = editor.document.getText(selection);
  if (selectedText.length < 3) return updateTranslationFiles();
  console.log("Here3");

  let suggestedText = selectedText.trim();
  if (suggestedText.startsWith('"') && suggestedText.endsWith('"')) {
    suggestedText = suggestedText.slice(1, -1);
  }
  console.log("Here4", suggestedText);

  const key = await updateTranslationFiles(suggestedText);
  if (key == null) return;
  
  let hasBrackets = selectedText.trim().startsWith('"');
  
  await maybeAddTKImport(editor);
  if (!hasBrackets) {
    editor.edit(editBuilder => {
      editBuilder.replace(selection, `{t(TK.${key})}`);
    });
  } else {
    editor.edit(editBuilder => {
      editBuilder.replace(selection, `t(TK.${key})`);
    });
  }
};

const maybeAddTKImport = async (editor: vscode.TextEditor) => {
  const text = editor.document.getText();

  let match = text.match(/import { TranslationKeys as TK} from/);
  if (match == null) {
    editor.edit(editBuilder => {
      editBuilder.insert(
        new vscode.Position(0, 0),
        `import { TranslationKeys as TK } from "@binders/client/lib/react/i18n/translations";\n`
      );
    });
  }
};
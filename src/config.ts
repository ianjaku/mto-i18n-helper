import * as vscode from "vscode";

interface LanguagePaths {
  [languageCode: string]: string
}

interface Config {
  deeplKey?: string;
  masterLang: string;
  languageCodes: string[];
  languagePaths: LanguagePaths;
}

export const findConfig = (): Config => {
  const config = vscode.workspace.getConfiguration("mto-lang");
  const languagePaths = config.get<LanguagePaths>("languages.paths");
  const masterLang = config.get<string>("languages.master");

  if (languagePaths == null || masterLang == null) {
    throw new Error(`
      Invalid configuration:
      ${languagePaths == null ? "languages.paths is missing" : ""}
      ${masterLang == null ? "languages.master is missing" : ""}
    `);
  }
  
  return {
    deeplKey: config.get<string>("deepl.key"),
    masterLang,
    languagePaths,
    languageCodes: Object.keys(languagePaths)
  };
};

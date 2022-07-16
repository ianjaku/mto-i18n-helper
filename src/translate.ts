/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from "vscode";
import axios from "axios";
import { findConfig } from "./config";

interface APITranslateResponse {
  translations: {
    detected_source_language: string;
    text: string;
  }[]
}

export const findSuggestions = async (
  masterLangText: string
): Promise<{lang: string; suggestion: string}[]> => {
  const config = findConfig();

  const deeplKey = config.deeplKey;
  if (deeplKey == null) return [];
  if (config.languageCodes.length === 0) return [];

  const promises = config.languageCodes
    .map(async code => {
      const suggestion = await translate(
        deeplKey,
        {
          targetLang: code,
          text: masterLangText,
          sourceLang: config.masterLang
        }
      );
      if (suggestion == null) return null;
      return {
        lang: code,
        suggestion
      };
    })
    .filter(v => v != null);
  
  return await Promise.all(promises) as {lang: string; suggestion: string}[];
};

export const translate = async (
  apiKey: string,
  options: {
    sourceLang?: string;
    targetLang: string;
    text: string;
  }
): Promise<string> => {
  const result = await axios.get("https://api-free.deepl.com/v2/translate", {
    params: {
      auth_key: apiKey,
      text: options.text,
      target_lang: options.targetLang,
      ...(options.sourceLang ? { source_lang: options.sourceLang } : {}),
      preserve_formatting: "1"
    }
  });
  const response = result.data as APITranslateResponse;
  const translations = response.translations;
  if (translations == null || translations.length === 0) return "";
  return translations[0].text;
};

export const copyIndentation = (line: string): string => {
  let indentationRegex = /^[ \t]*/;
  let matches = line.match(indentationRegex);
  if (matches == null || matches.length === 0) return "";
  return matches[0];
};

import IKeyword from './interfaces/IKeyword';
import IKeywordMap from './interfaces/IKeywordMap';
import * as importedKeywords from './keywords';

const defaultKeywords: IKeywordMap = { };

export {
  importedKeywords,
};

export function addKeyword(keyword: IKeyword, keywords: IKeywordMap = defaultKeywords) {
  if (keywords[keyword.name]) {
    throw new Error(`The keyword "${keyword.name}" already exists.`);
  }

  keywords[keyword.name] = keyword;

  if (Array.isArray(keyword.reserveNames)) {
    keyword.reserveNames.forEach((name) => {
      addKeyword(dummyKeyword(name));
    });
  }
}

const dummyCompile = () => ({});

function dummyKeyword(name: string): IKeyword {
  return {
    name,
    compile: dummyCompile,
  };
}

Object.values(importedKeywords).forEach((item) => addKeyword(item));

export default defaultKeywords;

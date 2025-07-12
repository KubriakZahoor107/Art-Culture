# TypeScript Migration Report

## Вступ
Звіт показує стан міграції бекенду (гілка `stable/health`) на TypeScript.

## Структура папок

| Папка | TS файлів | JS файлів | % TS |
|-------|---------|---------|-----|
| controllers | 12 | 0 | 100 |
| middleware | 7 | 0 | 100 |
| routes | 10 | 0 | 100 |
| tests | 0 | 1 | 0 |
| utils | 4 | 0 | 100 |
| types | 3 | 0 | 100 |

## JS файли

- src/tests/posts.test.js

## Залежності між JS і TS

`src/tests/posts.test.js` імпортує `../app.js` та `../prismaClient.js`, що відповідають TypeScript файлам `app.ts` та `prismaClient.ts`. Це єдиний місток між JS і TS.

## Конфігурація

- `tsconfig.json` тепер містить `"allowJs": false`.
- `jest.config.js` використовує `ts-jest` для `.ts` файлів.

## Рекомендації

1. Перенести `src/tests/posts.test.js` у TypeScript.
2. Оновити імпорти в тестах на `.ts`.
3. Перевірити наявність типів для залежностей (`supertest`, `yargs` тощо).


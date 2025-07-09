# Завдання Codex

**Мета:** Вирівняти імена експорту/імпорту в postController.ts та postRoutes.ts, щоб тести на `/api/posts` пройшли успішно.

**Що потрібно зробити:**
1. У `postController.ts` експортувати всі функції з одниною в кінці:
   - `getCreatorsPosts`
   - `getAuthorsPosts`
   - `getExhibitionsPost`
   - `getMuseumsPost`
   - `getPostsByAuthorId`
   - `getPostByExhibitionId`
   - `getPostByMuseumId`
2. У `postRoutes.ts` імпортувати саме ці назви.
3. Перевірити маршрути:
   ```ts
   router.get('/creators', getCreatorsPosts);
   router.get('/authors',  getAuthorsPosts);
   router.get('/exhibitions', getExhibitionsPost);
   router.get('/museums', getMuseumsPost);

   router.get('/by-author/:authorId',      getPostsByAuthorId);
   router.get('/by-exhibition/:exhibitionId', getPostByExhibitionId);
   router.get('/by-museum/:museumId',       getPostByMuseumId);
   ```

Запустити `npm run dev` та `npm test` і гарантувати, що сервер стартує без помилок та тест `posts.test.js` повертає 200 та порожній масив.

# Завдання Codex: Вирішити конфлікти та перевірити маршрути

**Мета:** Повністю прибрати маркери Git-конфлікту в `postController.ts` та уніфікувати назви експортів/імпортів по всіх маршрутах, а також перевірити конфігурацію запуску, щоб не було конфлікту портів.

**Що потрібно зробити:**

1. **Видалити всі маркери Git-конфлікту** (`<<<<<<<`, `=======`, `>>>>>>>`) з файлу `server/src/controllers/postController.ts`, зберігши правильні гілки коду (варіант «після `======= codex/migration-app-router-node20-server`»).
2. **Перевірити коректність усіх експортів** у `postController.ts`:
   - `getCreatorsPosts`
   - `getAuthorsPosts`
   - `getExhibitionsPosts` **або** `getExhibitionsPost` (якщо назва одна)
   - `getMuseumsPosts` **або** `getMuseumsPost`
   - `getPostsByAuthorId`
   - `getPostByExhibitionId`
   - `getPostByMuseumId`
3. **Пройтися по `postRoutes.ts`** і в усіх `import { ... }` узгодити імена з контролером.
4. **Перевірити інші файли маршрутів** (`authRoutes.ts`, `userRoutes.ts` тощо) на наявність подібних маркерів або невідповідних імен.
5. **Перевірити `src/index.ts`**:
   - Розблокувати порт 5000 або змінити на інший у `process.env.PORT` (наприклад, 5001), якщо він зайнятий.
   - Переконатися, що конфігурація `dotenv.config()` стоїть зверху й підхоплює змінні середовища до створення сервера.
6. **Перезапустити** `npm run dev` та **прогнати** `npm test` і переконатися, що:
   - Немає маркерів конфліктів у коді.
   - Сервер стартує без помилок (єдине прослуховування порту, який вільний).
   - Тест `posts.test.js` проходить (HTTP 200 + тіло `[]`).

**Примітка:** Зверніть увагу на узгодженість множинних/однинічних назв (`getExhibitionsPost` vs `getExhibitionsPosts`) — оберіть один варіант скрізь.

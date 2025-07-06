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

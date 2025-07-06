# Інструкції для агентів

1. `npm install`
2. Перевірити `.env` — жодних лапок навколо значень
3. Якщо вивід `process.env.DATABASE_URL` при запуску (див. лог) містить лапки — виконати в терміналі
   ```bash
   unset DATABASE_URL
   npm run dev
   npm test
   ```

### 4. Перезапустити й перевірити

Після цих змін `npm run dev` має показувати URL без лапок та повідомлення:

```
✅ Successfully connected to the database
🚀 Server listening on http://localhost:5000
```

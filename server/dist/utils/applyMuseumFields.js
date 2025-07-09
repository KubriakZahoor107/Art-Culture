// server/src/utils/applyMuseumFields.ts
/**
 * Копіює адресні поля з source в target:
 * - Строкові поля: призначає значення або null
 * - Числові поля: парсить через parseFloat або ставить null
 */
export function applyMuseumFields(target, source) {
    const stringFields = [
        "country",
        "city",
        "street",
        "house_number",
        "postcode",
    ];
    const numericFields = ["lat", "lon"];
    // Копіюємо строкові поля або ставимо null
    for (const field of stringFields) {
        target[field] = source[field] ?? null;
    }
    // Парсимо числові поля або ставимо null
    for (const field of numericFields) {
        const raw = source[field];
        target[field] = raw != null ? parseFloat(String(raw)) : null;
    }
}

// server/src/controllers/artTermsController.ts
import { Request, Response, NextFunction } from 'express';
import prisma from '../prismaClient.js';
import { validationResult } from 'express-validator';

interface Term {
    id: number;
    letter: string;
    title: string;
    description: string;
    highlightedProductId: number | null;
}

// GET /api/art-terms/:lang
export const getArtTermsByLang = async (
    req: Request<{ lang: string }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // валідуємо параметр lang
        let lang = req.params.lang?.split('-')[0] ?? 'uk';
        if (lang !== 'uk' && lang !== 'en') lang = 'uk';

        // вибираємо сортування
        const orderBy = lang === 'uk'
            ? { title_uk: 'asc' as const }
            : { title_en: 'asc' as const };

        // отримуємо всі терміни без підвантаження продукту
        const artTerms = await prisma.artTerm.findMany({
            orderBy,
        });

        // формуємо масив з однією літерою
        const terms: Term[] = artTerms.map(term => {
            const title = lang === 'uk' ? term.title_uk : term.title_en;
            const description = lang === 'uk' ? term.description_uk : term.description_en;
            return {
                id: term.id,
                letter: title.charAt(0),
                title,
                description,
                highlightedProductId: term.highlightedProductId,
            };
        });

        // лишаємо по першому терміну кожної літери
        const firstTerms: Term[] = [];
        for (const t of terms) {
            if (!firstTerms.some(ft => ft.letter === t.letter)) {
                firstTerms.push(t);
            }
        }

        res.json({ artTerms: firstTerms });
    } catch (error) {
        console.error('Error in getArtTermsByLang:', error);
        next(error);
    }
};

// GET /api/art-terms/last/:lang
export const getLastArtTerms = async (
    req: Request<{ lang: string }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        let lang = req.params.lang?.split('-')[0] ?? 'uk';
        if (lang !== 'uk' && lang !== 'en') lang = 'uk';

        const artTerms = await prisma.artTerm.findMany({
            orderBy: { createdAt: 'desc' },
            take: 15,
        });

        // повертаємо тільки базові поля та highlightedProductId
        const response = artTerms.map(term => ({
            id: term.id,
            title: lang === 'uk' ? term.title_uk : term.title_en,
            description: lang === 'uk' ? term.description_uk : term.description_en,
            highlightedProductId: term.highlightedProductId,
        }));

        res.json({ artTerms: response });
    } catch (error) {
        console.error('Error in getLastArtTerms:', error);
        next(error);
    }
};

// GET /api/art-terms/by-letter/:letter
export const getArtTermsByLetter = async (
    req: Request<{ letter: string }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const raw = req.params.letter;
        if (!raw) {
            res.status(400).json({ error: 'Invalid letter' });
            return;
        }
        const letter = raw.charAt(0);

        const artTerms = await prisma.artTerm.findMany({
            where: {
                OR: [
                    { title_uk: { startsWith: letter } },
                    { title_en: { startsWith: letter } },
                ],
            },
            orderBy: { title_uk: 'asc' },
        });

        const response = artTerms.map(term => ({
            id: term.id,
            title: term.title_uk,
            description: term.description_uk,
            highlightedProductId: term.highlightedProductId,
        }));

        res.json({ artTerms: response });
    } catch (error) {
        console.error('Error in getArtTermsByLetter:', error);
        next(error);
    }
};

// GET /api/art-terms/:id
export const getArtTermById = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ error: 'Invalid id' });
            return;
        }

        const term = await prisma.artTerm.findUniqueOrThrow({
            where: { id },
        });

        const lang = (req.query.lang as string)?.split('-')[0] ?? 'uk';
        const title = lang === 'uk' ? term.title_uk : term.title_en;
        const description = lang === 'uk' ? term.description_uk : term.description_en;

        res.json({
            artTerm: {
                id: term.id,
                title,
                description,
                highlightedProductId: term.highlightedProductId,
            },
        });
    } catch (error) {
        console.error('Error in getArtTermById:', error);
        next(error);
    }
};

// GET /api/art-terms/pages
export const getPagesArtTerms = async (
    req: Request<
        {},
        {},
        {},
        { page?: string; pageSize?: string; orderBy?: string; orderDir?: string; search?: string }
    >,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // валідація
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        // пагінація
        const page = Math.max(parseInt(req.query.page ?? '1', 10), 1);
        const pageSize = Math.min(parseInt(req.query.pageSize ?? '20', 10), 20);

        // сортування
        const validCols: Array<[string, 'asc' | 'desc']> = [
            ['createdAt', 'desc'],
            ['title_uk', 'asc'],
            ['title_en', 'asc'],
        ];
        const orderBy = (req.query.orderBy as string) ?? validCols[0][0];
        if (!validCols.some(([col]) => col === orderBy)) {
            res.status(400).json({ error: 'Invalid sort column' });
            return;
        }
        const [, defaultDir] = validCols.find(([col]) => col === orderBy)!;
        const orderDir = (req.query.orderDir as 'asc' | 'desc') ?? defaultDir;

        // пошук
        const search = req.query.search ?? '';
        const filter = search
            ? {
                OR: [
                    { title_uk: { contains: search } },
                    { title_en: { contains: search } },
                    { description_uk: { contains: search } },
                    { description_en: { contains: search } },
                ],
            }
            : {};

        // запит
        const artTerms = await prisma.artTerm.findMany({
            where: filter,
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: { [orderBy]: orderDir },
            select: {
                id: true,
                title_uk: true,
                title_en: true,
                description_uk: true,
                description_en: true,
                highlightedProductId: true,
            },
        });

        res.json({ artTerms });
    } catch (error) {
        console.error('Error in getPagesArtTerms:', error);
        next(error);
    }
};

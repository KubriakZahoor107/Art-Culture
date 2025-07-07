// server/src/controllers/artTermsController.ts
import { Request, Response, NextFunction } from 'express'
import prisma from '../prismaClient.js'
import { validationResult } from 'express-validator'

interface Term {
    id: number
    letter: string
    title: string
    description: string
}

// GET /api/art-terms/:lang
export const getArtTermsByLang = async (
    req: Request<{ lang: string }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        let lang = req.params.lang?.split('-')[0] ?? 'uk'
        if (lang !== 'uk' && lang !== 'en') lang = 'uk'

        const orderBy = lang === 'uk'
            ? { title_uk: 'asc' as const }
            : { title_en: 'asc' as const }

        const artTerms = await prisma.artTerm.findMany({
            orderBy,
        })

        // Підготуємо масив термінів із літерою
        const terms: Term[] = artTerms.map(term => ({
            id: term.id,
            letter: (lang === 'uk' ? term.title_uk : term.title_en)[0],
            title: lang === 'uk' ? term.title_uk : term.title_en,
            description: lang === 'uk' ? term.description_uk : term.description_en,
        }))

        // Вибираємо перший термін кожної літери
        const firstTerms: Term[] = []
        for (const item of terms) {
            const exists = firstTerms.some(t => t.letter === item.letter)
            if (!exists) firstTerms.push(item)
        }

        res.json({ artTerms: firstTerms })
    } catch (error) {
        console.error('Error fetching art terms by lang:', error)
        next(error)
    }
}

// GET /api/art-terms/last/:lang
export const getLastArtTerms = async (
    req: Request<{ lang: string }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        let lang = req.params.lang?.split('-')[0] ?? 'uk'
        if (lang !== 'uk' && lang !== 'en') lang = 'uk'

        const artTerms = await prisma.artTerm.findMany({
            orderBy: { createdAt: 'desc' },
            take: 15,
        })

        res.json({ artTerms })
    } catch (error) {
        console.error('Error fetching last art terms:', error)
        next(error)
    }
}

// GET /api/art-terms/by-letter/:letter
export const getArtTermsByLetter = async (
    req: Request<{ letter: string }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const raw = req.params.letter
        if (!raw) {
            res.status(400).json({ error: 'Invalid letter' })
            return
        }
        const letter = raw[0]

        const artTerms = await prisma.artTerm.findMany({
            where: {
                OR: [
                    { title_uk: { startsWith: letter } },
                    { title_en: { startsWith: letter } },
                ],
            },
            orderBy:
                letter === 'uk'
                    ? { title_uk: 'asc' as const }
                    : { title_en: 'asc' as const },
        })

        res.json({ artTerms })
    } catch (error) {
        console.error('Error fetching art terms by letter:', error)
        next(error)
    }
}

// GET /api/art-terms/:id
export const getArtTermById = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id = parseInt(req.params.id, 10)
        if (isNaN(id)) {
            res.status(400).json({ error: 'Invalid id' })
            return
        }

        const artTerm = await prisma.artTerm.findFirstOrThrow({
            where: { id },
        })

        res.json({ artTerm })
    } catch (error) {
        console.error('Error fetching art term by id:', error)
        next(error)
    }
}

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
        // 1) Валідація express-validator
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() })
            return
        }

        // 2) Пагінація
        const page = Math.max(parseInt(req.query.page ?? '1', 10), 1)
        const pageSize = Math.min(parseInt(req.query.pageSize ?? '20', 10), 20)

        // 3) Сортування
        const validColumns: Array<[string, 'asc' | 'desc']> = [
            ['createdAt', 'desc'],
            ['title', 'asc'],
            ['status', 'asc'],
        ]
        const orderBy = req.query.orderBy ?? validColumns[0][0]
        if (!validColumns.some(([col]) => col === orderBy)) {
            res.status(400).json({ error: 'Invalid sort column' })
            return
        }
        const [, defaultDir] = validColumns.find(([col]) => col === orderBy)!
        const orderDir = (req.query.orderDir as 'asc' | 'desc') ?? defaultDir
        if (!['asc', 'desc'].includes(orderDir)) {
            res.status(400).json({ error: 'Invalid sort direction' })
            return
        }

        // 4) Фільтр пошуку
        const search = req.query.search ?? ''
        const filter = search
            ? {
                OR: [
                    { title_uk: { contains: search } },
                    { title_en: { contains: search } },
                    { description_uk: { contains: search } },
                    { description_en: { contains: search } },
                ],
            }
            : {}

        // 5) Запит до БД
        const artTerms = await prisma.artTerm.findMany({
            where: filter,
            select: {
                id: true,
                title_uk: true,
                title_en: true,
                description_uk: true,
                description_en: true,
            },
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: { [orderBy]: orderDir },
        })

        res.json({ artTerms })
    } catch (error) {
        console.error('Error fetching paged art terms:', error)
        next(error)
    }
}

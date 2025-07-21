import { PrismaClient, Role, PostStatus, ProductStatus } from '@prisma/client'; // Імпортуємо ENUMи
// import fs from 'fs'; // Залишаємо, хоча і не використовується в моку
// import path from 'path'; // Залишаємо, хоча і не використовується в моку

const prisma = new PrismaClient();

async function importData() {
    try {
        console.log('Starting data transformation and import...');

        // --- ТИМЧАСОВІ МОК-ДАНІ ДЛЯ ДЕМОНСТРАЦІЇ ---
        // Ви ПОВИННІ замінити це фактичними даними, витягнутими з вашого dump.sql
        // Зверніть увагу на СТАРІ назви стовпців (наприклад, createdAt, houseNumber, highlightedProductId)
        // та ВІДСУТНІСТЬ 'status', 'resetToken', 'resetTokenExpiry' у СТАРИХ даних.

        // Мок-дані для User (стара схема)
        const mockOldUsers = [
            {
                id: 1,
                email: 'user1@example.com',
                password: 'hashedpassword1',
                role: 'USER', // Стара роль (string)
                images: null, // Старі зображення (можливо, string або null)
                title: 'Old User 1',
                bio: 'Bio 1',
                createdAt: new Date('2023-01-01T10:00:00Z'),
                updatedAt: new Date('2023-01-01T10:00:00Z'),
                country: 'Ukraine',
                houseNumber: '1A', // Стара назва
                lat: 50.45,
                lon: 30.52,
                postcode: '01001',
                state: 'Kyiv',
                street: 'Main St',
                city: 'Kyiv'
            },
            {
                id: 2,
                email: 'museum1@example.com',
                password: 'hashedpassword2',
                role: 'MUSEUM',
                images: null,
                title: 'Kyiv Art Museum',
                bio: 'A museum of fine arts.',
                createdAt: new Date('2022-05-15T09:00:00Z'),
                updatedAt: new Date('2022-05-15T09:00:00Z'),
                country: 'Ukraine',
                houseNumber: '10',
                lat: 50.44,
                lon: 30.51,
                postcode: '01002',
                state: 'Kyiv',
                street: 'Museum St',
                city: 'Kyiv'
            }
            // Додайте більше старих даних користувачів тут
        ];

        // Мок-дані для Post (стара схема)
        const mockOldPosts = [
            {
                id: 1,
                title_en: 'Old Post 1 EN',
                title_uk: 'Старий Пост 1 УКР',
                content_en: 'Content 1 EN',
                content_uk: 'Контент 1 УКР',
                authorId: 1, // Стара назва
                images: null,
                createdAt: new Date('2023-02-01T12:00:00Z'),
                updatedAt: new Date('2023-02-01T12:00:00Z'),
                creator_id: null, // Стара назва
                exhibition_id: null, // Стара назва
                museum_id: null // Стара назва
            },
            {
                id: 2,
                title_en: 'Old Post 2 EN',
                title_uk: 'Старий Пост 2 УКР',
                content_en: 'Content 2 EN',
                content_uk: 'Контент 2 УКР',
                authorId: 2,
                images: null,
                createdAt: new Date('2023-03-01T14:00:00Z'),
                updatedAt: new Date('2023-03-01T14:00:00Z'),
                creator_id: null,
                exhibition_id: null,
                museum_id: null
            }
            // Додайте більше старих даних постів тут
        ];

        // Мок-дані для Product (стара схема)
        const mockOldProducts = [
            {
                id: 1,
                title_en: 'Old Painting 1 EN',
                title_uk: 'Стара Картина 1 УКР',
                description_en: 'Description 1 EN',
                description_uk: 'Опис 1 УКР',
                specs_en: 'Specs 1 EN',
                specs_uk: 'Специфікації 1 УКР',
                createdAt: new Date('2023-04-01T10:00:00Z'),
                updatedAt: new Date('2023-04-01T10:00:00Z'),
                authorId: 1,
                museumId: 2,
                size: '100x100cm',
                style_en: 'Abstract',
                style_uk: 'Абстракція',
                technique_en: 'Oil on canvas',
                technique_uk: 'Олія на полотні',
                dateofcreation: '2022', // Стара назва
            },
            // Додайте більше старих даних продуктів тут
        ];

        // --- КІНЕЦЬ ТИМЧАСОВИХ МОК-ДАНИХ ---


        // 2. Трансформація та вставка користувачів (Users)
        for (const oldUser of mockOldUsers) {
            const upsertData = { // Включаємо id в upsertData, оскільки він використовується в create
                email: oldUser.email,
                password: oldUser.password,
                role: oldUser.role as Role,
                images: oldUser.images, // Передаємо напряму, оскільки тип Json?
                title: oldUser.title,
                bio: oldUser.bio,
                createdAt: oldUser.createdAt,
                updatedAt: oldUser.updatedAt,
                country: oldUser.country,
                houseNumber: oldUser.houseNumber,
                lat: oldUser.lat,
                lon: oldUser.lon,
                postcode: oldUser.postcode,
                state: oldUser.state,
                street: oldUser.street,
                city: oldUser.city,
                resetToken: null,
                resetTokenExpiry: null,
            };

            await prisma.user.upsert({
                where: { id: oldUser.id },
                update: upsertData,
                create: { ...upsertData, id: oldUser.id }, // Явно вказуємо id для create
            });
            console.log(`Upserted User: ${oldUser.email}`);
        }

        // 3. Трансформація та вставка постів (Posts)
        for (const oldPost of mockOldPosts) {
            const postData = {
                title_en: oldPost.title_en,
                title_uk: oldPost.title_uk,
                content_en: oldPost.content_en,
                content_uk: oldPost.content_uk,
                images: oldPost.images, // Передаємо напряму, оскільки тип Json?
                createdAt: oldPost.createdAt,
                updatedAt: oldPost.updatedAt,
                creatorId: oldPost.creator_id,      // ВИПРАВЛЕНО: тепер відповідає схемі
                exhibitionId: oldPost.exhibition_id,  // ВИПРАВЛЕНО: тепер відповідає схемі
                museumId: oldPost.museum_id,        // ВИПРАВЛЕНО: тепер відповідає схемі
                status: PostStatus.PENDING,
                author: {
                    connect: { id: oldPost.authorId }
                }
            };

            await prisma.post.upsert({
                where: { id: oldPost.id },
                update: postData,
                create: postData, // Видаляємо id з create, оскільки він автоінкрементний
            });
            console.log(`Upserted Post: ${oldPost.title_en}`);
        }

        // 4. Трансформація та вставка продуктів (Products)
        for (const oldProduct of mockOldProducts) {
            const productData: any = {
                title_en: oldProduct.title_en,
                title_uk: oldProduct.title_uk,
                description_en: oldProduct.description_en,
                description_uk: oldProduct.description_uk,
                specs_en: oldProduct.specs_en,
                specs_uk: oldProduct.specs_uk,
                createdAt: oldProduct.createdAt,
                updatedAt: oldProduct.updatedAt,
                size: oldProduct.size,
                style_en: oldProduct.style_en,
                style_uk: oldProduct.style_uk,
                technique_en: oldProduct.technique_en,
                technique_uk: oldProduct.technique_uk,
                dateOfCreation: oldProduct.dateofcreation,
                status: ProductStatus.PENDING,
                author: {
                    connect: { id: oldProduct.authorId }
                }
            };

            if (oldProduct.museumId) {
                productData.museum = {
                    connect: { id: oldProduct.museumId }
                };
            }

            await prisma.product.upsert({
                where: { id: oldProduct.id },
                update: productData,
                create: productData, // Видаляємо id з create, оскільки він автоінкрементний
            });
            console.log(`Upserted Product: ${oldProduct.title_en}`);
        }

        console.log('Data transformation and import complete.');
    } catch (error) {
        console.error('Error during data import:', error);
    } finally {
        await prisma.$disconnect();
    }
}

importData();

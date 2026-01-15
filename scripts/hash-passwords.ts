import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🔒 Starting Password Hashing Migration...');
    const users = await prisma.user.findMany();

    console.log(`Found ${users.length} users.`);

    let updatedCount = 0;

    for (const user of users) {
        if (user.passwordHash && !user.passwordHash.startsWith('$2a$') && !user.passwordHash.startsWith('$2b$')) {
            // Assuming it's plain text if it doesn't look like a bcrypt hash
            // (Bcrypt hashes start with $2a$ or $2b$)

            console.log(`  hashing password for user: ${user.email}`);

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(user.passwordHash, salt);

            await prisma.user.update({
                where: { id: user.id },
                data: { passwordHash: hashedPassword },
            });

            updatedCount++;
        } else {
            console.log(`  skipping ${user.email} (already hashed or empty)`);
        }
    }

    console.log(`✅ Migration complete. Updated ${updatedCount} users.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

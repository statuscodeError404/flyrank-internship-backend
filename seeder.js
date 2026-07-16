const fs = require('fs');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

dotenv.config();

const prisma = new PrismaClient();

// Read JSON files
const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'));
const courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/_data/reviews.json`, 'utf-8'));

// Import data into DB
const importData = async () => {
    try {
        // Hash passwords before inserting
        const hashedUsers = await Promise.all(
            users.map(async (user) => {
                const salt = await bcrypt.genSalt(10);
                const password = await bcrypt.hash(user.password, salt);
                return { ...user, password };
            })
        );

        await prisma.user.createMany({ data: hashedUsers });
        await prisma.bootcamp.createMany({ data: bootcamps });
        await prisma.course.createMany({ data: courses });
        await prisma.review.createMany({ data: reviews });

        console.log('Data imported...');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
};

// Delete data from DB
const deleteData = async () => {
    try {
        await prisma.review.deleteMany();
        await prisma.course.deleteMany();
        await prisma.bootcamp.deleteMany();
        await prisma.user.deleteMany();

        console.log('Data destroyed...');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
};

if (process.argv[2] === '-i') {
    importData();
} else if (process.argv[2] === '-d') {
    deleteData();
} else {
    console.log('Use -i to import or -d to delete data');
    process.exit();
}

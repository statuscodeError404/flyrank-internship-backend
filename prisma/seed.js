const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // ─── Clean existing data (order matters for FK constraints) ───────────────
    await prisma.review.deleteMany();
    await prisma.course.deleteMany();
    await prisma.bootcamp.deleteMany();
    await prisma.user.deleteMany();

    // ─── Users ────────────────────────────────────────────────────────────────
    const salt = await bcrypt.genSalt(10);
    const hash = (pw) => bcrypt.hash(pw, salt);

    const users = await Promise.all([
        prisma.user.create({
            data: {
                id: '11111111-1111-1111-1111-111111111001',
                name: 'Alice Admin',
                email: 'admin@devcamper.io',
                role: 'admin',
                password: await hash('Admin@1234'),
            },
        }),
        prisma.user.create({
            data: {
                id: '11111111-1111-1111-1111-111111111002',
                name: 'John Doe',
                email: 'john@devcamper.io',
                role: 'publisher',
                password: await hash('Publisher@1234'),
            },
        }),
        prisma.user.create({
            data: {
                id: '11111111-1111-1111-1111-111111111003',
                name: 'Sarah Connor',
                email: 'sarah@devcamper.io',
                role: 'publisher',
                password: await hash('Publisher@1234'),
            },
        }),
        prisma.user.create({
            data: {
                id: '11111111-1111-1111-1111-111111111004',
                name: 'Mike Turner',
                email: 'mike@devcamper.io',
                role: 'publisher',
                password: await hash('Publisher@1234'),
            },
        }),
        prisma.user.create({
            data: {
                id: '11111111-1111-1111-1111-111111111005',
                name: 'Emma Wilson',
                email: 'emma@devcamper.io',
                role: 'publisher',
                password: await hash('Publisher@1234'),
            },
        }),
        prisma.user.create({
            data: {
                id: '11111111-1111-1111-1111-111111111006',
                name: 'Greg Harris',
                email: 'greg@devcamper.io',
                role: 'user',
                password: await hash('User@1234'),
            },
        }),
        prisma.user.create({
            data: {
                id: '11111111-1111-1111-1111-111111111007',
                name: 'Derek Glover',
                email: 'derek@devcamper.io',
                role: 'user',
                password: await hash('User@1234'),
            },
        }),
        prisma.user.create({
            data: {
                id: '11111111-1111-1111-1111-111111111008',
                name: 'Stephanie Hanson',
                email: 'steph@devcamper.io',
                role: 'user',
                password: await hash('User@1234'),
            },
        }),
        prisma.user.create({
            data: {
                id: '11111111-1111-1111-1111-111111111009',
                name: 'Ryan Bolin',
                email: 'ryan@devcamper.io',
                role: 'user',
                password: await hash('User@1234'),
            },
        }),
        prisma.user.create({
            data: {
                id: '11111111-1111-1111-1111-111111111010',
                name: 'Sara Kensing',
                email: 'sara@devcamper.io',
                role: 'user',
                password: await hash('User@1234'),
            },
        }),
    ]);

    console.log(`Created ${users.length} users`);

    // ─── Bootcamps ────────────────────────────────────────────────────────────
    const bootcamps = await Promise.all([
        prisma.bootcamp.create({
            data: {
                id: '22222222-2222-2222-2222-222222222001',
                name: 'Devworks Bootcamp',
                slug: 'devworks-bootcamp',
                description:
                    'Devworks is a full stack JavaScript bootcamp located in the heart of Boston that focuses on the technologies you need to get a high paying job as a web developer.',
                website: 'https://devworks.com',
                phone: '(111) 111-1111',
                email: 'enroll@devworks.com',
                address: '233 Bay State Rd, Boston, MA 02215',
                formattedAddress: '233 Bay State Rd, Boston, MA 02215, US',
                city: 'Boston',
                state: 'MA',
                zipcode: '02215',
                country: 'US',
                careers: ['Web Development', 'UI/UX', 'Business'],
                averageRating: 9.0,
                averageCost: 9000,
                housing: true,
                jobAssistance: true,
                jobGuarantee: false,
                acceptGi: true,
                userId: '11111111-1111-1111-1111-111111111002',
            },
        }),
        prisma.bootcamp.create({
            data: {
                id: '22222222-2222-2222-2222-222222222002',
                name: 'ModernTech Bootcamp',
                slug: 'moderntech-bootcamp',
                description:
                    'ModernTech has one goal — to make you a rockstar developer and/or designer with a six-figure salary. We teach both development and UI/UX design.',
                website: 'https://moderntech.com',
                phone: '(222) 222-2222',
                email: 'enroll@moderntech.com',
                address: '220 Pawtucket St, Lowell, MA 01854',
                formattedAddress: '220 Pawtucket St, Lowell, MA 01854, US',
                city: 'Lowell',
                state: 'MA',
                zipcode: '01854',
                country: 'US',
                careers: ['Web Development', 'UI/UX', 'Mobile Development'],
                averageRating: 5.5,
                averageCost: 11000,
                housing: false,
                jobAssistance: true,
                jobGuarantee: false,
                acceptGi: true,
                userId: '11111111-1111-1111-1111-111111111003',
            },
        }),
        prisma.bootcamp.create({
            data: {
                id: '22222222-2222-2222-2222-222222222003',
                name: 'Codemasters',
                slug: 'codemasters',
                description:
                    'Is coding your passion? Codemasters will give you the skills and tools to become the best developer possible. We specialize in full stack web development and data science.',
                website: 'https://codemasters.com',
                phone: '(333) 333-3333',
                email: 'enroll@codemasters.com',
                address: '85 South Ave, Burlington, VT 05401',
                formattedAddress: '85 South Ave, Burlington, VT 05401, US',
                city: 'Burlington',
                state: 'VT',
                zipcode: '05401',
                country: 'US',
                careers: ['Web Development', 'Data Science', 'Business'],
                averageRating: 6.0,
                averageCost: 10500,
                housing: false,
                jobAssistance: false,
                jobGuarantee: false,
                acceptGi: false,
                userId: '11111111-1111-1111-1111-111111111004',
            },
        }),
        prisma.bootcamp.create({
            data: {
                id: '22222222-2222-2222-2222-222222222004',
                name: 'Devcentral Bootcamp',
                slug: 'devcentral-bootcamp',
                description:
                    'Devcentral specializes in front end and full stack web development with a strong focus on modern frameworks, mobile development, and real-world project experience.',
                website: 'https://devcentral.com',
                phone: '(444) 444-4444',
                email: 'enroll@devcentral.com',
                address: '45 Upper Rd, Kingston, NY 12401',
                formattedAddress: '45 Upper Rd, Kingston, NY 12401, US',
                city: 'Kingston',
                state: 'NY',
                zipcode: '12401',
                country: 'US',
                careers: ['Mobile Development', 'Web Development', 'Data Science', 'Business'],
                averageRating: 8.5,
                averageCost: 7000,
                housing: false,
                jobAssistance: true,
                jobGuarantee: true,
                acceptGi: true,
                userId: '11111111-1111-1111-1111-111111111005',
            },
        }),
    ]);

    console.log(`Created ${bootcamps.length} bootcamps`);

    // ─── Courses ──────────────────────────────────────────────────────────────
    const courses = await prisma.course.createMany({
        data: [
            // Devworks courses
            {
                id: '33333333-3333-3333-3333-333333333001',
                title: 'Front End Web Development',
                description:
                    'Master HTML, CSS, and front end JavaScript along with tools like Git, VSCode, and front end frameworks like Vue and React.',
                weeks: '8',
                tuition: 8000,
                minimumSkill: 'beginner',
                scholarshipAvailable: true,
                bootcampId: '22222222-2222-2222-2222-222222222001',
                userId: '11111111-1111-1111-1111-111111111002',
            },
            {
                id: '33333333-3333-3333-3333-333333333002',
                title: 'Full Stack Web Development',
                description:
                    'Learn full stack web development — frontend with HTML/CSS/JS/React and backend with Node.js/Express/PostgreSQL. Build and deploy production-ready apps.',
                weeks: '12',
                tuition: 10000,
                minimumSkill: 'intermediate',
                scholarshipAvailable: true,
                bootcampId: '22222222-2222-2222-2222-222222222001',
                userId: '11111111-1111-1111-1111-111111111002',
            },
            // ModernTech courses
            {
                id: '33333333-3333-3333-3333-333333333003',
                title: 'Full Stack Web Dev with .NET',
                description:
                    'Learn front end with HTML, CSS and JavaScript then dive into the backend with C# and ASP.NET Core backed by PostgreSQL.',
                weeks: '10',
                tuition: 12000,
                minimumSkill: 'intermediate',
                scholarshipAvailable: true,
                bootcampId: '22222222-2222-2222-2222-222222222002',
                userId: '11111111-1111-1111-1111-111111111003',
            },
            {
                id: '33333333-3333-3333-3333-333333333004',
                title: 'UI/UX Design',
                description:
                    'Create beautiful, accessible interfaces. A mix of design theory and development practice to produce modern user experiences on web and mobile.',
                weeks: '12',
                tuition: 10000,
                minimumSkill: 'beginner',
                scholarshipAvailable: true,
                bootcampId: '22222222-2222-2222-2222-222222222002',
                userId: '11111111-1111-1111-1111-111111111003',
            },
            // Codemasters courses
            {
                id: '33333333-3333-3333-3333-333333333005',
                title: 'Web Design & Development',
                description:
                    'Get started building websites and web apps with HTML/CSS/JavaScript and PHP. Covers Git, deployment, and introductory backend development.',
                weeks: '10',
                tuition: 9000,
                minimumSkill: 'beginner',
                scholarshipAvailable: true,
                bootcampId: '22222222-2222-2222-2222-222222222003',
                userId: '11111111-1111-1111-1111-111111111004',
            },
            {
                id: '33333333-3333-3333-3333-333333333006',
                title: 'Data Science & Machine Learning',
                description:
                    'Learn Python for data science, machine learning, and big data tools including pandas, scikit-learn, and TensorFlow.',
                weeks: '10',
                tuition: 12000,
                minimumSkill: 'intermediate',
                scholarshipAvailable: false,
                bootcampId: '22222222-2222-2222-2222-222222222003',
                userId: '11111111-1111-1111-1111-111111111004',
            },
            // Devcentral courses
            {
                id: '33333333-3333-3333-3333-333333333007',
                title: 'Modern Web Development',
                description:
                    'Build high quality web applications with React, Node.js, and PostgreSQL. Covers REST APIs, authentication, and cloud deployment.',
                weeks: '8',
                tuition: 8000,
                minimumSkill: 'beginner',
                scholarshipAvailable: false,
                bootcampId: '22222222-2222-2222-2222-222222222004',
                userId: '11111111-1111-1111-1111-111111111005',
            },
            {
                id: '33333333-3333-3333-3333-333333333008',
                title: 'Software Quality Assurance',
                description:
                    'Everything you need to know about QA — manual testing, automated testing with Jest and Cypress, CI/CD pipelines, and bug tracking.',
                weeks: '6',
                tuition: 5000,
                minimumSkill: 'intermediate',
                scholarshipAvailable: false,
                bootcampId: '22222222-2222-2222-2222-222222222004',
                userId: '11111111-1111-1111-1111-111111111005',
            },
            {
                id: '33333333-3333-3333-3333-333333333009',
                title: 'iOS Development with Swift',
                description:
                    'Get started building mobile applications for iOS using Swift, SwiftUI, and Xcode. Build and publish real apps to the App Store.',
                weeks: '8',
                tuition: 6000,
                minimumSkill: 'intermediate',
                scholarshipAvailable: false,
                bootcampId: '22222222-2222-2222-2222-222222222004',
                userId: '11111111-1111-1111-1111-111111111005',
            },
        ],
    });

    console.log(`Created ${courses.count} courses`);

    // ─── Reviews ──────────────────────────────────────────────────────────────
    const reviews = await prisma.review.createMany({
        data: [
            // Devworks reviews
            {
                id: '44444444-4444-4444-4444-444444444001',
                title: 'Learned a ton!',
                text: 'This bootcamp completely changed my career. The instructors are knowledgeable, patient, and genuinely invested in your success. The curriculum is up to date and the projects are real-world quality.',
                rating: 8,
                bootcampId: '22222222-2222-2222-2222-222222222001',
                userId: '11111111-1111-1111-1111-111111111006',
            },
            {
                id: '44444444-4444-4444-4444-444444444002',
                title: 'Absolutely worth every penny',
                text: 'I was skeptical at first but Devworks delivered beyond my expectations. Within two months of graduating I had three job offers. The career support team is fantastic.',
                rating: 10,
                bootcampId: '22222222-2222-2222-2222-222222222001',
                userId: '11111111-1111-1111-1111-111111111007',
            },
            // ModernTech reviews
            {
                id: '44444444-4444-4444-4444-444444444003',
                title: 'Got me a developer job',
                text: 'ModernTech was a solid experience overall. The UI/UX track was excellent and the instructors pushed us hard. Job placement could be better but the skills I gained were real.',
                rating: 7,
                bootcampId: '22222222-2222-2222-2222-222222222002',
                userId: '11111111-1111-1111-1111-111111111008',
            },
            {
                id: '44444444-4444-4444-4444-444444444004',
                title: 'Not that great',
                text: 'The course content was decent but the pacing was all over the place. Some weeks felt rushed and the support outside class hours was almost nonexistent. Expected more for the price.',
                rating: 4,
                bootcampId: '22222222-2222-2222-2222-222222222002',
                userId: '11111111-1111-1111-1111-111111111009',
            },
            // Codemasters reviews
            {
                id: '44444444-4444-4444-4444-444444444005',
                title: 'Great overall experience',
                text: 'Codemasters gave me a solid foundation in data science. The Python curriculum is thorough and the instructors bring real industry experience. Would recommend to anyone serious about data.',
                rating: 7,
                bootcampId: '22222222-2222-2222-2222-222222222003',
                userId: '11111111-1111-1111-1111-111111111010',
            },
            {
                id: '44444444-4444-4444-4444-444444444006',
                title: 'Decent but not the best',
                text: 'The web design course was okay but nothing groundbreaking. Content felt a little outdated in places and the facilities could use an upgrade. Good for beginners though.',
                rating: 5,
                bootcampId: '22222222-2222-2222-2222-222222222003',
                userId: '11111111-1111-1111-1111-111111111006',
            },
            // Devcentral reviews
            {
                id: '44444444-4444-4444-4444-444444444007',
                title: 'Best instructors I have ever had',
                text: 'Devcentral stands out because of its people. The instructors are brilliant communicators who make complex topics feel approachable. The job guarantee alone is worth the price of admission.',
                rating: 10,
                bootcampId: '22222222-2222-2222-2222-222222222004',
                userId: '11111111-1111-1111-1111-111111111007',
            },
            {
                id: '44444444-4444-4444-4444-444444444008',
                title: 'Was worth the investment',
                text: 'I completed the iOS Development track and landed a junior dev role three weeks after graduating. The curriculum is current and the capstone project gave me something real to show employers.',
                rating: 7,
                bootcampId: '22222222-2222-2222-2222-222222222004',
                userId: '11111111-1111-1111-1111-111111111008',
            },
        ],
    });

    console.log(`Created ${reviews.count} reviews`);
    console.log('Seeding complete.');
}

main()
    .catch((err) => {
        console.error(err);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());

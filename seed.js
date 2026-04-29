const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const names = [
    '김민수','이지은','박현우','최서연','정다현','오승현','강예린','한지우','유재훈','배수진',
    '조민아','신우진','황예린','곽성민','임다은','전현수','배지민','서유진','홍성현','문지원',
    '전지호','양수아','배민우','한예진','구현우','채민아','강수현','남지훈','오은지','서준호',
    '정하늘','이도연','최민석','홍채원'
  ];
  const levels = ['Sardonyx', 'Emerald', 'Chalcedony'];
  const grades = {
    Sardonyx: ['Epsilon', 'Zeta', 'Eta'],
    Emerald: ['Alpha', 'Beta', 'Gamma', 'Delta'],
    Chalcedony: ['Alpha', 'Beta', 'Gamma', 'Delta'],
  };

  console.log('Seeding students...');

  for (let i = 0; i < names.length; i++) {
    const level = levels[i % levels.length];
    const gradeList = grades[level];
    const grade = gradeList[i % gradeList.length];
    const gender = i % 2 === 0 ? 'M' : 'F';

    await prisma.student.upsert({
      where: { name_level_grade: { name: names[i], level, grade } },
      update: {},
      create: {
        name: names[i],
        level,
        grade,
        gender,
        rewardPoints: Math.floor(Math.random() * 10),
        penaltyPoints: Math.floor(Math.random() * 5),
      },
    });
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });

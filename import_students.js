require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const xlsx = require('xlsx');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL,
    },
  },
});

async function main() {
  const wb = xlsx.readFile('student_upload.xlsx');
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(ws);

  let successCount = 0;
  let errorCount = 0;

  console.log(`총 ${data.length}명의 데이터를 읽었습니다. 업로드를 시작합니다...`);

  for (const row of data) {
    if (!row['이름'] || !row['레벨'] || !row['그레이드']) continue;
    
    try {
      await prisma.student.upsert({
        where: {
          name_level_grade: {
            name: row['이름'],
            level: row['레벨'],
            grade: row['그레이드'],
          }
        },
        update: {},
        create: {
          name: row['이름'],
          level: row['레벨'],
          grade: row['그레이드'],
        }
      });
      successCount++;
    } catch (err) {
      console.error('Error inserting:', row, err);
      errorCount++;
    }
  }

  console.log(`완료: ${successCount}명 성공, ${errorCount}명 실패.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });

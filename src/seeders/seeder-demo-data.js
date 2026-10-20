'use strict';
// Demo data for local development:
//   npx sequelize-cli db:seed --seed seeder-demo-data.js
// - test accounts (password 123456): admin hai@gmail.com, doctor hai123@gmail.com
// - doctor info for doctors that have none
// - schedules for every doctor for the next 14 days
// - a few handbook articles

const bcrypt = require('bcryptjs');

const TIME_TYPES = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8'];

const handbooks = [
  {
    title: '7 dấu hiệu cảnh báo bệnh tim mạch bạn không nên bỏ qua',
    image: '/images/handbook/1.png',
    description: 'Đau ngực, khó thở, mệt mỏi kéo dài... là những dấu hiệu sớm của bệnh tim mạch cần được thăm khám kịp thời.',
    contentMarkdown: '## Dấu hiệu cảnh báo\n\n1. Đau tức ngực khi gắng sức\n2. Khó thở, hụt hơi\n3. Mệt mỏi kéo dài không rõ nguyên nhân\n4. Hồi hộp, tim đập nhanh\n5. Phù chân\n6. Chóng mặt, ngất\n7. Đau lan ra vai trái, cánh tay\n\n## Khi nào cần đi khám?\n\nNếu bạn gặp một hoặc nhiều dấu hiệu trên, hãy đặt lịch khám với bác sĩ chuyên khoa Tim mạch sớm nhất có thể.',
  },
  {
    title: 'Làm thế nào để giảm căng thẳng, lo âu trong công việc?',
    image: '/images/handbook/2.png',
    description: 'Áp lực công việc kéo dài có thể dẫn đến rối loạn lo âu. Một vài thói quen nhỏ giúp bạn cân bằng lại tinh thần.',
    contentMarkdown: '## Nhận biết căng thẳng\n\nMất ngủ, cáu gắt, khó tập trung là những biểu hiện thường gặp.\n\n## Gợi ý\n\n- Ngủ đủ 7-8 tiếng mỗi ngày\n- Tập thể dục 30 phút mỗi ngày\n- Hít thở sâu, thiền\n- Chia sẻ với người thân\n\nNếu tình trạng kéo dài trên 2 tuần, hãy gặp bác sĩ Sức khoẻ tâm thần.',
  },
  {
    title: 'Bảo vệ đôi mắt khi làm việc với máy tính',
    image: '/images/handbook/3.png',
    description: 'Quy tắc 20-20-20 và những lưu ý đơn giản giúp giảm mỏi mắt, khô mắt cho dân văn phòng.',
    contentMarkdown: '## Quy tắc 20-20-20\n\nCứ 20 phút, nhìn xa 20 feet (6m) trong 20 giây.\n\n## Lưu ý khác\n\n- Đặt màn hình cách mắt 50-70cm\n- Điều chỉnh độ sáng phù hợp\n- Chớp mắt thường xuyên\n- Khám mắt định kỳ 6-12 tháng/lần',
  },
  {
    title: 'Những mốc khám thai quan trọng mẹ bầu cần nhớ',
    image: '/images/handbook/4.png',
    description: 'Lịch khám thai định kỳ giúp theo dõi sự phát triển của thai nhi và phát hiện sớm bất thường.',
    contentMarkdown: '## Các mốc khám thai\n\n- **Tuần 5-8:** xác định thai, tim thai\n- **Tuần 11-13:** đo độ mờ da gáy\n- **Tuần 20-24:** siêu âm hình thái\n- **Tuần 24-28:** tầm soát tiểu đường thai kỳ\n- **Tuần 32-36:** theo dõi ngôi thai, nước ối\n\nHãy chọn bác sĩ Sản phụ khoa uy tín để đồng hành suốt thai kỳ.',
  },
  {
    title: 'Đau lưng, mỏi gối: khi nào là dấu hiệu bệnh cơ xương khớp?',
    image: '/images/handbook/5.png',
    description: 'Đau khớp kéo dài, cứng khớp buổi sáng có thể là dấu hiệu của viêm khớp hoặc thoái hoá.',
    contentMarkdown: '## Dấu hiệu cần lưu ý\n\n- Cứng khớp buổi sáng trên 30 phút\n- Sưng, nóng, đỏ quanh khớp\n- Đau tăng khi vận động\n- Tiếng lạo xạo khi cử động\n\n## Phòng ngừa\n\nDuy trì cân nặng hợp lý, vận động đều đặn và bổ sung canxi, vitamin D.',
  },
  {
    title: 'Sức khoẻ nam giới: những điều nên kiểm tra định kỳ',
    image: '/images/handbook/6.png',
    description: 'Tầm soát định kỳ giúp nam giới phát hiện sớm các vấn đề về tim mạch, tuyến tiền liệt và nội tiết.',
    contentMarkdown: '## Nên kiểm tra\n\n- Huyết áp, mỡ máu, đường huyết\n- Chức năng gan, thận\n- Tuyến tiền liệt (từ 45 tuổi)\n- Nội tiết tố nam\n\nĐặt lịch với bác sĩ Nam học để được tư vấn riêng.',
  },
];

const extraDoctorInfor = {
  2: { specialtyId: 4, clinicId: 4, priceId: 'PRI3', provinceId: 'PRO2', paymentId: 'PAY3', nameClinic: 'Bệnh viện Chuyên khoa Mắt Cao Thắng', addressClinic: '135B Trần Bình Trọng, Quận 5, TP. HCM', note: 'Ưu tiên đặt lịch trước 1 ngày' },
  3: { specialtyId: 9, clinicId: 5, priceId: 'PRI2', provinceId: 'PRO1', paymentId: 'PAY1', nameClinic: 'Phòng khám Đa khoa Quốc tế Golden Healthcare', addressClinic: '37 Hoàng Hoa Thám, Tân Bình, TP. HCM', note: 'Khám nhi từ 0-16 tuổi' },
  6: { clinicId: 8 },
};

// tiny converter for the seed content above (headings, lists, bold, paragraphs)
const markdownToHtml = (text) => {
  const inline = (line) => line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  const blocks = text.split(/\n\n+/);
  return blocks.map(block => {
    const lines = block.split('\n');
    if (block.startsWith('## ')) return `<h2>${inline(block.slice(3))}</h2>`;
    if (lines.every(line => line.startsWith('- '))) return `<ul>${lines.map(line => `<li>${inline(line.slice(2))}</li>`).join('')}</ul>`;
    if (lines.every(line => /^\d+\. /.test(line))) return `<ol>${lines.map(line => `<li>${inline(line.replace(/^\d+\. /, ''))}</li>`).join('')}</ol>`;
    return `<p>${inline(lines.join('<br/>'))}</p>`;
  }).join('\n');
};

module.exports = {
  up: async (queryInterface) => {
    const q = (sql, replacements) => queryInterface.sequelize.query(sql, { replacements });
    const now = new Date();

    // test accounts
    const hash = bcrypt.hashSync('123456', bcrypt.genSaltSync(10));
    await q(`UPDATE "Users" SET password = :hash WHERE email IN ('hai@gmail.com', 'hai123@gmail.com')`, { hash });

    // doctor info for doctors without it
    for (const [doctorId, infor] of Object.entries(extraDoctorInfor)) {
      const [rows] = await q(`SELECT id FROM "Doctor_Infor" WHERE "doctorId" = :doctorId`, { doctorId });
      if (rows.length > 0) {
        const sets = Object.keys(infor).map(k => `"${k}" = :${k}`).join(', ');
        await q(`UPDATE "Doctor_Infor" SET ${sets}, "updatedAt" = now() WHERE "doctorId" = :doctorId`, { ...infor, doctorId });
      } else {
        await queryInterface.bulkInsert('Doctor_Infor', [{ doctorId: +doctorId, ...infor, createdAt: now, updatedAt: now }]);
      }
    }

    // schedules for the next 14 days
    const [doctors] = await q(`SELECT id FROM "Users" WHERE "roleId" = 'R2'`);
    const schedules = [];
    for (let i = 0; i < 14; i++) {
      const day = new Date();
      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() + i);
      if (day.getDay() === 0) continue; // Sunday off
      for (const doctor of doctors) {
        const times = TIME_TYPES.filter((_, index) => (index + doctor.id + i) % 3 !== 0);
        for (const timeType of times) {
          schedules.push({ doctorId: doctor.id, date: day.getTime(), timeType, maxNumber: 10, currentNumber: 0, createdAt: now, updatedAt: now });
        }
      }
    }
    if (schedules.length > 0) {
      const minDate = Math.min(...schedules.map(item => item.date));
      await q(`DELETE FROM "Schedules" WHERE date >= :minDate`, { minDate });
      await queryInterface.bulkInsert('Schedules', schedules);
    }

    // handbooks
    const [existing] = await q(`SELECT title FROM "Handbooks"`);
    const titles = new Set(existing.map(item => item.title));
    const toInsert = handbooks
      .filter(item => !titles.has(item.title))
      .map(item => ({
        ...item,
        contentHTML: markdownToHtml(item.contentMarkdown),
        createdAt: now,
        updatedAt: now,
      }));
    if (toInsert.length > 0) {
      await queryInterface.bulkInsert('Handbooks', toInsert);
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Handbooks', null, {});
  }
};

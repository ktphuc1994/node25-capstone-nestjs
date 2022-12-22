import { PrismaClient, Prisma } from '@prisma/client';
const prisma = new PrismaClient();

import movieList from '../dataJson/DanhSachPhim';
import userList from '../dataJson/DanhSachNguoiDung';

// import bcrypt
import * as bcrypt from 'bcrypt';

const movieData: Prisma.PhimCreateInput[] = movieList;
const userData: Prisma.NguoiDungCreateInput[] = userList;

const main = async () => {
  console.log(`Start seeding ...`);
  for (const m of movieData) {
    const date = new Date(m.ngayKhoiChieu);
    const movie = await prisma.phim.create({
      data: { ...m, ngayKhoiChieu: date.toISOString() },
    });
    console.log(`Created movie with id: ${movie.maPhim}`);
  }

  for (const u of userData) {
    const matKhau = bcrypt.hashSync(u.matKhau, 10);
    const user = await prisma.nguoiDung.create({
      data: { ...u, matKhau },
    });
    console.log(`Created user with id: ${user.taiKhoan}`);
  }
  console.log(`Seeding finished.`);
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

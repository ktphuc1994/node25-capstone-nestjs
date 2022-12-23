import { PrismaClient, Prisma } from '@prisma/client';
const prisma = new PrismaClient();

import movieList from '../dataJson/DanhSachPhim';
import userList from '../dataJson/DanhSachNguoiDung';
import movieChainList from '../dataJson/HeThongRap_CumRap';
import bannerList from '../dataJson/Banner';
import lichChieuList from '../dataJson/LichChieu';

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

  for (const mc of movieChainList) {
    const movieChain = await prisma.heThongRap.create({
      data: mc,
    });
    console.log(`Created Movie Chain with name: ${movieChain.tenHeThongRap}`);
  }

  for (const b of bannerList) {
    const banner = await prisma.banner.create({
      data: b,
    });
    console.log(`Created Banner with name: ${banner.maBanner}`);
  }

  for (const lc of lichChieuList) {
    const date = new Date(lc.ngayGioChieu);
    const lichChieu = await prisma.lichChieu.create({
      data: { ...lc, ngayGioChieu: date.toISOString() },
    });
    console.log(`Created Lich Chieu with name: ${lichChieu.maLichChieu}`);
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

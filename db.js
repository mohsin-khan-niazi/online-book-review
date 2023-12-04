import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const createUser = async (userName) => {
  await prisma.user.create({
    data: {
      name: userName,
    },
  });
};

createUser('mohsin');

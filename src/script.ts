import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const main = async () => {
  const newLink = await prisma.link.create({
    data: {
      description: "fullstack tutorial for graphQl",
      url: "www.howtographql.com",
    },
  });

  const allLinks = await prisma.link.findMany();
  console.log("allLinks", JSON.stringify(allLinks, null, 2));
};

main()
  .catch((err) => {
    throw err;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

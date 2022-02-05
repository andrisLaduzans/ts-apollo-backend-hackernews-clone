import { Link, PrismaClient } from "@prisma/client";
import faker from "@faker-js/faker";
import { NexusObjectTypeDef } from "nexus/dist/core";

type User = {
  id: string;
  email: string;
  name: string;
  password: string;
};

type LinkBase = Omit<Link, "createdAt">;

export const prisma = new PrismaClient();

const populateDevServer = async () => {
  const delUsers = await prisma.user.deleteMany();
  console.log("deleted users");
  const delLinks = await prisma.link.deleteMany();
  console.log("deleted links");

  const users: User[] = new Array(5).fill(0).map((_, idx) => ({
    id: (Date.now() + idx).toString(),
    email: faker.internet.email(),
    name: faker.internet.userName(),
    password: faker.internet.password(),
  }));

  Promise.all(users.map((user) => prisma.user.create({ data: user }))).then(
    (users) => {
      console.log("users:", JSON.stringify(users, null, 2));

      Promise.all(
        users.map((user) =>
          prisma.link.create({
            data: {
              id: (Date.now() + parseInt(user.id)).toString(),
              description: faker.commerce.productDescription(),
              url: faker.internet.url(),
              postedById: user.id,
            },
          })
        )
      ).then((posts) => console.log("links", JSON.stringify(posts, null, 2)));
    }
  );
};

populateDevServer();

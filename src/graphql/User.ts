import { extendType, idArg, nonNull, objectType, stringArg } from "nexus";

export const User = objectType({
  name: "User",
  definition(t) {
    t.nonNull.id("id"),
      t.nonNull.string("name"),
      t.nonNull.string("email"),
      t.nonNull.list.nonNull.field("links", {
        type: "Link",
        resolve(parent, _, context) {
          const casted = parent as unknown as { id: string };
          return context.prisma.user
            .findUnique({
              where: {
                id: casted.id,
              },
            })
            .links()
            .then((items) =>
              items.map((it) => ({ ...it, id: it.id.toString() }))
            );
        },
      });
  },
});

export const UsersQuery = extendType({
  type: "Query",

  definition(t) {
    t.nonNull.list.nonNull.field("users", {
      type: "User",
      resolve(_, __, { prisma }) {
        return prisma.user.findMany();
      },
    });
  },
});

export const UserQuery = extendType({
  type: "Query",
  definition(t) {
    t.field("user", {
      type: "User",

      args: {
        id: nonNull(idArg()),
      },

      resolve(_, { id }, { prisma }) {
        return prisma.user.findUnique({
          where: {
            id,
          },
        });
      },
    });
  },
});

export const UpdateUser = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("updateUser", {
      type: "User",
      args: {
        name: stringArg(),
        email: stringArg(),
      },
      resolve: async (_, { name, email }, { prisma, userId }) => {
        if (!userId) {
          throw new Error("not logged in");
        }
        const match = await prisma.user.findUnique({
          where: { id: userId.toString() },
        });
        if (!match) {
          throw new Error(`user does not exist`);
        }

        return prisma.user.update({
          where: { id: userId.toString() },
          data: {
            id: userId.toString(),
            name: name || match?.name,
            email: email || match?.email,
          },
        });
      },
    });
  },
});

export const DeleteUser = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("deleteUser", {
      type: "User",

      resolve: async (_, __, { prisma, userId }) => {
        if (!userId) {
          throw new Error("not logged in");
        }

        await prisma.link.deleteMany({
          where: {
            postedById: userId.toString(),
          },
        });

        const user = await prisma.user.delete({
          where: { id: userId.toString() },
        });

        return user;
      },
    });
  },
});

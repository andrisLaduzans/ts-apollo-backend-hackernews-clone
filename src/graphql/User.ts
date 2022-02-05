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

export const CreateUserQuery = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("createUser", {
      type: "User",
      args: {
        name: nonNull(stringArg()),
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
      resolve(_, { name, email, password }, { prisma }) {
        try {
          return prisma.user.create({
            data: {
              id: Date.now().toString(),
              name,
              email,
              password,
            },
          });
        } catch (err) {
          throw err;
        }
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
        id: nonNull(idArg()),
        name: stringArg(),
        email: stringArg(),
      },
      resolve: async (_, { id, name, email }, { prisma }) => {
        const match = await prisma.user.findUnique({ where: { id } });
        if (!match) {
          throw new Error(`user by id: ${id} does not exist`);
        }

        return prisma.user.update({
          where: { id },
          data: {
            id,
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
      args: {
        id: nonNull(idArg()),
      },

      resolve: async (_, { id }, { prisma }) => {
        const links = await prisma.link.deleteMany({
          where: {
            postedById: id,
          },
        });

        const user = await prisma.user.delete({
          where: { id },
        });

        return user;
      },
    });
  },
});

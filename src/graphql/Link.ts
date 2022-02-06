import { User } from "@prisma/client";
import { extendType, idArg, nonNull, objectType, stringArg } from "nexus";

export const Link = objectType({
  name: "Link",
  definition(t) {
    t.nonNull.id("id");
    t.nonNull.string("description");
    t.nonNull.string("url");
    t.field("postedBy", {
      type: "User",
      resolve: (source, _, { prisma }) =>
        prisma.link.findUnique({ where: { id: source.id } }).postedBy(),
    });

    t.nonNull.list.nonNull.field("voters", {
      type: "User",
      resolve: (source, _, { prisma }) =>
        prisma.link
          .findUnique({
            where: { id: source.id },
          })
          .voters(),
    });
  },
});

export const LinkQuery = extendType({
  type: "Query",

  definition(t) {
    t.nonNull.list.nonNull.field("feed", {
      type: "Link",
      resolve: (_, __, { prisma }) => prisma.link.findMany(),
    });
  },
});

export const LinkMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("post", {
      type: "Link",

      args: {
        description: nonNull(stringArg()),
        url: nonNull(stringArg()),
      },

      resolve(_, { description, url }, { prisma, userId }) {
        if (!userId) {
          throw new Error("cannot post without logging in");
        }

        return prisma.link.create({
          data: {
            id: Date.now().toString(),
            description,
            url,
            postedBy: { connect: { id: userId.toString() } },
          },
        });
      },
    });
  },
});

export const FindLinkQuery = extendType({
  type: "Query",
  definition(t) {
    t.nullable.field("link", {
      type: "Link",

      args: {
        id: nonNull(idArg()),
      },

      resolve: (_, { id }, { prisma }) =>
        prisma.link.findFirst({
          where: {
            id: id,
          },
        }),
    });
  },
});

export const UpdateLInkMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("updateLink", {
      type: "Link",

      args: {
        id: nonNull(idArg()),
        description: stringArg(),
        url: stringArg(),
      },

      resolve: async (_, { id, description, url }, { prisma }) => {
        const link = await prisma.link.findFirst({
          where: {
            id,
          },
        });

        if (!link) {
          throw new Error(`could not find link with id ${id}`);
        }

        const res = prisma.link.update({
          where: {
            id,
          },
          data: {
            ...link,
            description: description || link?.description,
            url: url || link?.url,
          },
        });

        return res as any;
      },
    });
  },
});

export const DeleteLinkMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("deleteLink", {
      type: "Link",

      args: {
        id: nonNull(idArg()),
      },

      resolve: async (_, { id }, { prisma }) => {
        try {
          const deleted = await prisma.link.delete({
            where: {
              id,
            },
          });
          return { ...deleted, id: deleted.id.toString() };
        } catch (err) {
          throw err;
        }
      },
    });
  },
});

import { extendType, idArg, nonNull, objectType, stringArg } from "nexus";
import { resolveImportPath } from "nexus/dist/utils";

interface Link {
  id: string;
  description: string;
  url: string;
}

export const Link = objectType({
  name: "Link",
  definition(t) {
    t.nonNull.id("id");
    t.nonNull.string("description");
    t.nonNull.string("url");
    t.field("postedBy", {
      type: "User",
      resolve(parent, _, context) {
        const cast = parent as unknown as { id: string };
        return context.prisma.link
          .findUnique({ where: { id: cast.id } })
          .postedBy();
      },
    });
  },
});

export const LinkQuery = extendType({
  type: "Query",

  definition(t) {
    t.nonNull.list.nonNull.field("feed", {
      type: "Link",
      resolve: async (_, __, { prisma }) => {
        const all = (await prisma.link.findMany()) as unknown as Link[];
        return all;
      },
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
        userId: nonNull(idArg()),
      },

      resolve: async (_, { description, url, userId }, { prisma }) => {
        const user = await prisma.user.findFirst({
          where: {
            id: userId,
          },
        });

        if (!user) {
          return null;
        }

        return prisma.link.create({
          data: {
            id: Date.now().toString(),
            description,
            url,
            postedById: user.id,
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

      resolve: async (_, { id }, context) => {
        const item = await context.prisma.link.findFirst({
          where: {
            id: id,
          },
        });

        return item as unknown as Link;
      },
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
        if (!description && !url) {
          throw new Error(
            `nothing to update, description: undefined, url: undefined`
          );
        }
        const match = await prisma.link.findFirst({
          where: {
            id,
          },
        });

        if (!match) {
          throw new Error(`could not find link with id ${id}`);
        }

        const res = prisma.link.update({
          where: {
            id,
          },
          data: {
            ...match,
            description: description || match?.description,
            url: url || match?.url,
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

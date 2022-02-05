import {
  extendType,
  idArg,
  nonNull,
  nullable,
  objectType,
  stringArg,
} from "nexus";

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
    t.nonNull.field("post", {
      type: "Link",

      args: {
        description: nonNull(stringArg()),
        url: nonNull(stringArg()),
      },

      resolve: async (_, { description, url }, { prisma }) => {
        const res = (await prisma.link.create({
          data: {
            description,
            url,
          },
        })) as unknown as Link;
        return res;
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
            id: parseInt(id, 10),
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
        const match = await prisma.link.findFirst({
          where: {
            id: parseInt(id, 10),
          },
        });

        const res = prisma.link.update({
          where: {
            id: parseInt(id, 10),
          },
          data: {
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
        console.log("delete");
        try {
          const deleted = await prisma.link.delete({
            where: {
              id: parseInt(id, 10),
            },
          });
          return { ...deleted, id: deleted.id.toString() };
        } catch (err) {
          console.warn("err:", err);
          return null;
        }
      },
    });
  },
});

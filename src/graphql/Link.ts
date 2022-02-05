import {
  extendType,
  idArg,
  nonNull,
  nullable,
  objectType,
  stringArg,
} from "nexus";
import { NexusGenObjects } from "../generated/nexus-typegen";

export const Link = objectType({
  name: "Link",
  definition(t) {
    t.nonNull.id("id");
    t.nonNull.string("description");
    t.nonNull.string("url");
  },
});

let links: NexusGenObjects["Link"][] = [
  {
    id: "1",
    url: "www.howtographql.com",
    description: "fullstack tutorial for graphql",
  },

  {
    id: "2",
    url: "graphql.org",
    description: "graphql official website",
  },
];

export const LinkQuery = extendType({
  type: "Query",

  definition(t) {
    t.nonNull.list.nonNull.field("feed", {
      type: "Link",
      resolve() {
        return links;
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

      resolve(_, args) {
        const { description, url } = args;

        let idCount = links.length + 1;
        const link = {
          id: idCount.toString(),
          description,
          url,
        };

        links.push(link);

        return link;
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

      resolve(_, args) {
        const { id } = args;
        return links.find((item) => item.id === id) ?? null;
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

      resolve(_, args) {
        const { id, description, url } = args;

        const index = links.findIndex((it) => it.id === id);
        if (index === -1) return null;

        const newItem = {
          ...links[index],
          description: description || links[index].description,
          url: url || links[index].url,
        };

        links.splice(index, 1, newItem);

        return newItem;
      },
    });
  },
});

export const DeleteLinkMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.list.field("deleteLink", {
      type: "Link",

      args: {
        id: nonNull(idArg()),
      },

      resolve(_, { id }) {
        const index = links.findIndex((it) => it.id === id);
        return index === -1 ? null : links.splice(index, 1);
      },
    });
  },
});

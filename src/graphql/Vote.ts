import { User } from "@prisma/client";
import { extendType, intArg, nonNull, objectType, stringArg } from "nexus";

export const Vote = objectType({
  name: "Vote",
  definition(t) {
    t.nonNull.field("link", { type: "Link" });
    t.nonNull.field("user", { type: "User" });
  },
});

export const VoteMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("vote", {
      type: "Vote",
      args: {
        linkId: nonNull(stringArg()),
      },

      async resolve(_, { linkId }, { prisma, userId }) {
        if (!userId) {
          throw new Error("Cannot vote without logging in");
        }
        const user = await prisma.user.findUnique({
          where: {
            id: userId,
          },
        });
        if (!user) {
          throw new Error("User does not exist");
        }

        const matchLink = await prisma.link.findUnique({
          where: { id: linkId },
        });
        if (!matchLink) {
          throw new Error(`Link does not exist`);
        }

        const link = await prisma.link.update({
          where: {
            id: linkId,
          },
          data: {
            voters: {
              connect: {
                id: userId,
              },
            },
          },
        });

        return {
          link,
          user,
        };
      },
    });
  },
});

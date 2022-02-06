import { extendType, nonNull, objectType, stringArg } from "nexus";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { getAppSecret } from "../utils/auth";

export const AuthPayload = objectType({
  name: "AuthPayload",
  definition(t) {
    t.nonNull.string("token");
    t.nonNull.field("user", {
      type: "User",
    });
  },
});

export const AuthMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("login", {
      type: "AuthPayload",
      args: {
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
      async resolve(_, { email, password }, { prisma }) {
        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        });
        if (!user) {
          throw new Error(`Invalid email`);
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
          throw new Error("Invalid password");
        }

        const token = jwt.sign({ userId: user.id }, getAppSecret());

        return {
          token,
          user,
        };
      },
    });

    t.nonNull.field("signup", {
      type: "AuthPayload",
      args: {
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
        name: nonNull(stringArg()),
      },
      async resolve(_, { email, name, password: cryptedPassword }, { prisma }) {
        const password = await bcrypt.hash(cryptedPassword, 10);

        const user = await prisma.user.create({
          data: {
            id: Date.now().toString(),
            email,
            name,
            password,
          },
        });

        const token = jwt.sign({ userId: user.id }, getAppSecret());

        return {
          token,
          user,
        };
      },
    });
  },
});

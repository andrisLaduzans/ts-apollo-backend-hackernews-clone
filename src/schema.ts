import { makeSchema } from "nexus";
import { join } from "path";
import * as types from "./graphql";

export const schema = makeSchema({
  types,
  outputs: {
    schema: join(__dirname, "./generated", "schema.graphql"),
    typegen: join(__dirname, "./generated", "nexus-typegen.ts"),
  },
  contextType: {
    module: join(__dirname, "./context.ts"),
    export: "Context",
  },
});

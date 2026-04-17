import Elysia from "elysia";
import { getAuthServerSession } from "../auth";

// Shared service that derives session on every request
export const userService = new Elysia({ name: "user/service" }).derive(
  { as: "global" },
  async () => ({
    session: await getAuthServerSession(),
  }),
);

export const userRouter = new Elysia({ prefix: "/user" })
  .use(userService)
  .get("/session", async ({ session, set }) => {
    if (!session) {
      set.status = 401;
      return { code: 401, message: "Не авторизован" };
    }
    return session;
  });

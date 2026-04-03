import { authLoginOptions } from "@znode/utils/server";
import NextAuth from "next-auth";


const handler = NextAuth(authLoginOptions);

export { handler as GET, handler as POST };

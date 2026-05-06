import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const role = session.user?.role;

  if (role === "ADMIN") {
    redirect("/admin");
  } else if (role === "STAFF") {
    redirect("/staff");
  } else if (role === "TEACHER") {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }

  return null;
}

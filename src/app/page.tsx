import HabitTracker from "@/components/HabitTracker";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { User } from "@/types";

const Page = async () => {
  const session = await auth();

  if (!session?.user || !session.user.id) {
    return redirect("/api/auth/signin");
  }

  const user: User = {
    id: session.user.id,
    name: session.user.name ?? "",
    email: session.user.email ?? "",
    image: session.user.image || undefined,
  };

  // Pass the user prop to HabitTracker
  return <HabitTracker user={user} />;
};

export default Page;

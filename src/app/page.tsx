import HabitTracker from "@/components/HabitTracker";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

const Page = async () => {
  const session = await auth();

  if (!session?.user) {
    return redirect("/api/auth/signin");
  }
  console.log(session)
  return <HabitTracker />;
};

export default Page;

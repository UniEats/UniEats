import { AdminDashboard } from "@/screens/AdminDashboard/AdminDashboard";
import { useUserRole } from "@/services/TokenContext";

import { Redirect } from "wouter";

export const MainScreen = () => {
  const role = useUserRole();

  if (role !== "ROLE_ADMIN") {
    return (
      <Redirect href="/menu" />
    );
  }

  return <AdminDashboard />;
};

"use client";

import { logoutAction } from "@/actions/loginAction";
import { useRouter } from "next/navigation";

export const useLogout = () => {
  const router = useRouter();
  const logout = async () => {
    const response = await logoutAction();
    if (response?.success) {
    }
    if (response.success === false) {
      console.error(response.message);
    } else {
      router.push("/admin/see-pdfs"); // o la ruta que prefieras
    }
  };
  return {
    logout,
  };
};

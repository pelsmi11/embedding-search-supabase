import { loginAction, loginWithOauthAction } from "@/actions/loginAction";
import { supabase } from "@/lib/supabase/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export const useLoginForms = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  const loginWithEmail = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    const response = await loginAction(email, password);
    if (response?.success) {
    }
    setLoading(false);
    if (response.success === false) {
      setError(response.message);
    } else {
      router.push("/admin/see-pdfs"); // o la ruta que prefieras
    }
  };

  return {
    loading,
    error,
    loginWithEmail,
  };
};

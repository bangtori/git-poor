import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import type { User } from "@supabase/supabase-js";
import Login from "./pages/Login.tsx";

function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // 세션 체크 로직 (그대로 유지)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // 1. 로그인이 안 된 상태라면 -> 로그인 페이지 보여주기
  if (!user) {
    return <Login />;
  }

  // 2. 로그인이 된 상태라면 -> 메인 화면(대시보드) 보여주기
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
      <div className="text-center space-y-4">
        <div className="relative inline-block">
          <img
            src={user.user_metadata.avatar_url}
            alt="Profile"
            className="w-24 h-24 rounded-full border-4 border-emerald-500 shadow-lg"
          />
          <span className="absolute bottom-0 right-0 text-3xl">👋</span>
        </div>

        <h1 className="text-2xl font-bold">
          반갑다,{" "}
          <span className="text-emerald-400">
            {user.user_metadata.user_name}
          </span>
          !
        </h1>
        <p className="text-gray-400">이메일: {user.email}</p>

        <button
          onClick={handleLogout}
          className="px-6 py-2 bg-rose-600 hover:bg-rose-700 rounded-lg font-bold transition"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}

export default App;

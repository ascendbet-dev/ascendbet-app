"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export function useSeasonStatus() {
  const [loading, setLoading] = useState(true);
  const [season, setSeason] = useState<any>(null);
  const [joined, setJoined] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      /* 🔥 USE SESSION (FIXES LOCK ERROR) */
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user;

      if (!user) {
        if (isMounted) {
          setIsLoggedIn(false);
          setLoading(false);
        }
        return;
      }

      if (isMounted) setIsLoggedIn(true);

      /* 🔥 GET USER ROLE */
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (isMounted && profile?.role === "admin") {
        setIsAdmin(true);
      }

      /* 🔥 GET ACTIVE SEASON */
      const { data: activeSeason } = await supabase
        .from("seasons")
        .select("*")
        .eq("status", "active")
        .maybeSingle();

      if (isMounted) setSeason(activeSeason);

      /* 🔥 CHECK IF USER JOINED THIS SEASON */
      let joinedState = false;

      if (activeSeason) {
        const { data: instance } = await supabase
          .from("season_instances")
          .select("id")
          .eq("user_id", user.id)
          .eq("season_id", activeSeason.id) // ✅ KEY FIX
          .maybeSingle();

        joinedState = !!instance;
      }

      if (isMounted) {
        setJoined(joinedState);
        setLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  return { loading, season, joined, isAdmin, isLoggedIn };
}
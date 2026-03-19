"use client";

import { useState, useCallback } from "react";
import { LOCAL_STORAGE_KEYS } from "@/lib/constants";

interface RecentSearch {
  emergencyId: string;
  name: string;
  bloodType: string;
  searchedAt: string;
}

const MAX_SEARCHES = 10;

function load(): RecentSearch[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.RECENT_SEARCHES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useRecentSearches() {
  const [searches, setSearches] = useState<RecentSearch[]>(load);

  const addSearch = useCallback((entry: Omit<RecentSearch, "searchedAt">) => {
    setSearches((prev) => {
      const filtered = prev.filter((s) => s.emergencyId !== entry.emergencyId);
      const updated = [{ ...entry, searchedAt: new Date().toISOString() }, ...filtered].slice(
        0,
        MAX_SEARCHES
      );
      return updated;
    });
    // Sync to localStorage outside the state updater
    const current = load();
    const filtered = current.filter((s) => s.emergencyId !== entry.emergencyId);
    const updated = [{ ...entry, searchedAt: new Date().toISOString() }, ...filtered].slice(
      0,
      MAX_SEARCHES
    );
    localStorage.setItem(LOCAL_STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(updated));
  }, []);

  const clearSearches = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.RECENT_SEARCHES);
    setSearches([]);
  }, []);

  return { searches, addSearch, clearSearches };
}

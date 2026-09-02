"use client";

import { useEffect, useState, useCallback } from "react";
import { demoRequests } from "./mock-data";
import type { RequestStatus } from "./domain";

export interface PurchaseRequest {
  id: string;
  itemName: string;
  priceCents: number;
  category: string;
  reason: string;
  status: RequestStatus;
  riskScore: number;
  createdAt: string;
  reviewer: string;
}

const STORAGE_KEY = "ddzm:requests";

function load(): PurchaseRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [...demoRequests];
}

function save(list: PurchaseRequest[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

export function useRequests() {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setRequests(load());
    setReady(true);
  }, []);

  const remove = useCallback((id: string) => {
    setRequests(prev => {
      const next = prev.filter(r => r.id !== id);
      save(next);
      return next;
    });
  }, []);

  const add = useCallback((item: PurchaseRequest) => {
    setRequests(prev => {
      const next = [item, ...prev];
      save(next);
      return next;
    });
  }, []);

  return { requests, remove, add, ready };
}

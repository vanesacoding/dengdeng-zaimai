"use client";

import { useEffect, useState, useCallback } from "react";
import { demoRequests } from "./mock-data";
import { normalizeRequest, type RequestStatus } from "./domain";
import type { PurchaseMood, RequestVisibility } from "./domain";

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
  mood?: PurchaseMood;
  visibility?: RequestVisibility;
  productUrl?: string;
  imageUrl?: string;
}

const STORAGE_KEY = "ddzm:requests";

function load(): PurchaseRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, unknown>[];
      // Ensure old records without mood/visibility don't crash
      return parsed.map(r => ({
        id: String(r.id ?? ""),
        itemName: String(r.itemName ?? ""),
        priceCents: Number(r.priceCents ?? 0),
        category: String(r.category ?? ""),
        reason: String(r.reason ?? ""),
        status: r.status as RequestStatus,
        riskScore: Number(r.riskScore ?? 0),
        createdAt: String(r.createdAt ?? ""),
        reviewer: String(r.reviewer ?? ""),
        productUrl: r.productUrl ? String(r.productUrl) : undefined,
        imageUrl: r.imageUrl ? String(r.imageUrl) : undefined,
        ...normalizeRequest(r),
      })) as PurchaseRequest[];
    }
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const update = useCallback((id: string, patch: Partial<PurchaseRequest>) => {
    setRequests(prev => {
      const next = prev.map(r => (r.id === id ? { ...r, ...patch } : r));
      save(next);
      return next;
    });
  }, []);

  return { requests, remove, add, update, ready };
}

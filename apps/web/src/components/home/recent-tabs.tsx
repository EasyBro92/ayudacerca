'use client';

import { Tabs } from 'radix-ui';
import type { ReactNode } from 'react';

export function RecentTabs({ offersLabel, requestsLabel, offers, requests }: { offersLabel: string; requestsLabel: string; offers: ReactNode; requests: ReactNode }) {
  const trigger = 'min-h-11 rounded-full px-4 font-semibold text-ink-muted data-[state=active]:bg-primary data-[state=active]:text-on-primary';
  return (
    <Tabs.Root defaultValue="offers">
      <Tabs.List className="mb-6 inline-flex gap-1 rounded-full border border-border bg-surface p-1">
        <Tabs.Trigger value="offers" className={trigger}>{offersLabel}</Tabs.Trigger>
        <Tabs.Trigger value="requests" className={trigger}>{requestsLabel}</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="offers">{offers}</Tabs.Content>
      <Tabs.Content value="requests">{requests}</Tabs.Content>
    </Tabs.Root>
  );
}

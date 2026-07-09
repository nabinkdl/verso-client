import { NotificationItem } from "../types";

export function addNotification(
  notifications: NotificationItem[],
  item: Omit<NotificationItem, "id" | "createdAt">,
): NotificationItem[] {
  return [
    {
      ...item,
      id: `n${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
      createdAt: Date.now(),
    },
    ...notifications,
  ];
}

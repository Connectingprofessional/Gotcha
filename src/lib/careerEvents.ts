export type CareerEventType =
  | "profile.updated" | "search.performed" | "opportunity.viewed" | "opportunity.saved" | "application.created"
  | "application.status_changed" | "interview.scheduled" | "interview.outcome" | "offer.received" | "learning.completed"
  | "referral.requested" | "mentor.requested" | "agent.recommendation" | "agent.feedback" | "goal.updated";

export type CareerEvent = {
  id: string;
  type: CareerEventType;
  userId: string;
  occurredAt: string;
  entityId?: string;
  metadata: Record<string, string | number | boolean | null>;
};

export type CareerRecommendation = {
  id: string;
  title: string;
  reason: string;
  priority: "critical" | "high" | "medium" | "low";
  action: string;
  sourceEventIds: string[];
  createdAt: string;
  expiresAt?: string;
};

export function createCareerEvent(userId: string, type: CareerEventType, metadata: CareerEvent["metadata"], entityId?: string): CareerEvent {
  return { id: `ce-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, userId, type, occurredAt: new Date().toISOString(), entityId, metadata };
}

export function rankRecommendations(items: CareerRecommendation[]): CareerRecommendation[] {
  const weight = { critical: 4, high: 3, medium: 2, low: 1 };
  return [...items].sort((a, b) => weight[b.priority] - weight[a.priority] || a.title.localeCompare(b.title));
}

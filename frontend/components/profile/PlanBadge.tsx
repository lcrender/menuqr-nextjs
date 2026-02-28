import React from 'react';

const PLAN_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  free: { bg: 'bg-secondary', text: 'text-white', label: 'Free' },
  basic: { bg: 'bg-info', text: 'text-dark', label: 'Basic' },
  pro: { bg: 'bg-primary', text: 'text-white', label: 'Pro' },
  premium: { bg: 'bg-dark', text: 'text-white', label: 'Premium' },
};

interface PlanBadgeProps {
  plan: string | null | undefined;
  className?: string;
}

export default function PlanBadge({ plan, className = '' }: PlanBadgeProps) {
  const key = (plan || 'free').toLowerCase();
  const style = PLAN_STYLES[key] || PLAN_STYLES.free;
  const label = PLAN_STYLES[key]?.label || (plan ? String(plan) : 'Free');
  return (
    <span className={`badge ${style.bg} ${style.text} ${className}`}>
      {label}
    </span>
  );
}

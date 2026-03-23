import React from 'react';

type PlanStyle = { bg: string; text: string; label: string };

const PLAN_DEFAULT: PlanStyle = {
  bg: 'bg-secondary',
  text: 'text-white',
  label: 'Free',
};

const PLAN_STYLES: Record<string, PlanStyle> = {
  free: PLAN_DEFAULT,
  basic: { bg: 'bg-info', text: 'text-dark', label: 'Basic' },
  pro: { bg: 'bg-primary', text: 'text-white', label: 'Pro' },
  pro_team: { bg: 'bg-primary', text: 'text-white', label: 'Pro Team' },
  premium: { bg: 'bg-dark', text: 'text-white', label: 'Premium' },
};

interface PlanBadgeProps {
  plan: string | null | undefined;
  className?: string;
}

export default function PlanBadge({ plan, className = '' }: PlanBadgeProps) {
  const key = (plan || 'free').toLowerCase();
  const style: PlanStyle = PLAN_STYLES[key] ?? PLAN_DEFAULT;
  const label = PLAN_STYLES[key]?.label || (plan ? String(plan) : 'Free');
  return (
    <span className={`badge ${style.bg} ${style.text} ${className}`}>
      {label}
    </span>
  );
}

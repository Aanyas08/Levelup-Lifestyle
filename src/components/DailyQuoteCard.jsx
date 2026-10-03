import React, { useEffect, useState } from 'react';

export default function DailyQuoteCard() {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetch('/ai/daily-insight', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setInsight(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching quote:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-5 mb-6 animate-pulse h-20" />
    );
  }

  if (!insight?.quote) return null;

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 mb-6">
      <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-[var(--domain-accent)]">
        <span>✨ Daily Quote</span>
        {insight.source === 'gemini' && (
          <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-800">
            Gemini AI
          </span>
        )}
      </div>
      <p className="text-base italic font-medium text-gray-200">
        "{insight.quote}"
      </p>
    </div>
  );
}
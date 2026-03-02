"use client";

interface RatingStarsProps {
  value: number;
  max?: number;
  onChange: (value: number) => void;
}

export default function RatingStars({ value, onChange, max = 5 }: RatingStarsProps) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }, (_, index) => {
        const star = index + 1;
        const active = star <= value;
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`text-2xl leading-none ${active ? "text-yellow-500" : "text-gray-300"} hover:scale-105`}
            aria-label={`Rate ${star} out of ${max}`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

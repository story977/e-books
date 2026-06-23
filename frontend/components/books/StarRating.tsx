"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  /** Current value (1–5). Pass undefined or 0 for no selection. */
  value?: number;
  /** Called when the user clicks a star. Not used when readonly. */
  onChange?: (rating: number) => void;
  /** If true, stars are display-only (no hover/click). Default false. */
  readonly?: boolean;
  /** Icon size class. Default "w-4 h-4". */
  size?: string;
  /** Total stars. Default 5. */
  max?: number;
}

/**
 * StarRating — displays a row of stars.
 *
 * - Interactive mode (readonly=false): hover preview + click to select.
 * - Readonly mode: renders partial fill for fractional averages.
 */
export function StarRating({
  value = 0,
  onChange,
  readonly = false,
  size = "w-4 h-4",
  max = 5,
}: StarRatingProps) {
  const [hover, setHover] = useState(0);

  if (readonly) {
    // Render fractional stars for display
    return (
      <div className="flex items-center gap-0.5" aria-label={`${value} out of ${max} stars`}>
        {[...Array(max)].map((_, i) => {
          const fill = Math.min(Math.max(value - i, 0), 1); // 0, 0.5, or 1
          return (
            <span key={i} className="relative inline-block">
              {/* Background star (empty) */}
              <Star className={`${size} text-muted-foreground/40`} />
              {/* Foreground star (filled, clipped) */}
              {fill > 0 && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fill * 100}%` }}
                >
                  <Star className={`${size} fill-amber-400 text-amber-400`} />
                </span>
              )}
            </span>
          );
        })}
      </div>
    );
  }

  // Interactive mode
  const active = hover || value;
  return (
    <div
      className="flex items-center gap-1"
      onMouseLeave={() => setHover(0)}
      role="radiogroup"
      aria-label="Select star rating"
    >
      {[...Array(max)].map((_, i) => {
        const starValue = i + 1;
        const filled = starValue <= active;
        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={starValue === value}
            aria-label={`${starValue} star${starValue !== 1 ? "s" : ""}`}
            className="transition-transform duration-100 hover:scale-125 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
            onMouseEnter={() => setHover(starValue)}
            onClick={() => onChange?.(starValue)}
          >
            <Star
              className={`${size} transition-colors duration-100 ${
                filled
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/40 hover:text-amber-300"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

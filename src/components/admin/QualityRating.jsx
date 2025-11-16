import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown, Send, CheckCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function QualityRating({ dokument, onRatingSubmit }) {
  const [rating, setRating] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleRating = async (value) => {
    setRating(value);
    
    if (value === 'positive' && !feedback) {
      // Ak je pozitívne hodnotenie a nie je feedback, odošli hneď
      await submitRating(value, '');
    }
  };

  const submitRating = async (ratingValue, feedbackText) => {
    setSubmitting(true);
    
    try {
      await base44.entities.Dokument.update(dokument.id, {
        ai_quality_rating: ratingValue,
        ai_quality_feedback: feedbackText || null,
        ai_quality_rating_date: new Date().toISOString()
      });

      setSubmitted(true);
      if (onRatingSubmit) {
        onRatingSubmit(dokument.id, ratingValue, feedbackText);
      }

      setTimeout(() => {
        setSubmitted(false);
        setRating(null);
        setFeedback('');
      }, 2000);

    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Chyba pri odosielaní hodnotenia');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!rating) return;
    await submitRating(rating, feedback);
  };

  const existingRating = dokument.ai_quality_rating;

  if (submitted) {
    return (
      <div className="flex items-center justify-center gap-2 p-4 bg-green-50 rounded-lg">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <p className="text-sm font-medium text-green-900">Hodnotenie odoslané</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium">Kvalita AI analýzy:</p>
        {existingRating && (
          <span className="text-xs text-gray-500">
            (už hodnotené: {existingRating === 'positive' ? '👍' : '👎'})
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => handleRating('positive')}
          variant={rating === 'positive' ? 'default' : 'outline'}
          size="sm"
          disabled={submitting}
          className={rating === 'positive' ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          <ThumbsUp className="w-4 h-4 mr-2" />
          Presné
        </Button>
        <Button
          onClick={() => handleRating('negative')}
          variant={rating === 'negative' ? 'default' : 'outline'}
          size="sm"
          disabled={submitting}
          className={rating === 'negative' ? 'bg-red-600 hover:bg-red-700' : ''}
        >
          <ThumbsDown className="w-4 h-4 mr-2" />
          Nepresné
        </Button>
      </div>

      {rating === 'negative' && (
        <div className="space-y-2">
          <Textarea
            placeholder="Čo bolo nepresné? Vaša spätná väzba pomôže vylepšiť AI model..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="text-sm"
            rows={3}
          />
          <Button
            onClick={handleSubmitFeedback}
            disabled={submitting || !feedback.trim()}
            size="sm"
            className="w-full"
          >
            {submitting ? (
              'Odosielam...'
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Odoslať spätnú väzbu
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
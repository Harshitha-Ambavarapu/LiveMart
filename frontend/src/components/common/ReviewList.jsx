import React from 'react';
import { ThumbsUp, BadgeCheck } from 'lucide-react';
import StarRating from "./StarRating";
import { useAuth } from "../../context/AuthContext";


export default function ReviewList({ reviews, onHelpful }) {
  const { user } = useAuth();

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review._id} className="border-b border-gray-200 pb-6 last:border-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-800">
                  {review.user?.name || 'Anonymous'}
                </span>
                {review.isVerifiedPurchase && (
                  <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                    <BadgeCheck className="w-3 h-3" />
                    Verified Purchase
                  </span>
                )}
              </div>
              <StarRating rating={review.rating} size="sm" />
            </div>
            <span className="text-sm text-gray-500">
              {formatDate(review.createdAt)}
            </span>
          </div>

          {review.title && (
            <h4 className="font-semibold text-gray-800 mb-2">{review.title}</h4>
          )}

          <p className="text-gray-700 mb-3 leading-relaxed">{review.comment}</p>

          {/* Helpful Button */}
          {user && (
            <button
              onClick={() => onHelpful(review._id)}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-purple-600 transition-colors"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>Helpful ({review.helpful || 0})</span>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
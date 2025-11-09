import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Star, MessageCircle } from "lucide-react";
import { useI18n } from "@/contexts/i18nContext";

interface Rating {
  id: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

interface TripRatingCardProps {
  tripId: number;
  ratings: Rating[];
  onSubmitRating: (rating: number, comment: string) => Promise<void>;
  isLoading?: boolean;
}

export function TripRatingCard({
  tripId,
  ratings,
  onSubmitRating,
  isLoading = false,
}: TripRatingCardProps) {
  const { t } = useI18n();
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (myRating === 0) return;
    setIsSubmitting(true);
    try {
      await onSubmitRating(myRating, myComment);
      setMyRating(0);
      setMyComment("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const averageRating = ratings.length > 0
    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            {t("tripDetail.ratings")}
          </CardTitle>
          <CardDescription>
            {ratings.length > 0 ? (
              <span>
                {averageRating} / 5 ({ratings.length} {t("tripDetail.ratings")})
              </span>
            ) : (
              <span>{t("tripDetail.noRatings")}</span>
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* My Rating Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("tripDetail.addRating")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Star Rating */}
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setMyRating(star)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= myRating
                      ? "fill-yellow-500 text-yellow-500"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Comment Input */}
          <Textarea
            placeholder={t("tripDetail.commentPlaceholder")}
            value={myComment}
            onChange={(e) => setMyComment(e.target.value)}
            rows={3}
          />

          <Button
            onClick={handleSubmit}
            disabled={myRating === 0 || isSubmitting || isLoading}
            className="w-full"
          >
            {isSubmitting ? "Submitting..." : t("tripDetail.submitRating")}
          </Button>
        </CardContent>
      </Card>

      {/* Ratings List */}
      <div className="space-y-4">
        {ratings.length > 0 && (
          <>
            <h3 className="font-semibold text-lg">{t("tripDetail.allRatings")}</h3>
            {ratings.map((rating) => (
              <Card key={rating.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold">{rating.userName}</p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= rating.rating
                                ? "fill-yellow-500 text-yellow-500"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(rating.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {rating.comment && (
                    <p className="text-sm text-foreground mt-2">{rating.comment}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

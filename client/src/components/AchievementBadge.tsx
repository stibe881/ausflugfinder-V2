import { Card } from "@/components/ui/card";
import { Award, Trophy } from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  rarity: "common" | "rare" | "epic" | "legendary";
}

interface AchievementBadgeProps {
  achievements: Achievement[];
}

const rarityColors = {
  common: "bg-gray-500",
  rare: "bg-blue-500",
  epic: "bg-purple-500",
  legendary: "bg-yellow-500",
};

const rarityEmojis = {
  common: "🏅",
  rare: "🎖️",
  epic: "⭐",
  legendary: "👑",
};

export function AchievementBadge({ achievements }: AchievementBadgeProps) {
  const unlockedCount = achievements.filter((a) => a.unlockedAt).length;

  return (
    <div className="space-y-4">
      {/* Achievement Stats */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Achievements Unlocked</p>
            <p className="text-3xl font-bold">{unlockedCount} / {achievements.length}</p>
          </div>
          <Trophy className="w-12 h-12 text-yellow-500" />
        </div>
      </Card>

      {/* Achievement Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`relative p-4 rounded-lg text-center transition-all ${
              achievement.unlockedAt
                ? `${rarityColors[achievement.rarity]} opacity-100`
                : "bg-muted opacity-50"
            }`}
          >
            <div className="text-2xl mb-2">{achievement.icon}</div>
            <p className="text-xs font-semibold text-white dark:text-foreground">
              {achievement.name}
            </p>
            {achievement.unlockedAt && (
              <p className="text-2xl">{rarityEmojis[achievement.rarity]}</p>
            )}
            {!achievement.unlockedAt && (
              <p className="text-2xl opacity-50">🔒</p>
            )}
          </div>
        ))}
      </div>

      {/* Achievement List */}
      <div className="space-y-2">
        {achievements.map((achievement) => (
          <Card
            key={achievement.id}
            className={`p-3 ${achievement.unlockedAt ? "border-primary/50" : "border-muted"}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold flex items-center gap-2">
                  {achievement.icon} {achievement.name}
                </p>
                <p className="text-xs text-muted-foreground">{achievement.description}</p>
              </div>
              {achievement.unlockedAt && (
                <span className="text-xs text-primary font-semibold">
                  Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

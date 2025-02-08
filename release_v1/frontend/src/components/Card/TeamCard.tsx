// TeamCard.tsx
import { BaseCard } from './BaseCard';
import type { Team } from '@/lib/api/types';

interface TeamCardProps {
  team: Team;
  onAddToList?: () => void;
  onRemoveFromList?: () => void;
  onClick?: () => void;
  isAdded?: boolean;
}

export const TeamCard = ({
    team,
    onAddToList,
    onRemoveFromList,
    onClick,
    isAdded = false
  }: TeamCardProps) => {
    return (
      <BaseCard
        onClick={onClick}
        onAddToList={onAddToList}
        onRemoveFromList={onRemoveFromList}
        isAdded={isAdded}
      >
        <div className="flex flex-col items-center">
          <img
            src={team.Logo}
            alt={team.displayName}
            className="w-24 h-24 mb-4"
          />
          <h3 className="font-semibold">{team.displayName}</h3>
          <p className="text-sm text-gray-600">{team.teamAbbreviation}</p>
        </div>
      </BaseCard>
    );
  };
  
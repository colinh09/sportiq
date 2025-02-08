// components/Card/PlayerCard.tsx
import { BaseCard } from './BaseCard'

interface PlayerCardProps {
  player: any
  onAddToList?: () => void
  onRemoveFromList?: () => void
  onClick?: () => void
  isAdded?: boolean
}

export const PlayerCard = ({
  player,
  onAddToList,
  onRemoveFromList,
  onClick,
  isAdded = false
}: PlayerCardProps) => {
  return (
    <BaseCard
      onClick={onClick}
      onAddToList={onAddToList}
      onRemoveFromList={onRemoveFromList}
      isAdded={isAdded}
    >
      <div className="flex flex-col items-center">
        <img
          src={player.headshotUrl}
          alt={`${player.name}`}
          className="object-cover rounded-full"
        />
        <h3 className="font-semibold text-md pt-3">
          {player.name}
        </h3>
        <p className="text-sm text-gray-600">{player.position}</p>
      </div>
    </BaseCard>
  )
}

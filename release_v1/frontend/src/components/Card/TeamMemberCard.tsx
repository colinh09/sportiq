// @/components/cards/team-member-card.tsx
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

interface TeamMemberCardProps {
  name: string
  role: string
  image: string
}

export function TeamMemberCard({ name, role, image }: TeamMemberCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-square">
        <Image
          src={image}
          alt={`${name} - ${role}`}
          fill
          className="object-cover"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg">{name}</h3>
        <p className="text-gray-600">{role}</p>
      </CardContent>
    </Card>
  )
}
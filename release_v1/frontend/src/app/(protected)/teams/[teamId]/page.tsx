'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { teamsApi } from '@/lib/api/teams'
import { preferencesApi } from '@/lib/api/preferences'
import { useToast } from "@/components/ui/hooks/use-toast"
import { useAuth } from '@/contexts/auth-context'
import type { Player } from '@/lib/api/types'
import { Grid } from '@/components/Grid/Grid'
import { PlayerCard } from '@/components/Card/PlayerCard'
import { Search, ArrowLeft } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ToastAction } from "@/components/ui/toast"

export default function TeamDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const { user } = useAuth()
  const [selectedPosition, setSelectedPosition] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [userPlayerPreferences, setUserPlayerPreferences] = useState<number[]>([])
  const [teamDetails, setTeamDetails] = useState<any>(null)
  
  const [sectionsOpen, setSectionsOpen] = useState({
    importantPlayers: true,
    roster: true,
    recentGames: true,
    upcomingGames: true
  })

  useEffect(() => {
    const fetchData = async () => {
      const teamId = params.teamId as string
      
      try {
        const [details, preferencesData] = await Promise.all([
          teamsApi.getTeamDetails(teamId),
          user ? preferencesApi.getPlayerPreferences(user.id) : Promise.resolve({ data: [] })
        ])
        console.log(details)

        setTeamDetails(details)
        setUserPlayerPreferences(preferencesData.data.map((pref: any) => pref.playerId))
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
      }
    }

    fetchData()
  }, [params.teamId, user])

  const isPlayerInPreferences = (playerId: number) => {
    return userPlayerPreferences.includes(playerId)
  }

  const handleAddToList = async (player: Player) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add players to your list",
        variant: "destructive"
      })
      return
    }

    if (isPlayerInPreferences(player.playerId)) {
      toast({
        title: "Player Already Added",
        description: `${player.name} is already in your list`,
        variant: "default"
      })
      return
    }

    try {
      await preferencesApi.addPlayerPreference(user.id, player.playerId)
      setUserPlayerPreferences([...userPlayerPreferences, player.playerId])
      toast({
        title: "Player Added",
        description: `${player.name} has been added to your list`,
        action: (
          <ToastAction altText="Undo" onClick={() => handleRemoveFromList(player)}>
            Undo
          </ToastAction>
        ),
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add player to your list",
        variant: "destructive"
      })
    }
  }

  const handleRemoveFromList = async (player: Player) => {
    if (!user) return

    try {
      await preferencesApi.removePlayerPreference(user.id, player.playerId)
      setUserPlayerPreferences(userPlayerPreferences.filter(id => id !== player.playerId))
      toast({
        title: "Player Removed",
        description: `${player.name} has been removed from your list`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove player from your list",
        variant: "destructive"
      })
    }
  }

  const handleBackToTeams = () => {
    router.push('/teams')
  }

  const toggleSection = (section: keyof typeof sectionsOpen) => {
    setSectionsOpen(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  if (!teamDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Team not found</div>
      </div>
    )
  }

  const positions = Object.values(
    teamDetails.players.reduce((acc: any, player: any) => {
      const key = `${player.position}-${player.position_code}`
      if (!acc[key]) {
        acc[key] = {
          fullPosition: player.position,
          code: player.position_code
        }
      }
      return acc
    }, {})
  )
  
  const filteredPlayers = Object.values(
    teamDetails.players
      .filter((player: any) => {
        const matchesPosition = selectedPosition === 'all' || player.position === selectedPosition
        const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesSearch && matchesPosition
      })
      .reduce((acc: any, player: any) => {
        if (!acc[player.playerId]) {
          acc[player.playerId] = player
        }
        return acc
      }, {})
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          className="mb-8 hover:bg-gray-100 -ml-2"
          onClick={handleBackToTeams}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Teams
        </Button>

        <div className="flex items-center space-x-8 mb-12">
          <div className="relative w-48 h-48">
            <Image
              src={teamDetails.teamInfo.Logo}
              alt={teamDetails.teamInfo.displayName}
              fill
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2">{teamDetails.teamInfo.displayName}</h1>
            <p className="text-xl text-gray-600 mb-4">{teamDetails.teamInfo.teamAbbreviation}</p>
            <div className="flex space-x-6">
              <div>
                <p className="text-sm text-gray-500">Standing</p>
                <p className="text-lg font-semibold">{teamDetails.standing}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Record</p>
                <p className="text-lg font-semibold">{teamDetails.record.win}-{teamDetails.record.loss}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Important Players Section */}
        <Collapsible
          open={sectionsOpen.importantPlayers}
          className="mb-12 space-y-2"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Important Players</h2>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                onClick={() => toggleSection('importantPlayers')}
              >
                {sectionsOpen.importantPlayers ? 'Hide' : 'Show'}
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <Grid>
              {teamDetails.leaders.map(([name, role, headshotUrl]: any, index: number) => {
                const matchingPlayer = teamDetails.players.find((p: any) => p.position === role)
                const position_code = matchingPlayer?.position_code || role
                
                const player: Player = {
                    playerId: matchingPlayer?.playerId || 0,
                    name,
                    position: role,
                    position_code,
                    headshotUrl,
                    teamId: teamDetails.teamInfo.teamId
                }
                return (
                  <PlayerCard
                    key={index}
                    player={player}
                    onAddToList={() => handleAddToList(player)}
                    onRemoveFromList={() => handleRemoveFromList(player)}
                    isAdded={isPlayerInPreferences(player.playerId)}
                  />
                )
              })}
            </Grid>
          </CollapsibleContent>
        </Collapsible>

        {/* Full Roster Section */}
        <Collapsible
          open={sectionsOpen.roster}
          className="mb-12 space-y-2"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Full Roster</h2>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                onClick={() => toggleSection('roster')}
              >
                {sectionsOpen.roster ? 'Hide' : 'Show'}
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Select 
                  value={selectedPosition} 
                  onValueChange={setSelectedPosition}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Positions</SelectItem>
                    {positions.map(({ fullPosition, code }: any) => (
                      <SelectItem key={`${fullPosition}-${code}`} value={fullPosition}>
                        {`${fullPosition} (${code})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search players..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </div>

            {filteredPlayers.length > 0 ? (
              <Grid>
                {filteredPlayers.map((player: any) => (
                  <PlayerCard
                    key={player.playerId}
                    player={player}
                    onAddToList={() => handleAddToList(player)}
                    onRemoveFromList={() => handleRemoveFromList(player)}
                    isAdded={isPlayerInPreferences(player.playerId)}
                  />
                ))}
              </Grid>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No players found matching your criteria
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Recent Games Section */}
          <Collapsible
            open={sectionsOpen.recentGames}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Recent Games</h2>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  onClick={() => toggleSection('recentGames')}
                >
                  {sectionsOpen.recentGames ? 'Hide' : 'Show'}
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent>
              <div className="space-y-4">
                {teamDetails.games.map((game: any) => (
                  <div 
                    key={`${game.date}-${game.opponent}-${game.teamScore}`} 
                    className="bg-white rounded-lg shadow p-4"
                  >
                    <p className="text-sm text-gray-500">{game.date}</p>
                    <p className={`font-bold ${game.won ? 'text-green-600' : 'text-red-600'}`}>
                      {game.won ? 'Win' : 'Loss'}
                    </p>
                    <p>{teamDetails.teamInfo.displayName} {game.teamScore} - {game.opponentScore} {game.opponent}</p>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Upcoming Games Section */}
          <Collapsible
            open={sectionsOpen.upcomingGames}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Upcoming Games</h2>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  onClick={() => toggleSection('upcomingGames')}
                >
                  {sectionsOpen.upcomingGames ? 'Hide' : 'Show'}
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent>
              <div className="space-y-4">
                {teamDetails.upcomingGames.map((game: any, index: number) => (
                  <div key={index} className="bg-white rounded-lg shadow p-4">
                    <p className="text-sm text-gray-500">{game.date}</p>
                    <p className="font-bold">{teamDetails.teamInfo.displayName} vs {game.opponent}</p>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  )
}

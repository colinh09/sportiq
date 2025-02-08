'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { teamsApi } from '@/lib/api/teams'
import { preferencesApi } from '@/lib/api/preferences'
import type { Team } from '@/lib/api/types'
import { Grid } from '@/components/Grid/Grid'
import { TeamCard } from '@/components/Card/TeamCard'
import { useToast } from '@/components/ui/hooks/use-toast'
import { ToastAction } from '@/components/ui/toast'
import { useAuth } from '@/contexts/auth-context'

export default function TeamsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [userPreferences, setUserPreferences] = useState<string[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamsData, preferencesData] = await Promise.all([
          teamsApi.getAllTeams(),
          user ? preferencesApi.getTeamPreferences(user.id) : { data: [] }
        ])
        
        setTeams(teamsData)
        setUserPreferences(preferencesData.data.map((pref: any) => pref.teamId))
        setLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const handleTeamClick = (team: Team) => {
    window.scrollTo(0, 0)
    router.push(`/teams/${team.teamId}`)
  }

  const isTeamInPreferences = (teamId: string) => {
    return userPreferences.includes(teamId)
  }

  const handleAddToList = async (team: Team) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add teams to your list",
        variant: "destructive"
      })
      return
    }

    if (isTeamInPreferences(team.teamId)) {
      toast({
        title: "Team Already Added",
        description: `${team.displayName} is already in your list`,
        variant: "default"
      })
      return
    }

    try {
      await preferencesApi.addTeamPreference(user.id, team.teamId)
      setUserPreferences([...userPreferences, team.teamId])
      toast({
        title: "Team Added",
        description: `${team.displayName} has been added to your list`,
        action: (
          <ToastAction altText="Undo" onClick={() => handleRemoveFromList(team)}>
            Undo
          </ToastAction>
        ),
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add team to your list",
        variant: "destructive"
      })
      console.error('Error adding team to list:', error)
    }
  }

  const handleRemoveFromList = async (team: Team) => {
    if (!user) return
    try {
      await preferencesApi.removeTeamPreference(user.id, team.teamId)
      setUserPreferences(userPreferences.filter(id => id !== team.teamId))
      toast({
        title: "Team Removed",
        description: `${team.displayName} has been removed from your list`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove team from your list",
        variant: "destructive"
      })
      console.error('Error removing team from list:', error)
    }
  }

  if (loading) {
  }

  return (
    <div className="container mx-auto text-center py-6">
      <h1 className="text-3xl font-bold mb-6">MLB Teams</h1>
      <Grid>
        {teams.map((team) => (
          <TeamCard
            key={team.teamId}
            team={team}
            onClick={() => handleTeamClick(team)}
            onAddToList={() => handleAddToList(team)}
            onRemoveFromList={() => handleRemoveFromList(team)}
            isAdded={isTeamInPreferences(team.teamId)}
          />
        ))}
      </Grid>
    </div>
  )
}

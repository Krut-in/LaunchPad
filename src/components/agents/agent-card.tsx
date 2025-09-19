import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AgentType } from '@/types'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AgentCardProps {
  agentType: AgentType
  title: string
  description: string
  icon: LucideIcon
  isCompleted?: boolean
  isRunning?: boolean
  isDisabled?: boolean
  onSelect?: () => void
}

export function AgentCard({
  agentType,
  title,
  description,
  icon: Icon,
  isCompleted = false,
  isRunning = false,
  isDisabled = false,
  onSelect,
}: AgentCardProps) {
  const getStatusBadge = () => {
    if (isRunning) {
      return <Badge variant="secondary">Running...</Badge>
    }
    if (isCompleted) {
      return <Badge variant="default">Completed</Badge>
    }
    return <Badge variant="outline">Available</Badge>
  }

  const getButtonText = () => {
    if (isRunning) return 'Running...'
    if (isCompleted) return 'View Results'
    return 'Start Analysis'
  }

  return (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-md',
      isCompleted && 'border-green-200 bg-green-50/50',
      isRunning && 'border-blue-200 bg-blue-50/50',
      isDisabled && 'opacity-50 cursor-not-allowed'
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn(
              'p-2 rounded-lg',
              isCompleted && 'bg-green-100 text-green-600',
              isRunning && 'bg-blue-100 text-blue-600',
              !isCompleted && !isRunning && 'bg-gray-100 text-gray-600'
            )}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              {getStatusBadge()}
            </div>
          </div>
        </div>
        <CardDescription className="text-sm leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Button 
          onClick={onSelect}
          disabled={isDisabled || isRunning}
          className="w-full"
          variant={isCompleted ? 'outline' : 'default'}
        >
          {getButtonText()}
        </Button>
      </CardContent>
    </Card>
  )
}

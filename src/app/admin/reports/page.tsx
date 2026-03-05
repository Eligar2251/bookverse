import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatRelativeDate } from '@/lib/utils'
import { ReportActions } from './report-actions'

export default async function AdminReportsPage() {
  const supabase = await createClient()
  const { data: reports } = await supabase
    .from('reports')
    .select('*, reporter:profiles!reports_reporter_id_fkey(username)')
    .order('created_at', { ascending: false })
    .limit(100)

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-600',
    resolved: 'bg-green-500/10 text-green-600',
    dismissed: 'bg-gray-500/10 text-gray-600',
  }

  return (
    <div className="p-6 max-w-5xl space-y-4">
      <h1 className="text-2xl font-bold">🚩 Жалобы</h1>
      {reports && reports.length > 0 ? (
        <div className="space-y-2">
          {reports.map((r: any) => (
            <Card key={r.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{r.target_type}</Badge>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[r.status]}`}>{r.status}</span>
                    </div>
                    <p className="text-sm mt-1">{r.reason}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      От: @{r.reporter?.username} · {formatRelativeDate(r.created_at)}
                    </p>
                  </div>
                  {r.status === 'pending' && <ReportActions reportId={r.id} />}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-12">Нет жалоб</p>
      )}
    </div>
  )
}
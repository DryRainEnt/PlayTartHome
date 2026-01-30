"use client"

import { useState, useEffect } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Loader2 } from "lucide-react"

interface Resource {
  id: string
  title: string
  slug: string
  viewCount: number
}

interface TrendData {
  date: string
  views: number
}

const resourceTypes = [
  { value: "course", label: "강의" },
  { value: "service", label: "외주" },
  { value: "product", label: "제품" },
  { value: "forum_post", label: "게시글" },
]

export function ResourceTraffic() {
  const [resourceType, setResourceType] = useState("")
  const [resources, setResources] = useState<Resource[]>([])
  const [selectedResource, setSelectedResource] = useState("")
  const [trendData, setTrendData] = useState<TrendData[]>([])
  const [loadingResources, setLoadingResources] = useState(false)
  const [loadingTrend, setLoadingTrend] = useState(false)

  // Load resources when type changes
  useEffect(() => {
    if (!resourceType) {
      setResources([])
      setSelectedResource("")
      return
    }

    const fetchResources = async () => {
      setLoadingResources(true)
      setSelectedResource("")
      setTrendData([])

      try {
        const response = await fetch(`/api/admin/analytics/resources?type=${resourceType}`)
        const data = await response.json()
        setResources(data.resources || [])
      } catch (error) {
        console.error("Failed to fetch resources:", error)
        setResources([])
      } finally {
        setLoadingResources(false)
      }
    }

    fetchResources()
  }, [resourceType])

  // Load trend data when resource changes
  useEffect(() => {
    if (!resourceType || !selectedResource) {
      setTrendData([])
      return
    }

    const fetchTrend = async () => {
      setLoadingTrend(true)

      try {
        const response = await fetch(
          `/api/admin/analytics/resource-trend?type=${resourceType}&slug=${selectedResource}`
        )
        const data = await response.json()
        setTrendData(data.trend || [])
      } catch (error) {
        console.error("Failed to fetch trend:", error)
        setTrendData([])
      } finally {
        setLoadingTrend(false)
      }
    }

    fetchTrend()
  }, [resourceType, selectedResource])

  const selectedResourceInfo = resources.find((r) => r.slug === selectedResource)
  const totalViews = trendData.reduce((sum, d) => sum + d.views, 0)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>리소스 타입</Label>
          <Select value={resourceType} onValueChange={setResourceType}>
            <SelectTrigger>
              <SelectValue placeholder="타입 선택" />
            </SelectTrigger>
            <SelectContent>
              {resourceTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>리소스</Label>
          <Select
            value={selectedResource}
            onValueChange={setSelectedResource}
            disabled={!resourceType || loadingResources}
          >
            <SelectTrigger>
              {loadingResources ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  로딩 중...
                </span>
              ) : (
                <SelectValue placeholder="리소스 선택" />
              )}
            </SelectTrigger>
            <SelectContent>
              {resources.map((resource) => (
                <SelectItem key={resource.id} value={resource.slug}>
                  {resource.title} ({resource.viewCount.toLocaleString()} 조회)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedResource && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{selectedResourceInfo?.title}</CardTitle>
            <CardDescription>
              최근 14일 조회수 추이 (총 {totalViews.toLocaleString()}회)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingTrend ? (
              <div className="flex h-[300px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : trendData.length === 0 ? (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                조회 데이터가 없습니다
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    className="fill-muted-foreground"
                  />
                  <YAxis
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    className="fill-muted-foreground"
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                    formatter={(value: number) => [`${value}회`, "조회수"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="views"
                    name="조회수"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={{ fill: "var(--primary)", strokeWidth: 0, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      )}

      {!resourceType && (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          리소스 타입을 선택하면 해당 타입의 콘텐츠 목록이 표시됩니다
        </div>
      )}

      {resourceType && !selectedResource && !loadingResources && (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          리소스를 선택하면 해당 콘텐츠의 일별 조회수 추이를 확인할 수 있습니다
        </div>
      )}
    </div>
  )
}

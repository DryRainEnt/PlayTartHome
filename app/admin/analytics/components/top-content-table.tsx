"use client"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Eye } from "lucide-react"
import Link from "next/link"

interface TopContentTableProps {
  data: {
    id: string
    title: string
    slug?: string
    view_count: number
    type: "course" | "service" | "product" | "forum_post"
  }[]
}

const typeConfig = {
  course: { label: "강의", color: "bg-blue-100 text-blue-800", path: "/course" },
  service: { label: "외주", color: "bg-green-100 text-green-800", path: "/outsourcing" },
  product: { label: "제품", color: "bg-purple-100 text-purple-800", path: "/product" },
  forum_post: { label: "게시글", color: "bg-orange-100 text-orange-800", path: "/forum" },
}

export function TopContentTable({ data }: TopContentTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        데이터가 없습니다
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">순위</TableHead>
          <TableHead>제목</TableHead>
          <TableHead className="w-24">유형</TableHead>
          <TableHead className="w-32 text-right">조회수</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, index) => {
          const config = typeConfig[item.type]
          const href =
            item.type === "forum_post"
              ? `${config.path}/${item.id}`
              : `${config.path}/${item.slug}`

          return (
            <TableRow key={`${item.type}-${item.id}`}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell>
                <Link href={href} className="hover:underline" target="_blank">
                  {item.title}
                </Link>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className={config.color}>
                  {config.label}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  {(item.view_count || 0).toLocaleString()}
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

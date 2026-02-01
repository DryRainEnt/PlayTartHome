"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"

interface StudentFiltersProps {
  courses: { id: string; title: string; slug: string }[]
  currentCourse: string | null
  currentSearch: string
}

export function StudentFilters({ courses, currentCourse, currentSearch }: StudentFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(currentSearch)

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("page")

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })

    const queryString = params.toString()
    router.push(`/admin/students${queryString ? `?${queryString}` : ""}`)
  }

  const handleCourseChange = (value: string) => {
    updateFilters({ course: value === "all" ? null : value, search })
  }

  const handleSearch = () => {
    updateFilters({ course: currentCourse, search: search || null })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const clearSearch = () => {
    setSearch("")
    updateFilters({ course: currentCourse, search: null })
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <Select value={currentCourse || "all"} onValueChange={handleCourseChange}>
        <SelectTrigger className="w-full sm:w-[250px]">
          <SelectValue placeholder="강의 선택" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체 강의</SelectItem>
          {courses.map((course) => (
            <SelectItem key={course.id} value={course.id}>
              {course.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex gap-2 flex-1 max-w-md">
        <div className="relative flex-1">
          <Input
            placeholder="이름 또는 이메일 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pr-8"
          />
          {search && (
            <button
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button onClick={handleSearch} size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

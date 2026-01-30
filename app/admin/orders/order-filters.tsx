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

interface OrderFiltersProps {
  currentType: string
  currentPeriod: string
  currentSearch: string
}

const typeOptions = [
  { value: "all", label: "전체" },
  { value: "course", label: "강의" },
  { value: "product", label: "제품" },
]

const periodOptions = [
  { value: "7", label: "최근 7일" },
  { value: "30", label: "최근 30일" },
  { value: "90", label: "최근 90일" },
  { value: "all", label: "전체 기간" },
]

export function OrderFilters({
  currentType,
  currentPeriod,
  currentSearch,
}: OrderFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(currentSearch)

  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())

    // 페이지는 필터 변경 시 리셋
    params.delete("page")

    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "all" && value !== "30" && value !== "") {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })

    const queryString = params.toString()
    router.push(`/admin/orders${queryString ? `?${queryString}` : ""}`)
  }

  const handleTypeChange = (value: string) => {
    updateFilters({ type: value, period: currentPeriod, search })
  }

  const handlePeriodChange = (value: string) => {
    updateFilters({ type: currentType, period: value, search })
  }

  const handleSearch = () => {
    updateFilters({ type: currentType, period: currentPeriod, search })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const clearSearch = () => {
    setSearch("")
    updateFilters({ type: currentType, period: currentPeriod, search: "" })
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="flex gap-2">
        <Select value={currentType} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {typeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={currentPeriod} onValueChange={handlePeriodChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {periodOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 flex-1 max-w-md">
        <div className="relative flex-1">
          <Input
            placeholder="상품명, 주문자, 주문번호 검색"
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

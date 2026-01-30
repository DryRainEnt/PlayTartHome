"use client"

import { useRouter, useSearchParams } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const dateRangeOptions = [
  { value: "7", label: "최근 7일" },
  { value: "14", label: "최근 14일" },
  { value: "30", label: "최근 30일" },
  { value: "90", label: "최근 90일" },
]

export function DateRangeSelector() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentDays = searchParams.get("days") || "14"

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("days", value)
    router.push(`/admin/analytics?${params.toString()}`)
  }

  return (
    <Select value={currentDays} onValueChange={handleChange}>
      <SelectTrigger className="w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {dateRangeOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const presets = [
  { value: "7", label: "7일" },
  { value: "14", label: "14일" },
  { value: "30", label: "30일" },
  { value: "90", label: "90일" },
]

export function DateRangeSelector() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentDays = searchParams.get("days")
  const currentFrom = searchParams.get("from")
  const currentTo = searchParams.get("to")

  const isCustom = !!(currentFrom && currentTo)

  const [range, setRange] = useState<DateRange | undefined>(() => {
    if (currentFrom && currentTo) {
      return { from: new Date(currentFrom), to: new Date(currentTo) }
    }
    return undefined
  })
  const [open, setOpen] = useState(false)

  const activeDays = isCustom ? null : (currentDays || "14")

  const handlePreset = (value: string) => {
    const params = new URLSearchParams()
    params.set("days", value)
    router.push(`/admin/analytics?${params.toString()}`)
    router.refresh()
  }

  const handleRangeSelect = (selected: DateRange | undefined) => {
    setRange(selected)
    if (selected?.from && selected?.to) {
      const params = new URLSearchParams()
      params.set("from", format(selected.from, "yyyy-MM-dd"))
      params.set("to", format(selected.to, "yyyy-MM-dd"))
      router.push(`/admin/analytics?${params.toString()}`)
      router.refresh()
      setOpen(false)
    }
  }

  const displayLabel = () => {
    if (isCustom && currentFrom && currentTo) {
      return `${currentFrom.replace(/-/g, ".")} ~ ${currentTo.replace(/-/g, ".")}`
    }
    if (range?.from && range?.to) {
      return `${format(range.from, "yyyy.MM.dd")} ~ ${format(range.to, "yyyy.MM.dd")}`
    }
    return "기간 선택"
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {presets.map((preset) => (
        <Button
          key={preset.value}
          variant={activeDays === preset.value ? "default" : "outline"}
          size="sm"
          onClick={() => handlePreset(preset.value)}
        >
          {preset.label}
        </Button>
      ))}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={isCustom ? "default" : "outline"}
            size="sm"
            className={cn("justify-start text-left font-normal", isCustom && "min-w-[200px]")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayLabel()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            selected={range}
            onSelect={handleRangeSelect}
            numberOfMonths={2}
            disabled={{ after: new Date() }}
            locale={ko}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

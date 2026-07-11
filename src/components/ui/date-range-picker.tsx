"use client";

import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DateRangePickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: DateRange;
  onChange?: (date: DateRange | undefined) => void;
  placeholder?: string;
}

export function DateRangePicker({
  className,
  value,
  onChange,
  placeholder = "Seleccionar rango",
}: DateRangePickerProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal px-3",
              !value && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                <span className="truncate">
                  {format(value.from, "dd/MM/yy", { locale: es })} -{" "}
                  {format(value.to, "dd/MM/yy", { locale: es })}
                </span>
              ) : (
                <span className="truncate">{format(value.from, "dd/MM/yy", { locale: es })}</span>
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
            locale={es}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

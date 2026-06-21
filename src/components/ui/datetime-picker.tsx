import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface DateTimePickerProps {
  value?: string;
  onChange?: (date: string) => void;
}

export function DateTimePicker({ value, onChange }: DateTimePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(value ? new Date(value) : undefined);

  const [time, setTime] = React.useState<string>(
    value
      ? `${new Date(value).getHours().toString().padStart(2, "0")}:${new Date(value).getMinutes().toString().padStart(2, "0")}`
      : "12:00",
  );

  React.useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setDate(d);
        setTime(
          `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`,
        );
      }
    }
  }, [value]);

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const [hours, minutes] = time.split(":");
      selectedDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      setDate(selectedDate);
      onChange?.(selectedDate.toISOString());
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTime(newTime);
    if (date) {
      const [hours, minutes] = newTime.split(":");
      const newDate = new Date(date);
      newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      setDate(newDate);
      onChange?.(newDate.toISOString());
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            format(date, "dd/MM/yyyy, HH:mm", { locale: es })
          ) : (
            <span>Seleccionar fecha y hora</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            initialFocus
            locale={es}
            captionLayout="dropdown"
            fromYear={2020}
            toYear={new Date().getFullYear() + 5}
          />
        </div>
        <div className="p-3 border-t border-border flex items-center justify-between gap-2">
          <span className="text-sm font-medium">Hora</span>
          <Input type="time" value={time} onChange={handleTimeChange} className="w-[120px]" />
        </div>
      </PopoverContent>
    </Popover>
  );
}

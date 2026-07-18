"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Settings2 } from "lucide-react";
import { useTipsterList } from "../hooks/useBets";
import { useTipsterSettingsStore } from "@/store/tipster-settings";

export function ManageTipstersDialog() {
  const { data: tipsters } = useTipsterList();
  const { inactiveTipsters, setTipsterActive } = useTipsterSettingsStore();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="shrink-0"
          title="Configurar Tipsters Activos"
        >
          <Settings2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configurar Tipsters</DialogTitle>
          <DialogDescription>
            Activa o desactiva tipsters. Los tipsters inactivos se ocultarán de los filtros y la
            gráfica principal de P&L, pero seguirán contando para tus estadísticas globales.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 max-h-[60vh] overflow-y-auto pr-2">
          <div className="space-y-4">
            {(tipsters ?? []).map((tipster) => {
              const isActive = !inactiveTipsters.includes(tipster);
              return (
                <div key={tipster} className="flex items-center justify-between space-x-2">
                  <span className="text-sm font-medium leading-none">{tipster}</span>
                  <Switch
                    checked={isActive}
                    onCheckedChange={(checked) => setTipsterActive(tipster, checked)}
                  />
                </div>
              );
            })}
            {(tipsters?.length === 0 || !tipsters) && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay tipsters registrados.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

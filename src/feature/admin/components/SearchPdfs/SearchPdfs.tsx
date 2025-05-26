"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Card, CardContent } from "@/components/shadcn/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/shadcn/ui/alert-dialog";
import { Search, Loader2 } from "lucide-react";

interface SearchPdfsProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export default function SearchPdfs({
  onSearch,
  isLoading = false,
}: SearchPdfsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSearchClick = () => {
    if (searchQuery.trim()) {
      setIsDialogOpen(true);
    } else {
      onSearch("");
    }
  };

  const handleConfirmSearch = () => {
    onSearch(searchQuery);
    setIsDialogOpen(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearchClick();
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nombre, título o descripción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="h-11"
            />
          </div>

          <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                onClick={handleSearchClick}
                disabled={isLoading}
                className="h-11 px-6"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Buscar
                  </>
                )}
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar búsqueda</AlertDialogTitle>
                <AlertDialogDescription>
                  ¿Estás seguro de hacer esta búsqueda? Se procesarán todos los
                  documentos PDF para encontrar coincidencias con:{" "}
                  <strong>"{searchQuery}"</strong>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmSearch}>
                  Sí, buscar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {searchQuery && (
          <div className="mt-4 text-sm text-muted-foreground">
            Término de búsqueda:{" "}
            <span className="font-medium">"{searchQuery}"</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

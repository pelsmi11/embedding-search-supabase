"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/shadcn/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/ui/dialog";
import { ExternalLink, FileText, Loader2, Maximize2 } from "lucide-react";
import { useRouter } from "next/navigation";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      object: React.DetailedHTMLProps<
        React.ObjectHTMLAttributes<HTMLObjectElement>,
        HTMLObjectElement
      >;
    }
  }
}

interface PdfViewerModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  fileUrl: string;
  fileName: string;
}

export function PdfViewerModal({
  isOpen,
  onOpenChange,
  fileUrl,
  fileName,
}: PdfViewerModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleRedirectToFullPage = () => {
    // You can customize the URL as needed
    router.push(`/pdf-viewer?url=${encodeURIComponent(fileUrl)}`);
  };

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setError(null);
    }
  }, [isOpen]);

  const handleLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleError = () => {
    setIsLoading(false);
    setError("Error al cargar el PDF. Por favor, inténtalo de nuevo.");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[95vw] h-[90vh] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-4 pb-2 border-b flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-red-500" />
            {fileName}
          </DialogTitle>
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mr-8"
          >
            <Button
              variant="outline"
              size="sm"
              className="h-8 flex items-center gap-2"
            >
              <Maximize2 className="h-4 w-4" />
              Ver PDF
            </Button>
          </a>
        </DialogHeader>
        <div className="flex-1 relative bg-gray-50 overflow-auto">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
              <Loader2 className="h-8 w-8 animate-spin text-red-500" />
            </div>
          )}
          {error ? (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <p className="mb-4 text-red-500">{error}</p>
              <Button
                variant="outline"
                onClick={() => {
                  setIsLoading(true);
                  setError(null);
                }}
                className="mt-4"
              >
                Reintentar
              </Button>
            </div>
          ) : (
            <object
              data={`${fileUrl}`}
              type="application/pdf"
              width="100%"
              height="100%"
              onLoad={handleLoad}
              onError={handleError}
              className="w-full h-full min-h-[calc(90vh-80px)]"
            >
              <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                <p className="mb-4">
                  No se pudo cargar el PDF. Por favor, inténtalo de nuevo o
                  descárgalo.
                </p>
                <Button asChild variant="outline">
                  <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Abrir en una nueva pestaña
                  </a>
                </Button>
              </div>
            </object>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

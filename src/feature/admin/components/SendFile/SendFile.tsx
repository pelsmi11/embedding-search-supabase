"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../components/shadcn/ui/card";
import { Input } from "../../../../components/shadcn/ui/input";
import { Label } from "../../../../components/shadcn/ui/label";
import { Upload, FileText, Loader2 } from "lucide-react";
import { Button } from "../../../../components/shadcn/ui/button";
import { useForm } from "react-hook-form";
import { uploadAndEmbedPDF } from "@/actions/uploadAndEmbedPDF";

export const SendFile = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm();

  const [result, setResult] = useState<{
    title: string;
    description: string;
    url: string;
  } | null>(null);

  const onSubmit = async (data: any) => {
    const formData = new FormData();
    formData.append("file", data.file[0]);
    const response = await uploadAndEmbedPDF(formData);
    if (response?.success) {
      setResult(response);
    }
  };

  const file = watch("file")?.[0];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Subir Documento PDF</CardTitle>
            <CardDescription className="text-base">
              Sube tu PDF para luego hacer la búsqueda en base a su contenido
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="pdf-file" className="text-sm font-medium">
                  Seleccionar archivo PDF
                </Label>
                <div className="relative">
                  <Input
                    id="pdf-file"
                    type="file"
                    accept=".pdf,application/pdf"
                    {...register("file", { required: true })}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    disabled={isSubmitting}
                  />
                </div>
                {file && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                    <FileText className="h-4 w-4" />
                    <span>{file.name}</span>
                    <span className="text-xs">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                )}
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium text-sm mb-2">
                  Información importante:
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Solo se aceptan archivos en formato PDF</li>
                  <li>• Tamaño máximo: 10 MB</li>
                  <li>• El contenido será procesado para búsquedas</li>
                </ul>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Subiendo archivo...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Subir PDF
                  </>
                )}
              </Button>

              {result && (
                <div className="mt-4 p-4 border rounded text-sm">
                  <p>
                    <strong>Título:</strong> {result.title}
                  </p>
                  <p>
                    <strong>Descripción:</strong> {result.description}
                  </p>
                  <a
                    className="text-blue-500 underline"
                    href={result.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ver documento
                  </a>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { Upload, CheckCircle, AlertCircle, FileJson, FileText, Loader } from "lucide-react";
import { toast } from "sonner";

interface ImportExcursionsProps {
  onImportSuccess?: () => void;
}

export default function ImportExcursions({ onImportSuccess }: ImportExcursionsProps) {
  const [fileContent, setFileContent] = useState<string>("");
  const [filename, setFilename] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importMutation = trpc.admin.importExcursions.useMutation({
    onSuccess: (data) => {
      toast.success(`Imported ${data.imported} excursions!`);
      resetForm();
      // Notify parent component to refetch trips
      if (onImportSuccess) {
        onImportSuccess();
      }
    },
    onError: (error) => {
      toast.error(`Import failed: ${error.message}`);
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const resetForm = () => {
    setFileContent("");
    setFilename("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileSelect = (file: File) => {
    const validExtensions = ["json", "csv"];
    const fileExt = file.name.split(".").pop()?.toLowerCase();

    if (!fileExt || !validExtensions.includes(fileExt)) {
      toast.error("Please select a JSON or CSV file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setFileContent(content);
      setFilename(file.name);
    };
    reader.onerror = () => {
      toast.error("Failed to read file");
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleImport = async () => {
    if (!fileContent || !filename) {
      toast.error("Please select a file first");
      return;
    }

    setIsLoading(true);
    try {
      await importMutation.mutateAsync({
        fileContent,
        filename,
      });
    } catch (error) {
      // Error is handled by onError callback
    }
  };

  const getFileIcon = () => {
    if (!filename) return null;
    if (filename.endsWith(".json")) {
      return <FileJson className="w-5 h-5" />;
    }
    return <FileText className="w-5 h-5" />;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Import Excursions
        </CardTitle>
        <CardDescription>
          Import excursions from JSON or CSV file. Supports both formats with automatic field mapping.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
          } ${fileContent ? "bg-muted/50" : "bg-muted/20"}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.csv"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={isLoading}
          />

          <div className="space-y-3">
            {fileContent ? (
              <>
                <div className="flex justify-center">
                  <div className="flex items-center gap-3 bg-green-50 dark:bg-green-950 px-4 py-2 rounded-lg">
                    {getFileIcon()}
                    <span className="font-medium text-green-700 dark:text-green-300">{filename}</span>
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Ready to import. Review the file details below before importing.
                </p>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                <div>
                  <p className="font-medium">Drag and drop your file here</p>
                  <p className="text-sm text-muted-foreground">or click to select (JSON or CSV)</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                >
                  Select File
                </Button>
              </>
            )}
          </div>
        </div>

        {/* File Preview */}
        {fileContent && (
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm mb-2">File Preview</h4>
              <div className="bg-muted rounded p-3 max-h-48 overflow-auto">
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-words">
                  {fileContent.slice(0, 500)}
                  {fileContent.length > 500 && "..."}
                </pre>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetForm}
                disabled={isLoading}
              >
                Change File
              </Button>
              <Button
                size="sm"
                onClick={handleImport}
                disabled={isLoading || !fileContent}
              >
                {isLoading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                {isLoading ? "Importing..." : "Import Excursions"}
              </Button>
            </div>
          </div>
        )}

        {/* Import Status */}
        {importMutation.data && (
          <Alert className={importMutation.data.failed === 0 ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}>
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">{importMutation.data.message}</p>
                {importMutation.data.failedImports.length > 0 && (
                  <div className="text-sm">
                    <p className="font-medium mb-2">Failed imports:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      {importMutation.data.failedImports.slice(0, 5).map((item, idx) => (
                        <li key={idx} className="text-muted-foreground">
                          <span className="font-medium">{item.name}</span>: {item.error}
                        </li>
                      ))}
                      {importMutation.data.failedImports.length > 5 && (
                        <li className="text-muted-foreground">
                          ...and {importMutation.data.failedImports.length - 5} more
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Format Guide */}
        <div className="space-y-3 border-t pt-4">
          <h4 className="font-medium text-sm">Supported Formats</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* JSON Format */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FileJson className="w-4 h-4" />
                JSON Format
              </div>
              <pre className="bg-muted rounded p-2 text-xs overflow-auto max-h-32 whitespace-pre-wrap break-words">
{`[
  {
    "name": "Excursion Name",
    "description": "...",
    "address": "...",
    "region": "...",
    "category": "...",
    "cost": "free|low|medium|high|very_high",
    "website_url": "...",
    "latitude": "...",
    "longitude": "..."
  }
]`}
              </pre>
            </div>

            {/* CSV Format */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FileText className="w-4 h-4" />
                CSV Format
              </div>
              <pre className="bg-muted rounded p-2 text-xs overflow-auto max-h-32 whitespace-pre-wrap break-words">
{`name,description,address,region,category,cost,website_url
Excursion 1,Description,...,...,...,free,...
Excursion 2,Description,...,...,...,low,...`}
              </pre>
            </div>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>Legacy field names:</strong> The importer also recognizes old field names:
              <span className="font-mono text-xs ml-2">beschreibung, adresse, kosten_stufe, lat, lng</span>
            </p>
            <p>
              <strong>Cost levels:</strong> 0=free, 1=low, 2=medium, 3=high, 4=very_high (or use text values)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

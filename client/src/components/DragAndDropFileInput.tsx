import React, { useState, useCallback, useRef } from 'react';
import { cn } from "@/lib/utils";
import { ImagePlus, XCircle } from "lucide-react";
import { Button } from '@/components/ui/button';

interface DragAndDropFileInputProps {
  onFileSelected: (file: File | null) => void;
  selectedFile: File | null;
  disabled?: boolean;
  accept?: string;
}

export function DragAndDropFileInput({
  onFileSelected,
  selectedFile,
  disabled,
  accept = "image/*",
}: DragAndDropFileInputProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  React.useEffect(() => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setFilePreview(null);
    }
  }, [selectedFile]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragging(false);
  }, [disabled]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    e.dataTransfer.dropEffect = 'copy';
  }, [disabled]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.match(accept.replace(/\*/g, ''))) { // Basic type check based on accept prop
        onFileSelected(file);
      } else {
        alert(`Invalid file type. Please upload a ${accept} file.`);
      }
    }
  }, [onFileSelected, disabled, accept]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.match(accept.replace(/\*/g, ''))) {
        onFileSelected(file);
      } else {
        alert(`Invalid file type. Please upload a ${accept} file.`);
        if (fileInputRef.current) {
          fileInputRef.current.value = ""; // Clear the input
        }
        onFileSelected(null);
      }
    }
  }, [onFileSelected, accept]);

  const handleRemoveFile = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the file input click
    onFileSelected(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [onFileSelected]);

  const handleClick = useCallback(() => {
    if (fileInputRef.current && !disabled) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
        "hover:border-primary-foreground focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
        isDragging ? "border-primary-foreground bg-accent" : "border-gray-300 dark:border-gray-700",
        disabled && "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800"
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
        accept={accept}
      />

      {filePreview && selectedFile ? (
        <div className="relative w-full h-32 mb-4 rounded-md overflow-hidden">
          <img src={filePreview} alt="File preview" className="w-full h-full object-cover" />
          {!disabled && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 rounded-full bg-background/80 hover:bg-background"
              onClick={handleRemoveFile}
            >
              <XCircle className="h-4 w-4 text-red-500" />
            </Button>
          )}
          <p className="absolute bottom-1 left-1 text-xs text-white bg-black/50 px-1 py-0.5 rounded">{selectedFile.name}</p>
        </div>
      ) : (
        <>
          <ImagePlus className="w-8 h-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground text-center">
            Ziehen Sie Ihr Bild hierher oder{" "}
            <span className="text-primary font-medium">klicken Sie zum Hochladen</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">Max. 5MB, JPG, PNG, WebP</p>
        </>
      )}
    </div>
  );
}

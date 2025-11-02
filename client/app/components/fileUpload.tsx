"use client";
import { useState } from "react";
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
  
const FileUploadComponent: React.FC = () => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [selectedFileName, setSelectedFileName] = useState<string>("");

  const handleFileUploadClick = () => {
    const el = document.createElement('input');
    el.setAttribute('type','file');
    el.setAttribute('accept', 'application/pdf');
    el.addEventListener('change', async (ev) => {
      if (el.files && el.files.length > 0) {
        const file = el.files.item(0);
        if (file) {
          setSelectedFileName(file.name);
          setIsUploading(true);
          setUploadStatus("idle");
          
          try {
            const formData = new FormData();
            formData.append('pdf', file);
            
            const response = await fetch('http://localhost:8000/upload/pdf', {
              method: 'POST',
              body: formData
            });
            
            if (response.ok) {
              setUploadStatus("success");
              setTimeout(() => {
                setUploadStatus("idle");
                setSelectedFileName("");
              }, 3000);
            } else {
              setUploadStatus("error");
            }
          } catch (error) {
            console.error("Upload error:", error);
            setUploadStatus("error");
          } finally {
            setIsUploading(false);
          }
        }
      }
    });
    el.click();
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
          <div className="text-center mb-6">
            <div className="inline-flex p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Upload PDF Documents
            </h2>
            <p className="text-sm text-muted-foreground">
              Add Node.js documentation PDFs to enhance the assistant&apos;s knowledge
            </p>
          </div>

          <Button
            onClick={handleFileUploadClick}
            disabled={isUploading}
            className={cn(
              "w-full h-auto py-6 px-4 rounded-xl text-base font-semibold transition-all shadow-lg",
              "bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",
              "text-white disabled:opacity-50 disabled:cursor-not-allowed",
              "hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            )}
          >
            {isUploading ? (
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Uploading...</span>
              </div>
            ) : uploadStatus === "success" ? (
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5" />
                <span>Upload Successful!</span>
              </div>
            ) : uploadStatus === "error" ? (
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5" />
                <span>Upload Failed - Try Again</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Upload className="h-5 w-5" />
                <span>Upload PDF File</span>
              </div>
            )}
          </Button>

          {selectedFileName && uploadStatus === "idle" && (
            <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
              <p className="text-xs text-muted-foreground mb-1">Selected file:</p>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                {selectedFileName}
              </p>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <strong className="font-semibold">Tip:</strong> You can upload multiple PDF files. The assistant will use all uploaded documents to answer your questions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadComponent;

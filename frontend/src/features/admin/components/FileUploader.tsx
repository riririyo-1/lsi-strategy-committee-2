"use client";

import { useState } from "react";
import { Loader2, Upload, X } from "lucide-react";

interface FileUploaderProps {
  accept?: string;
  onUpload: (url: string) => void;
  label: string;
  currentValue?: string;
  maxSizeMB?: number;
}

/**
 * ファイルアップロードコンポーネント
 */
const FileUploader: React.FC<FileUploaderProps> = ({
  accept,
  onUpload,
  label,
  currentValue,
  maxSizeMB = 10, // デフォルトの最大ファイルサイズ（MB）
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // ファイルサイズのバリデーション
    const maxSize = maxSizeMB * 1024 * 1024; // MB to bytes
    if (file.size > maxSize) {
      setError(`ファイルサイズは${maxSizeMB}MB以下である必要があります`);
      return;
    }

    try {
      setIsUploading(true);
      setProgress(10); // 開始時の進行状況

      const formData = new FormData();
      formData.append("file", file);

      // アップロードのシミュレーション
      const simulateProgress = () => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.floor(Math.random() * 10);
        });
      };

      const progressInterval = setInterval(simulateProgress, 300);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "アップロードに失敗しました");
      }

      const data = await response.json();
      onUpload(data.url);
    } catch (err) {
      setError(
        (err as Error).message || "アップロード中にエラーが発生しました"
      );
      console.error("アップロードエラー:", err);
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const handleReset = () => {
    onUpload("");
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">{label}</label>

      {currentValue ? (
        <div className="flex items-center mt-2 mb-2">
          {currentValue.includes("image") ? (
            <img
              src={currentValue}
              alt={label}
              className="h-24 w-auto object-cover rounded-md"
            />
          ) : (
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
              <span className="text-sm">{currentValue.split("/").pop()}</span>
            </div>
          )}
          <button
            type="button"
            onClick={handleReset}
            className="ml-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 dark:bg-red-900 dark:text-red-400 dark:hover:bg-red-800"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="mt-1">
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="file-upload"
              className={`flex flex-col items-center justify-center w-full h-32 
                border-2 border-gray-300 border-dashed rounded-lg 
                cursor-pointer bg-gray-50 hover:bg-gray-100
                dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600
                ${isUploading ? "pointer-events-none opacity-75" : ""}`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {isUploading ? (
                  <>
                    <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      アップロード中... {progress}%
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-gray-500 mb-2" />
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      クリックして{label}をアップロード
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {accept ? `${accept}` : "すべてのファイル"}
                    </p>
                  </>
                )}
              </div>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="hidden"
                accept={accept}
                onChange={handleUpload}
                disabled={isUploading}
              />
            </label>
          </div>

          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUploader;

import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "./input"
import { Button } from "./button"
import { Upload, X } from "lucide-react"

export interface FileInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onFilesChange?: (files: File[]) => void
  maxFiles?: number
  preview?: boolean
  selectedFiles?: File[]
  urls?: string[]
  onRemoveUrl?: (url: string) => void
  onRemoveFile?: (file: File) => void
}

const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  ({ className, onFilesChange, maxFiles = 5, preview = true, selectedFiles = [], urls = [], onRemoveUrl, onRemoveFile, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const [files, setFiles] = React.useState<File[]>(selectedFiles)
    const [fileUrls, setFileUrls] = React.useState<string[]>(urls)

    React.useEffect(() => {
      setFiles(selectedFiles)
    }, [selectedFiles])

    React.useEffect(() => {
      setFileUrls(urls)
    }, [urls])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = e.target.files
      if (!fileList) return

      const newFilesArray = Array.from(fileList)
      const updatedFiles = [...files, ...newFilesArray].slice(0, maxFiles)
      
      setFiles(updatedFiles)
      if (onFilesChange) {
        onFilesChange(updatedFiles)
      }
      
      if (inputRef.current) {
        inputRef.current.value = ""
      }
    }

    const handleRemoveFile = (fileToRemove: File) => {
      const filteredFiles = files.filter(file => file !== fileToRemove)
      setFiles(filteredFiles)
      if (onRemoveFile) {
        onRemoveFile(fileToRemove)
      } else if (onFilesChange) {
        onFilesChange(filteredFiles)
      }
    }

    const handleRemoveUrl = (urlToRemove: string) => {
      const filteredUrls = fileUrls.filter(url => url !== urlToRemove)
      setFileUrls(filteredUrls)
      if (onRemoveUrl) {
        onRemoveUrl(urlToRemove)
      }
    }

    const renderPreviews = () => {
      return (
        <div className="mt-2 flex flex-wrap gap-2">
          {fileUrls.map((url, index) => (
            <div key={index} className="relative group h-20 w-20 rounded-md overflow-hidden border border-input">
              <img 
                src={url} 
                alt={`Uploaded preview ${index}`} 
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemoveUrl(url)}
                className="absolute top-1 right-1 bg-black/50 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3 text-white" />
              </button>
            </div>
          ))}
          
          {files.map((file, index) => (
            <div key={index} className="relative group h-20 w-20 rounded-md overflow-hidden border border-input">
              <img 
                src={URL.createObjectURL(file)} 
                alt={`Preview ${index}`} 
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemoveFile(file)}
                className="absolute top-1 right-1 bg-black/50 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      )
    }

    return (
      <div className={className}>
        <div className="flex items-center gap-2">
          <Input
            type="file"
            ref={inputRef}
            onChange={handleFileChange}
            className="hidden"
            multiple
            accept="image/*"
            {...props}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={files.length >= maxFiles}
          >
            <Upload className="h-4 w-4 mr-2" />
            Télécharger des images
          </Button>
          <div className="text-xs text-muted-foreground">
            {files.length}/{maxFiles} images
          </div>
        </div>
        
        {preview && (files.length > 0 || fileUrls.length > 0) && renderPreviews()}
      </div>
    )
  }
)

FileInput.displayName = "FileInput"

export { FileInput }

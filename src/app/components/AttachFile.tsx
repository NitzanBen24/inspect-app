"use client";
import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";

interface Props {
    updateFiles: (files: File[]) => void,
    //clearUploader: () => void,
}

const AttachFile = forwardRef(({ updateFiles }: Props, ref) => {
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [files, setFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        updateFiles(files);
        return () => {
            selectedImages.forEach((image) => URL.revokeObjectURL(image));
        };
    }, [selectedImages, files]);

    useImperativeHandle(ref, () => ({
        clear() {
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            setSelectedImages([]);
            setFiles([]);
        },
    }));

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = event.target.files;
        if (fileList) {
            const newFiles = Array.from(fileList);
            setFiles((prevFiles) => [...prevFiles, ...newFiles]);
            setSelectedImages((prevImages) => [
                ...prevImages,
                ...newFiles.map((file) => URL.createObjectURL(file)),
            ]);
        }
    };

    const removeFile = (index: number) => {
        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
        setSelectedImages((prevImages) => prevImages.filter((_, i) => i !== index));

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="flex flex-col items-start gap-4 py-4">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="border p-2 rounded"
            />

            {selectedImages.length > 0 && (
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    {selectedImages.map((image, index) => (
                        <div key={index} className="relative w-20 h-20 overflow-hidden rounded-lg">
                            <img src={image} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                            <button
                                onClick={() => removeFile(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full px-2 py-1 text-xs"
                            >
                                x
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
});

AttachFile.displayName = "AttachFile"; // Fix for forwardRef

export default AttachFile;


"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Switch } from "../ui/switch"
import { Label } from "../ui/label"
import { Integration, integrationService } from "@/services/integrationService"
import { Upload, FileText } from "lucide-react"

interface IntegrationFormProps {
    initialData?: Integration;
    onSubmit: (data: Omit<Integration, "id" | "createdAt" | "updatedAt" | "deletedAt">) => void;
    onCancel: () => void;
}

export default function IntegrationForm({ initialData, onSubmit, onCancel }: IntegrationFormProps) {
    const [formData, setFormData] = useState({
        displayName: initialData?.displayName || "",
        uniqueName: initialData?.uniqueName || "",
        description: initialData?.description || "",
        public: initialData?.public || false,
        additionalInfo: {
            isFileBased: true,
            fileStatus: "active",
            failedReason: "",
            publicBaseURL: initialData?.additionalInfo.publicBaseURL || "",
            documentationURL: initialData?.additionalInfo.documentationURL || "",
            isLocallyStored: initialData?.additionalInfo.isLocallyStored || false
        },
        createdBy: initialData?.createdBy || "user1" // This would come from auth context in real app
    });

    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.displayName.trim()) {
            newErrors.displayName = "Display name is required";
        }

        if (!formData.uniqueName.trim()) {
            newErrors.uniqueName = "Unique name is required";
        }

        if (!formData.description.trim()) {
            newErrors.description = "Description is required";
        }

        if (!formData.additionalInfo.publicBaseURL.trim()) {
            newErrors.publicBaseURL = "Base URL is required";
        }

        if (!formData.additionalInfo.documentationURL && !uploadedFileName) {
            newErrors.documentation = "Documentation file is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset documentation error
        setErrors({ ...errors, documentation: "" });

        // Check if file is a YAML file
        if (!file.name.endsWith('.yaml') && !file.name.endsWith('.yml')) {
            setErrors({ ...errors, documentation: "Please upload a YAML file (.yaml or .yml)" });
            return;
        }
        // Check if file is too large (e.g., 8MB limit)
        if (file.size > 8 * 1024 * 1024) { 
            setErrors({ ...errors, documentation: "File size must be less than 8MB" });
            return;
        }

        setIsUploading(true);
        setUploadedFileName(null); // Clear previous filename while uploading

        try {
            // Call the actual service function to upload the file
            const response = await integrationService.uploadDocumentationFile(file);
            console.log('File upload successful:', response);

            // Update the form data with the received documentation URL
            setFormData({
                ...formData,
                additionalInfo: {
                    ...formData.additionalInfo,
                    documentationURL: response.file_url, // Use the actual URL from the response
                    fileStatus: "uploaded"
                }
            });
            
            setUploadedFileName(file.name); // Show the filename after successful upload
            
        } catch (error) {
            console.error('Error uploading file:', error);
            let errorMessage = "Failed to upload file. Please try again.";
            // You could potentially extract a more specific error message if your API provides one
            // if (axios.isAxiosError(error) && error.response?.data?.message) {
            //     errorMessage = error.response.data.message;
            // }
            setErrors({ ...errors, documentation: errorMessage });
            setFormData({
                ...formData,
                additionalInfo: {
                    ...formData.additionalInfo,
                    documentationURL: "", // Clear URL on failure
                    fileStatus: "failed",
                    failedReason: "Failed to upload file"
                }
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div>
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                        id="displayName"
                        value={formData.displayName}
                        onChange={(e) => {
                            setFormData({ ...formData, displayName: e.target.value });
                            setErrors({ ...errors, displayName: "" });
                        }}
                        required
                        className={errors.displayName ? "border-red-500" : ""}
                    />
                    {errors.displayName && (
                        <p className="mt-1 text-sm text-red-500">{errors.displayName}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="uniqueName">Unique Name</Label>
                    <Input
                        id="uniqueName"
                        value={formData.uniqueName}
                        onChange={(e) => {
                            setFormData({ ...formData, uniqueName: e.target.value });
                            setErrors({ ...errors, uniqueName: "" });
                        }}
                        required
                        className={errors.uniqueName ? "border-red-500" : ""}
                    />
                    {errors.uniqueName && (
                        <p className="mt-1 text-sm text-red-500">{errors.uniqueName}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => {
                            setFormData({ ...formData, description: e.target.value });
                            setErrors({ ...errors, description: "" });
                        }}
                        required
                        className={errors.description ? "border-red-500" : ""}
                    />
                    {errors.description && (
                        <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="publicBaseURL">Base URL</Label>
                    <Input
                        id="publicBaseURL"
                        value={formData.additionalInfo.publicBaseURL}
                        onChange={(e) => {
                            setFormData({
                                ...formData,
                                additionalInfo: { ...formData.additionalInfo, publicBaseURL: e.target.value }
                            });
                            setErrors({ ...errors, publicBaseURL: "" });
                        }}
                        required
                        className={errors.publicBaseURL ? "border-red-500" : ""}
                    />
                    {errors.publicBaseURL && (
                        <p className="mt-1 text-sm text-red-500">{errors.publicBaseURL}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="documentation">OpenAPI Documentation</Label>
                    <div className="mt-2">
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <Input
                                    type="file"
                                    id="documentation"
                                    accept=".yaml,.yml"
                                    onChange={handleFileUpload}
                                    disabled={isUploading}
                                    className="hidden"
                                />
                                <Label
                                    htmlFor="documentation"
                                    className={`flex items-center justify-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-gray-50 ${errors.documentation ? "border-red-500" : "border-gray-200"
                                        }`}
                                >
                                    <Upload className="h-4 w-4" />
                                    {isUploading ? "Uploading..." : "Upload YAML File"}
                                </Label>
                            </div>
                            {uploadedFileName && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <FileText className="h-4 w-4" />
                                    {uploadedFileName}
                                </div>
                            )}
                        </div>
                        {errors.documentation && (
                            <p className="mt-1 text-sm text-red-500">{errors.documentation}</p>
                        )}
                        <p className="mt-1 text-sm text-gray-500">
                            Upload your OpenAPI specification file (YAML format)
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <Switch
                        id="public"
                        checked={formData.public}
                        onCheckedChange={(checked) => setFormData({ ...formData, public: checked })}
                    />
                    <Label htmlFor="public">Public Integration</Label>
                </div>

                <div className="flex items-center space-x-2">
                    <Switch
                        id="isLocallyStored"
                        checked={formData.additionalInfo.isLocallyStored}
                        onCheckedChange={(checked) => setFormData({
                            ...formData,
                            additionalInfo: { ...formData.additionalInfo, isLocallyStored: checked }
                        })}
                    />
                    <Label htmlFor="isLocallyStored">Locally Stored</Label>
                </div>
            </div>

            <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isUploading}>
                    {initialData ? "Update Integration" : "Create Integration"}
                </Button>
            </div>
        </form>
    );
} 
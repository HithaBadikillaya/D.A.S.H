import React, { useState, useEffect } from "react";
import {
    uploadAndTranscribe,
    generateMoM,
    getMoMTemplates,
    createMoMTemplate,
    updateMoMTemplate,
    deleteMoMTemplate,
} from "../../services/momApi";

// Components
import { MoMHeader } from "./mom/MoMHeader";
import { FileUploadZone } from "./mom/FileUploadZone";
import { MeetingDetails } from "./mom/MeetingDetails";
import { TemplateGrid } from "./mom/TemplateGrid";
import { ResultsDisplay } from "./mom/ResultsDisplay";
import { TemplateManagementModal } from "./mom/TemplateManagementModal";
import { PreviewModal } from "./mom/PreviewModal";
import type { Template } from "./mom/types";

export default function MoMGenerator() {
    // File upload state
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Transcription state
    const [transcription, setTranscription] = useState("");
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [transcriptionError, setTranscriptionError] = useState("");
    const [progress, setProgress] = useState(0);

    // Generation state
    const [selectedTemplateId, setSelectedTemplateId] = useState("");
    const [meetingTitle, setMeetingTitle] = useState("");
    const [generatedMoM, setGeneratedMoM] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState("");

    // Template state
    const [templates, setTemplates] = useState<Template[]>([]);
    const [templatesLoading, setTemplatesLoading] = useState(true);
    const [templatesError, setTemplatesError] = useState("");

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
    const [modalName, setModalName] = useState("");
    const [modalContent, setModalContent] = useState("");
    const [modalStructure, setModalStructure] = useState("");
    const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

    // Load templates on mount
    useEffect(() => {
        loadTemplates();
    }, []);

    // Auto-select first template
    useEffect(() => {
        if (templates.length > 0 && !selectedTemplateId) {
            setSelectedTemplateId(templates[0].id);
        }
    }, [templates, selectedTemplateId]);

    const loadTemplates = async () => {
        try {
            setTemplatesLoading(true);
            setTemplatesError("");
            const data = await getMoMTemplates();
            console.log("MoM Templates loaded:", data);
            setTemplates(data as any);
        } catch (error: any) {
            console.error("Failed to load templates:", error);
            setTemplatesError("Could not load templates. Check backend connection.");
        } finally {
            setTemplatesLoading(false);
        }
    };

    const handleFileSelect = (file: File) => {
        const maxSize = 4 * 1024 * 1024 * 1024; // 4GB
        if (file.size > maxSize) {
            setTranscriptionError("File size exceeds 4GB limit");
            return;
        }

        const allowedTypes = [
            "audio/mpeg", "audio/mp3", "audio/mp4", "audio/m4a", "audio/wav",
            "audio/webm", "audio/flac", "video/mp4", "video/webm", "video/mpeg", "video/quicktime"
        ];

        if (!allowedTypes.includes(file.type)) {
            setTranscriptionError("Invalid file type. Please upload audio/video files only.");
            return;
        }

        setUploadedFile(file);
        setTranscriptionError("");
        handleTranscribe(file);
    };

    const handleTranscribe = async (file: File) => {
        setIsTranscribing(true);
        setTranscriptionError("");
        setProgress(0);

        try {
            const transcriptText = await uploadAndTranscribe(file, (_msg, pct) => {
                setProgress(pct);
            });
            setProgress(100);
            setTranscription(transcriptText);
            setGeneratedMoM("");
            setTimeout(() => setProgress(0), 1000);
        } catch (error: any) {
            setProgress(0);
            setTranscriptionError(error.message || "Transcription failed");
            setUploadedFile(null);
        } finally {
            setIsTranscribing(false);
        }
    };

    const handleGenerate = async (length: "normal" | "longer" = "normal", currentContent?: string) => {
        if (!transcription.trim() || !selectedTemplateId) return;
        setIsGenerating(true);
        setGenerationError("");
        if (length === "normal") setGeneratedMoM("");
        try {
            const mom = await generateMoM({
                transcriptText: transcription,
                templateId: selectedTemplateId,
                meetingTitle: meetingTitle.trim() || undefined,
                length,
                currentContent
            });
            setGeneratedMoM(mom);
        } catch (error: any) {
            setGenerationError(error.message || "Failed to generate MoM");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleExpand = () => {
        handleGenerate("longer", generatedMoM);
    };

    const handleSaveTemplate = async () => {
        if (!modalName.trim() || !modalContent.trim()) return;
        try {
            if (editingTemplate) {
                await updateMoMTemplate(editingTemplate.id, {
                    name: modalName,
                    content: modalContent,
                    structure: modalStructure,
                });
            } else {
                await createMoMTemplate({
                    name: modalName,
                    content: modalContent,
                    structure: modalStructure,
                });
            }
            await loadTemplates();
            setIsModalOpen(false);
        } catch (e) {
            console.error(e);
        }
    };

    const handleDeleteTemplate = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await deleteMoMTemplate(id);
            await loadTemplates();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center p-4 md:p-10 relative overflow-y-auto">
            <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none opacity-50" />
            <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-secondary/20 rounded-full blur-[120px] pointer-events-none opacity-50" />

            <div className="relative z-10 w-full max-w-6xl space-y-10 mt-6 pb-20">
                <MoMHeader onNewTemplate={() => {
                    setEditingTemplate(null);
                    setModalName("");
                    setModalContent("");
                    setModalStructure("");
                    setIsModalOpen(true);
                }} />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-4 space-y-8">
                        <FileUploadZone
                            uploadedFile={uploadedFile}
                            isDragging={isDragging}
                            onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f); }}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onFileSelect={handleFileSelect}
                            isTranscribing={isTranscribing}
                            progress={progress}
                            transcriptionError={transcriptionError}
                            transcription={transcription}
                        />

                        <MeetingDetails
                            transcription={transcription}
                            meetingTitle={meetingTitle}
                            setMeetingTitle={setMeetingTitle}
                            handleGenerate={() => handleGenerate()}
                            isGenerating={isGenerating}
                            selectedTemplateId={selectedTemplateId}
                            templatesLoading={templatesLoading}
                            generationError={generationError}
                        />
                    </div>

                    <div className="lg:col-span-8 space-y-10">
                        <TemplateGrid
                            templates={templates}
                            selectedTemplateId={selectedTemplateId}
                            setSelectedTemplateId={setSelectedTemplateId}
                            setPreviewTemplate={setPreviewTemplate}
                            templatesLoading={templatesLoading}
                            templatesError={templatesError}
                            openEditModal={(template, e) => {
                                e.stopPropagation();
                                setEditingTemplate(template);
                                setModalName(template.name);
                                setModalContent(template.content);
                                setModalStructure(template.structure);
                                setIsModalOpen(true);
                            }}
                            handleDeleteTemplate={handleDeleteTemplate}
                        />

                        <ResultsDisplay
                            generatedMoM={generatedMoM}
                            onExpand={handleExpand}
                            isExpanding={isGenerating}
                        />
                    </div>
                </div>
            </div>

            <TemplateManagementModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                editingTemplate={editingTemplate}
                modalName={modalName}
                setModalName={setModalName}
                modalContent={modalContent}
                setModalContent={setModalContent}
                modalStructure={modalStructure}
                setModalStructure={setModalStructure}
                handleSaveTemplate={handleSaveTemplate}
            />

            <PreviewModal
                template={previewTemplate}
                onClose={() => setPreviewTemplate(null)}
            />
        </div>
    );
}

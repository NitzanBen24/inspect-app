import { getForms, updateFormStatus, deleteForm } from "@/app/lib/dbObject";
import { fieldsToForm } from "@/app/lib/formatData";
import { handleFormSubmit } from "@/app/services/formService";
import { getAllPDF } from "@/app/services/pdfService";
import { PdfForm } from "@/app/utils/types";
import { NextRequest, NextResponse } from "next/server";


export const GET = async (req: NextRequest): Promise<NextResponse> => {
    try {
        const pdfFiles = await getAllPDF();     
        
        // Check if the service returned an error object
        if ('error' in pdfFiles) {
            return NextResponse.json({ error: pdfFiles.error }, { status: 500 });
        }
    
        const formFields = await getForms();             
        // Check if the service returned an error object
        if ('error' in formFields) {
            return NextResponse.json({ error: formFields.error }, { status: 500 });
        }
        
        // get inspection from records
        const inspectionForm = pdfFiles.find((file) => file.name === 'בדיקה') || [];
        const records = fieldsToForm(formFields, inspectionForm as PdfForm)
        
        // Successful response with forms data
        return NextResponse.json({ pdfFiles, records });
    } catch (error) {
        console.error('Error loading PDF template:', error);
        return NextResponse.json({ error: 'Failed to load PDF file' }, { status: 500 });
    }
  } 

  export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const reqJson = await req.json();        

        if (!reqJson) {
            return NextResponse.json({ error: "Missing file to save!" }, { status: 400 });
        }

        const data = await handleFormSubmit(reqJson);        

        if (!data.success) {
            return NextResponse.json(
                { error: data.error || "Form submission failed", message: data.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, message: data.message, data });
    } catch (error: unknown) {
        console.error("Unknown error:", error instanceof Error ? error.stack : error);
        return NextResponse.json({ error: "Unknown error occurred" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
    try {
        const payload = await req.json(); // Expecting 'id' and 'updates' in the request body
        
        if (!payload.id || !payload.status) {
            return NextResponse.json({ error: "Form ID and updates are required" }, { status: 400 });
        }

        const result = await updateFormStatus(payload); // Call your update logic here

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || "Form update failed" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, message: result.message });
    } catch (error: unknown) {
        console.error("Error updating form:", error instanceof Error ? error.stack : error);
        return NextResponse.json({ error: "Failed to update form" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
    try {
        
        const { id } = await req.json(); // Extract the `id` from the request body
        
        if (!id) {
            return NextResponse.json({ error: "Form ID is required" }, { status: 400 });
        }

        const result = await deleteForm(id); // Call your delete service or database function

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || "Form deletion failed" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, message: result.message });
    } catch (error: unknown) {
        console.error("Error deleting form:", error instanceof Error ? error.stack : error);
        return NextResponse.json({ error: "Failed to delete form" }, { status: 500 });
    }
}


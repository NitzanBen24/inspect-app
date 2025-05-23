//import { updateFormStatus, deleteForm } from "@/app/lib/dbObject";
import { deleteForm, updateFormStatus } from "@/app/lib/db/forms";
import { formSubmit, searchForms } from "@/app/services/formService";
import { NextRequest, NextResponse } from "next/server";


async function _handleFormsPost(payload:any) {

    switch (payload.action) {
        case 'submit':
            return await formSubmit(payload);            
        case 'search':
            return await searchForms(payload.search);        
    }
    return { success: true, message: 'test', data:{} };

}

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {

        const payload = await req.json();            
        
        if (!payload) {
            return NextResponse.json({ error: "Missing file to save!" }, { status: 400 });
        }

        const result = await _handleFormsPost(payload);

        if (result.error) {
            return NextResponse.json(
                { error: result.error || "Form submission failed", message: result.message },
                { status: 500 }
            );
        }

        return NextResponse.json( result );
    } catch (error: unknown) {
        console.error("Unknown error:", error instanceof Error ? error.stack : error);
        return NextResponse.json({ error: "Unknown error occurred" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
    try {
        const payload = await req.json(); // Expecting 'id' and 'updates' in the request body
        
        if (!payload.id || !payload.status || !payload.formName) {
            return NextResponse.json({ error: "Form ID and updates are required" }, { status: 400 });
        }

        const tableName = (payload.formName === 'inspection') ? 'inspection_forms' : 'equipment_forms';
        
        const result = await updateFormStatus(payload, tableName); // Call your update logic here

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
        
        const payload = await req.json(); // Extract the `id` from the request body
        
        if (!payload.id || !payload.formName) {
            return NextResponse.json({ error: "Form ID is required" }, { status: 400 });
        }

        const tableName = (payload.formName === 'inspection') ? 'inspection_forms' : 'equipment_forms';

        const result = await deleteForm(payload.id.toString(), tableName); // Call your delete service or database function

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


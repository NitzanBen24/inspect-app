import { uploadImages } from "@/app/services/storageService";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    
    const formData = await req.formData();    
    
    if (!formData) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Extracting files
    const images: File[] = formData.getAll("image") as File[]; // Assuming multiple files input
    if (!images.length) {
        return NextResponse.json({ error: "No valid files uploaded" }, { status: 400 });
    }

    const uploadData = { images, userId: formData.get('userId') || null}
    const uploadRes = await uploadImages(uploadData);//todo: handle error

    return NextResponse.json({ folderName: uploadRes.folderName });//urls: uploadRes.urls, 
}


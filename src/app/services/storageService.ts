import { supabase } from "../lib/supabase";

export const uploadImages = async (payload: any): Promise<{ urls?: String[], folderName: string }> => {

    if (!payload.images || !payload.userId) {        
        return { urls:[], folderName: 'none' };
    }
   
    let imageUrls = [];
    let folderName = '';
    const dateNow = Date.now();
    try {
        for (let img of payload.images) {            
            folderName = `${dateNow}-user-` + payload.userId;
            const imgName = `${folderName}/${Date.now()}-${img.name}`;            
           
            const { error } = await supabase.storage.from("tcelectric").upload(imgName, img);
            supabase.storage.from("tcelectric").list('tcelectric')
            if (error) throw new Error(error.message);
    
            const { data: publicUrlData } = supabase.storage.from("tcelectric").getPublicUrl(imgName);
            
            imageUrls.push(publicUrlData.publicUrl)
        }
    } catch(err) {
        console.error('Error uploading file', err)
    }

    return { folderName };
}

export const downloadImages = async (folderName: string): Promise<any[]> => {    

    try {
        const { data: images, error: errorList } = await supabase.storage.from('tcelectric').list(folderName)        
        
        // todo Handle error
        if (!images || errorList) {
            console.error('Error laoding files list')
            return [];
        }

        const downloadPromises = images.map(img => {            
            return supabase.storage.from('tcelectric').download(`${folderName}/${img.name}`)
        }); 

        return await Promise.all(downloadPromises);
    
    } catch(err) {
        console.error('Error downloding file/s', err)
        return [] ;
    }    
}
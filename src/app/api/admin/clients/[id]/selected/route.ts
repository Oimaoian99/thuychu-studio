import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    const { data: selectedImages, error } = await supabase
      .from('selected_images')
      .select('image_name, image_drive_id')
      .eq('client_id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, data: selectedImages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    // 1. Xóa các lựa chọn ảnh của khách này (nếu có) để tránh lỗi dính dữ liệu
    await getSupabase().from('selected_images').delete().eq('client_id', id);
    
    // 2. Xóa bản ghi khách hàng khỏi cơ sở dữ liệu
    const { error } = await getSupabase().from('clients').delete().eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { max_selections } = await req.json();

    const { error } = await getSupabase()
      .from('clients')
      .update({ max_selections })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

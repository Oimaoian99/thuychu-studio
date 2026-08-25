import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    
    // Mật khẩu mặc định là thuychu123, bạn có thể thiết lập biến môi trường ADMIN_PASSWORD trên Vercel sau để bảo mật hơn
    const correctPassword = process.env.ADMIN_PASSWORD || 'thuychu123';

    if (password === correctPassword) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: 'Mật khẩu không chính xác' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}

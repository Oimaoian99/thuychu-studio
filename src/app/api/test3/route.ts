import { NextResponse } from 'next/server';
import { drive } from '@/lib/drive';

export async function GET(req: Request) {
  try {
    const auth: any = drive.context._options.auth;
    const token = await auth.getAccessToken();

    const response = await fetch(`https://www.googleapis.com/drive/v3/files/1xNH3ExP_k02sd4hgO1ssrY1FXx4lotvW?alt=media`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Range: 'bytes=0-1'
      }
    });

    return new Response(response.body, {
      status: response.status,
      headers: response.headers
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}

import { NextResponse } from 'next/server';
import { drive } from '@/lib/drive';

export async function GET(req: Request) {
  try {
    const auth: any = drive.context._options.auth;
    const token = auth.getClient ? await (await auth.getClient()).getAccessToken() : await auth.getAccessToken();

    const response = await fetch(`https://www.googleapis.com/drive/v3/about?fields=storageQuota,user`, {
      headers: {
        Authorization: `Bearer ${token.token}`
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

import { NextApiRequest, NextApiResponse } from 'next';
import { drive } from '@/lib/drive';

export const config = {
  api: {
    responseLimit: false, // Ngăn Next.js chặn stream dung lượng lớn
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const id = req.query.id as string;
    if (!id) {
      return res.status(400).json({ error: 'Missing file id' });
    }

    const rangeHeader = req.headers.range;
    const requestHeaders: any = {};
    if (rangeHeader) {
      requestHeaders['Range'] = rangeHeader;
    }

    // Lấy luồng dữ liệu file từ Google Drive
    const response = await drive.files.get(
      { fileId: id, alt: 'media' },
      { 
        responseType: 'stream',
        headers: requestHeaders
      }
    );

    const driveHeaders = response.headers as any;
    
    // Copy necessary headers
    if (driveHeaders['content-type']) res.setHeader('Content-Type', driveHeaders['content-type']);
    if (driveHeaders['content-length']) res.setHeader('Content-Length', driveHeaders['content-length']);
    if (driveHeaders['content-range']) res.setHeader('Content-Range', driveHeaders['content-range']);
    if (driveHeaders['accept-ranges']) res.setHeader('Accept-Ranges', driveHeaders['accept-ranges']);
    
    res.setHeader('Content-Disposition', 'inline');
    res.status(response.status === 206 ? 206 : 200);

    // Pipe the stream trực tiếp sang response
    response.data.pipe(res);

  } catch (error: any) {
    console.error('Drive stream proxy error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
}

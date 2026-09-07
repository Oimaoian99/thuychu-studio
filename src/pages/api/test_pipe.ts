import { NextApiRequest, NextApiResponse } from 'next';
import { Readable } from 'stream';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Length', '10');
  res.setHeader('Content-Type', 'video/mp4');
  
  const s = new Readable();
  s.push('0123456789');
  s.push(null);
  
  s.pipe(res);
}

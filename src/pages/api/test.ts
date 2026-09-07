import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'video/mp4');
  res.setHeader('Content-Length', '123');
  res.status(200).send("hello");
}

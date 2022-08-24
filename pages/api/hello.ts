import type { NextApiHandler } from 'next';

type Data = {
  name: string;
};

const handler: NextApiHandler<Data> = (req, res) => {
  res.status(200).json({ name: 'John Doe' });
};

export default handler;

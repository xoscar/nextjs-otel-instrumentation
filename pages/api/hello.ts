import { Todo } from '@prisma/client';
import type { NextApiHandler } from 'next';
import TodoService from '../../services/TodoService';

type Data = Todo[];

const handler: NextApiHandler<Data> = async (req, res) => {
  const todoList = await TodoService.findAll();

  res.status(200).json(todoList);
};

export default handler;

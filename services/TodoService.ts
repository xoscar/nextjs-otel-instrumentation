import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const TodoService = () => ({
  create(rawTodo: Prisma.TodoCreateInput) {
    return prisma.todo.create({ data: rawTodo });
  },
  findAll() {
    return prisma.todo.findMany();
  },
  findOne(id: number) {
    return prisma.todo.findUnique({ where: { id } });
  },
  update(id: number, rawTodo: Prisma.TodoUpdateInput) {
    return prisma.todo.update({ where: { id }, data: rawTodo });
  },
});

export default TodoService();

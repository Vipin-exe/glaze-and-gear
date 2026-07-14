import { PrismaClient } from '@prisma/client'

const createMockPrisma = () => {
  console.warn("⚠️ No DATABASE_URL found. Using a mock Prisma client to prevent crashes.");
  const handler = {
    get(target: any, prop: string) {
      if (prop === '$connect' || prop === '$disconnect') return async () => {};
      if (prop === '$transaction') return async (cb: any) => cb(new Proxy({}, handler));
      return new Proxy({}, {
        get(target2: any, prop2: string) {
          return async (...args: any[]) => {
            if (['findMany', 'map', 'filter', 'groupBy'].includes(prop2)) return [];
            if (['count', 'updateMany', 'deleteMany'].includes(prop2)) return 0;
            if (['createMany'].includes(prop2)) return { count: 0 };
            if (['aggregate'].includes(prop2)) return { _sum: {}, _count: {}, _avg: {}, _min: {}, _max: {} };
            return null;
          };
        }
      });
    }
  };
  return new Proxy({}, handler) as unknown as PrismaClient;
};

const prismaClientSingleton = () => {
  if (!process.env.DATABASE_URL) {
    return createMockPrisma();
  }
  return new PrismaClient()
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma

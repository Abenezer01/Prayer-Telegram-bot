import prismaPackage from "@prisma/client";

const { PrismaClient } = prismaPackage as any;

export const prisma = new PrismaClient();

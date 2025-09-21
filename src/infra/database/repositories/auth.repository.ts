import { PrismaClient, AuthUser } from "@prisma/client";

export class AuthRepository {
  private prisma: PrismaClient;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient();
  }

  async create(data: Omit<AuthUser, "id">): Promise<AuthUser> {
    return this.prisma.authUser.create({ data });
  }

  async findById(id: string): Promise<AuthUser | null> {
    return this.prisma.authUser.findUnique({ where: { id } });
  }

  async findByUsername(username: string): Promise<AuthUser | null> {
    return this.prisma.authUser.findUnique({ where: { username } });
  }

  async update(id: string, data: Partial<AuthUser>): Promise<AuthUser> {
    return this.prisma.authUser.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<AuthUser> {
    return this.prisma.authUser.delete({ where: { id } });
  }

  async updateUserConfirmationStatus(
    username: string,
    userConfirmed: boolean,
  ): Promise<AuthUser> {
    return this.prisma.authUser.update({
      where: { username },
      data: { userConfirmed },
    });
  }
}

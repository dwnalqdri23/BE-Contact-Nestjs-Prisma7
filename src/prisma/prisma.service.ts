import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from "@nestjs/common";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {

    private readonly logger = new Logger(PrismaService.name);
    constructor() {
        const adapter = new PrismaMariaDb({
            host: process.env.DATABASE_HOST!,
            user: process.env.DATABASE_USER!,
            password: process.env.DATABASE_PASSWORD!,
            database: process.env.DATABASE_NAME!,
            connectionLimit: 5,
        });
        super({adapter});
    }
    
    async onModuleInit() {
        try {
            await this.$connect();
            this.logger.log('Connected to the database successfully.');
        } catch (error) {
            this.logger.error('Failed to connect to the database.', error);
        }
    }
    async onModuleDestroy() {
       await this.$disconnect();
       this.logger.log('Disconnected from the database.');
    }

}

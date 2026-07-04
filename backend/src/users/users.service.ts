import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    try {
      const count = await this.userModel.countDocuments();
      if (count === 0) {
        this.logger.log('No users found in the database. Seeding initial admin user...');
        
        const adminUsername = this.configService.get<string>('ADMIN_USERNAME');
        const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');

        if (adminUsername && adminPassword) {
          const hashedPassword = await bcrypt.hash(adminPassword, 10);
          
          await this.userModel.create({
            username: adminUsername,
            password: hashedPassword,
          });
          
          this.logger.log(`Successfully seeded initial admin user: ${adminUsername}`);
        } else {
          this.logger.warn('ADMIN_USERNAME or ADMIN_PASSWORD not found in environment variables. Admin user not seeded.');
        }
      }
    } catch (error) {
      this.logger.error('Error seeding initial admin user', error);
    }
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).exec();
  }
}

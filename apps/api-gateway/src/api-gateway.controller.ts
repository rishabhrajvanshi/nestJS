import { Controller, Get, Post, Body, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ApiGatewayService } from './api-gateway.service';

export class CreateUserDto {
  name: string;
  email: string;
  age: number;
}

@Controller()
export class ApiGatewayController {
  private readonly logger = new Logger(ApiGatewayController.name);

  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  @Get()
  getHello(): string {
    return this.apiGatewayService.getHello();
  }

  @Get('health')
  getHealth() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'api-gateway'
    };
  }

  @Post('users')
  async createUser(@Body() createUserDto: CreateUserDto) {
    try {
      this.logger.log(`Received user creation request: ${JSON.stringify(createUserDto)}`);
      
      // Validate input
      if (!createUserDto.name || !createUserDto.email || !createUserDto.age) {
        throw new HttpException(
          'Missing required fields: name, email, age', 
          HttpStatus.BAD_REQUEST
        );
      }

      // Process the request through gRPC
      const result = await this.apiGatewayService.processUserData(createUserDto);
      
      return {
        success: true,
        data: result,
        message: 'User data processed successfully',
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Error processing user data: ${error.message}`);
      throw new HttpException(
        `Failed to process user data: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('users')
  async getAllUsers() {
    try {
      const users = await this.apiGatewayService.getAllProcessedUsers();
      return {
        success: true,
        data: users,
        count: users.length,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Error retrieving users: ${error.message}`);
      throw new HttpException(
        `Failed to retrieve users: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}

import { Body, Controller, Post } from '@nestjs/common';
import { ProductService } from './products.service';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ProductDto } from './dto/product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() body: ProductDto) {
    return this.productService.create(body);
  }
}

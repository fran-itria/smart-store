import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ProductService } from './products.service';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ProductDto } from './dto/product.dto';
import { productExamples } from './dto/product.examples';
import { Product } from './entities';
import { BEARER_AUTH } from '../config/swagger';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('products')
@ApiBearerAuth(BEARER_AUTH)
@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductService) {}

  /**
   * Alta de un producto con todos sus SKUs.
   *
   * El texto largo va en `description` y no en este JSDoc: cuando el handler
   * ya tiene un `@ApiOperation` explícito, el plugin no le inyecta el
   * comentario (sí lo hace con las propiedades de los DTOs).
   */
  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Alta de producto (simple, variable o combo)',
    description: [
      'El `type` se deduce del payload: hay `components` -> `bundle`, hay',
      '`variants` -> `variable`, si no `simple`. Mandalo explícito sólo si',
      'querés que se valide contra lo que enviaste.',
      '',
      'Elegí uno de los ejemplos del desplegable para ver la forma de cada caso.',
      '',
      '**Combos:** el contenido queda clavado al SKU que mandás en',
      '`components` (si es el del joystick rojo, el combo viene rojo). Para que',
      'el cliente elija, sumá una combinación en `variants` por cada opción,',
      'cada una con su propio `components`. El `stock` del combo no se toma del',
      'payload: sale del componente más escaso.',
    ].join('\n'),
  })
  @ApiBody({ type: ProductDto, examples: productExamples })
  @ApiCreatedResponse({
    description: 'El producto con sus SKUs, variantes, imágenes y componentes.',
    type: Product,
  })
  @ApiBadRequestResponse({
    description: 'Payload inválido o incoherente (ver el mensaje del error).',
  })
  @ApiForbiddenResponse({ description: 'Hace falta rol admin.' })
  @ApiNotFoundResponse({
    description: 'Algún SKU componente del combo no existe.',
  })
  @ApiConflictResponse({ description: 'El `code` de un SKU ya está en uso.' })
  async create(@Body() body: ProductDto) {
    return this.productService.create(body);
  }

  /** Listado de catálogo: sin descripciones, timestamps ni componentes. */
  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar productos' })
  @ApiOkResponse({ description: 'Productos con sus SKUs y variantes.' })
  @ApiNotFoundResponse({ description: 'No hay productos registrados.' })
  async getAllProducts() {
    return this.productService.findAll();
  }
}

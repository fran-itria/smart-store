import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
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
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ProductService } from './products.service';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ProductDto } from './dto/product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { productExamples, productUpdateExamples } from './dto/product.examples';
import { Product } from './entities';
import { BEARER_AUTH } from '../config/swagger';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('products')
@ApiBearerAuth(BEARER_AUTH)
@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductService) { }

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

  @Public()
  @Get('oneProduct/:id')
  @ApiOperation({ summary: 'Listar productos' })
  @ApiOkResponse({ description: 'Productos con sus SKUs y variantes.' })
  @ApiNotFoundResponse({ description: 'No hay productos registrados.' })
  @ApiQuery({ name: 'id', type: 'string' })
  async getOneProduct(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Editar un producto entero',
    description: [
      'Mismo payload que el alta: describe cómo queda el producto completo.',
      '',
      '**SKUs:** `variants` es la lista entera. Cada combinación se empareja',
      'con el SKU que ya tenía esas opciones (o con el de `skuId`, si lo',
      'mandás para cambiarle las opciones sin perderlo); las nuevas se crean',
      'y los SKUs que no aparecen se dan de baja. Si el SKU que querés sacar',
      'está dentro de otro combo, responde 409.',
      '',
      '**Lo que no mandás queda como está:** `description`, `isPublished`,',
      '`categoryIds`, `images`, y en cada SKU `stock`, `code` y',
      '`discountedPrice`. `null` borra `description` / `discountedPrice`;',
      '`[]` vacía `categoryIds` / `images`.',
      '',
      '**Combos:** `components` también es la lista entera; el contenido de',
      'cada SKU se rehace y su stock se recalcula.',
    ].join('\n'),
  })
  @ApiBody({ type: UpdateProductDto, examples: productUpdateExamples })
  @ApiOkResponse({
    description: 'El producto actualizado, con el mismo árbol que el alta.',
    type: Product,
  })
  @ApiBadRequestResponse({
    description: 'Payload inválido o incoherente (ver el mensaje del error).',
  })
  @ApiForbiddenResponse({ description: 'Hace falta rol admin.' })
  @ApiNotFoundResponse({
    description: 'No existe el producto, una categoría o un SKU componente.',
  })
  @ApiConflictResponse({
    description:
      'Un `code` ya está en uso, o se quiere quitar un SKU que usa otro combo.',
  })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateProductDto,
  ) {
    return this.productService.update(id, body);
  }
}

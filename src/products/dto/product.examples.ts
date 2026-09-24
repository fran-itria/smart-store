/**
 * Payloads listos para el botón "Try it out" de `POST /products`.
 *
 * Los `skuId` de los combos son de mentira: reemplazalos por ids de SKUs que
 * existan en tu base (los devuelve el alta de cualquier producto simple o
 * variable, en `skus[].id`).
 *
 * Los `categoryIds` también: salen de `GET /categories`. Van al nivel del
 * producto y no del SKU —las categorías son de la ficha de catálogo, no de
 * cada combinación—, y son opcionales: si no tenés ninguna a mano, borrá la
 * línea y el alta funciona igual.
 */
export const productExamples = {
  simple: {
    summary: 'Simple — un solo SKU',
    description: 'Sin variantes ni componentes. El `type` se resuelve solo.',
    value: {
      name: 'Joystick inalámbrico',
      description: 'Control inalámbrico con vibración.',
      price: 95000,
      discountedPrice: 85000,
      stock: 40,
      isPublished: true,
      categoryIds: ['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'],
      images: ['https://cdn.example.com/joystick.jpg'],
    },
  },

  variable: {
    summary: 'Variable — un SKU por combinación',
    description:
      'Cada combinación puede pisar precio y stock; si no los manda, hereda los del producto. Las categorías no: son del producto entero, todas sus combinaciones caen en las mismas.',
    value: {
      name: 'Joystick inalámbrico',
      price: 95000,
      stock: 0,
      categoryIds: ['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'],
      variants: [
        {
          variant: [{ name: 'Color', value: 'Rojo' }],
          stock: 25,
        },
        {
          variant: [{ name: 'Color', value: 'Azul' }],
          stock: 12,
          price: 99000,
        },
      ],
    },
  },

  bundleFijo: {
    summary: 'Combo fijo — el contenido lo clava el SKU',
    description:
      'El combo trae los SKUs que mandás, tal cual: si el SKU es el del joystick rojo, viene rojo. El `stock` del combo se ignora, se calcula desde los componentes.',
    value: {
      name: 'Combo Consola + 2 Joysticks Rojos',
      description: 'Consola con dos joysticks rojos.',
      price: 850000,
      isPublished: true,
      categoryIds: [
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      ],
      components: [
        { skuId: '11111111-1111-4111-8111-111111111111', quantity: 1 },
        { skuId: '22222222-2222-4222-8222-222222222222', quantity: 2 },
      ],
    },
  },

  bundleElegible: {
    summary: 'Combo elegible — el cliente elige el color',
    description:
      'Un SKU de combo por opción: lo común va en `components` del producto y lo que cambia, en el `components` de cada combinación. El front lo muestra con el mismo selector que un producto variable.',
    value: {
      name: 'Combo Consola + 2 Joysticks',
      price: 850000,
      isPublished: true,
      categoryIds: [
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      ],
      components: [
        { skuId: '11111111-1111-4111-8111-111111111111', quantity: 1 },
      ],
      variants: [
        {
          variant: [{ name: 'Color joystick', value: 'Rojo' }],
          components: [
            { skuId: '22222222-2222-4222-8222-222222222222', quantity: 2 },
          ],
        },
        {
          variant: [{ name: 'Color joystick', value: 'Azul' }],
          price: 870000,
          components: [
            { skuId: '33333333-3333-4333-8333-333333333333', quantity: 2 },
          ],
        },
      ],
    },
  },
};

/** Payloads para `PUT /products/:id`. Los ids son de mentira, como arriba. */
export const productUpdateExamples = {
  variable: {
    summary: 'Variable — renombrar, sumar y quitar combinaciones',
    description:
      '"Rojo" pasa a "Bordó" sin perder su SKU (por eso va el `skuId`), "Azul" se empareja solo por sus opciones y le cambia el precio, "Verde" es nueva y se crea. Cualquier otro SKU que tuviera el producto se da de baja. Como no va `images`, las imágenes quedan como estaban; el stock de los SKUs que no lo mandan, también.',
    value: {
      name: 'Joystick inalámbrico',
      price: 95000,
      isPublished: true,
      categoryIds: ['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'],
      variants: [
        {
          skuId: '44444444-4444-4444-8444-444444444444',
          variant: [{ name: 'Color', value: 'Bordó' }],
        },
        {
          variant: [{ name: 'Color', value: 'Azul' }],
          price: 99000,
          discountedPrice: null,
        },
        {
          variant: [{ name: 'Color', value: 'Verde' }],
          stock: 10,
        },
      ],
    },
  },
  simple: {
    summary: 'Simple — cambiar precio, imágenes y categorías',
    description:
      'Las imágenes se reemplazan por estas, en este orden. El stock no se toca porque no va.',
    value: {
      name: 'Joystick inalámbrico',
      description: 'Control inalámbrico con vibración y batería de 20 h.',
      price: 99000,
      discountedPrice: 89000,
      categoryIds: [
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      ],
      images: [
        'https://cdn.example.com/joystick-frente.jpg',
        'https://cdn.example.com/joystick.jpg',
      ],
    },
  },
};

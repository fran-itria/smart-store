/**
 * Payloads listos para el botón "Try it out" de `POST /products`.
 *
 * Los `skuId` de los combos son de mentira: reemplazalos por ids de SKUs que
 * existan en tu base (los devuelve el alta de cualquier producto simple o
 * variable, en `skus[].id`).
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
      images: ['https://cdn.example.com/joystick.jpg'],
    },
  },

  variable: {
    summary: 'Variable — un SKU por combinación',
    description:
      'Cada combinación puede pisar precio y stock; si no los manda, hereda los del producto.',
    value: {
      name: 'Joystick inalámbrico',
      price: 95000,
      stock: 0,
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

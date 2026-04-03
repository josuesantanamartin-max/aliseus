import { CategoryStructure, AutomationRule } from './types';

// --- PURE CONSTANTS ---

export const INITIAL_CATEGORIES: CategoryStructure[] = [
  { id: 'cat_1', type: 'EXPENSE', name: 'Vivienda', subCategories: ['Alquiler', 'Hipoteca', 'Comunidad', 'Mantenimiento', 'Seguro Hogar', 'Muebles y Decoración', 'Impuestos', 'Jardín'] },
  { id: 'cat_2', type: 'EXPENSE', name: 'Alimentación', subCategories: ['Supermercado', 'Restaurantes', 'Cafetería', 'Comida a Domicilio', 'Bebidas', 'Comedor Escolar'] },
  { id: 'cat_3', type: 'EXPENSE', name: 'Transporte', subCategories: ['Gasolina', 'Transporte Público', 'Mantenimiento', 'Parking', 'Seguro Vehículo', 'Taxi/VTC', 'Peajes', 'ITV'] },
  { id: 'cat_4', type: 'EXPENSE', name: 'Servicios', subCategories: ['Luz', 'Agua', 'Gas', 'Internet', 'Móvil', 'Streaming', 'Software', 'Limpieza', 'Seguridad'] },
  { id: 'cat_5', type: 'EXPENSE', name: 'Ocio', subCategories: ['Cine y Eventos', 'Viajes', 'Suscripciones', 'Deportes', 'Hobbies', 'Libros', 'Salidas Nocturnas'] },
  { id: 'cat_6', type: 'EXPENSE', name: 'Salud', subCategories: ['Médico', 'Farmacia', 'Gimnasio', 'Dentista', 'Psicólogo', 'Óptica', 'Seguro Salud'] },
  { id: 'cat_7', type: 'EXPENSE', name: 'Compras', subCategories: ['Ropa', 'Calzado', 'Electrónica', 'Accesorios', 'Hogar'] },
  { id: 'cat_8', type: 'EXPENSE', name: 'Educación', subCategories: ['Matrícula', 'Cursos y Formación', 'Material Escolar', 'Libros de Texto', 'Clases Particulares'] },
  { id: 'cat_9', type: 'EXPENSE', name: 'Cuidado Personal', subCategories: ['Peluquería', 'Estética', 'Cosmética', 'Masajes'] },
  { id: 'cat_10', type: 'EXPENSE', name: 'Mascotas', subCategories: ['Comida', 'Veterinario', 'Accesorios', 'Higiene'] },
  { id: 'cat_11', type: 'EXPENSE', name: 'Familia', subCategories: ['Cuidado Infantil', 'Juguetes', 'Ayuda Familiar', 'Paga Semanal'] },
  { id: 'cat_12', type: 'EXPENSE', name: 'Deudas', subCategories: ['Préstamo Personal', 'Tarjeta de Crédito', 'Intereses'] },
  { id: 'cat_13', type: 'EXPENSE', name: 'Ahorro', subCategories: ['Fondo Emergencia', 'Inversión', 'Hucha Virtual', 'Plan de Viaje'] },
  { id: 'cat_14', type: 'EXPENSE', name: 'Transferencia', subCategories: ['Entre Cuentas', 'Liquidación Tarjeta', 'Aportación Inversión', 'Bizum / Envío dinero'] },
  { id: 'cat_15', type: 'EXPENSE', name: 'Otros', subCategories: ['Donaciones', 'Multas', 'Tasas', 'Bancarios', 'Sin Clasificar'] },
  { id: 'cat_16', type: 'INCOME', name: 'Trabajo', subCategories: ['Salario', 'Bonus', 'Horas Extra', 'Comisiones', 'Dietas'] },
  { id: 'cat_17', type: 'INCOME', name: 'Negocios', subCategories: ['Ventas', 'Servicios', 'Consultoría'] },
  { id: 'cat_18', type: 'INCOME', name: 'Inversiones', subCategories: ['Dividendos', 'Intereses', 'Alquileres', 'Ganancias Capital', 'Criptomonedas'] },
  { id: 'cat_19', type: 'INCOME', name: 'Extraordinarios', subCategories: ['Devolución Compra', 'Regalos', 'Venta Segunda Mano', 'Premios', 'Herencias', 'Devolución Impuestos'] },
  { id: 'cat_20', type: 'INCOME', name: 'Ayudas', subCategories: ['Becas', 'Subvenciones', 'Prestaciones', 'Pensiones'] },
  { id: 'cat_21', type: 'INCOME', name: 'Transferencia', subCategories: ['Desde otra cuenta', 'Reintegro Ahorros'] },
];


export const DEFAULT_RULES: AutomationRule[] = [
  { id: 'rule_1', name: 'Alerta Gasto Alto (>200€)', trigger: 'TRANSACTION_OVER_AMOUNT', threshold: 200, action: 'SEND_ALERT', isActive: true },
  { id: 'rule_2', name: 'Categoría Viaje Automática', trigger: 'TRIP_CREATED', action: 'CREATE_CATEGORY_FOR_TRIP', isActive: true },
];



import { Ingredient, Recipe, Trip, FamilyMember, Chore, DashboardWidget } from '../../types';

export const DEFAULT_KITCHEN_WIDGETS: DashboardWidget[] = [
    { id: 'STATS_ROW', visible: true, order: 1 },
    { id: 'TODAY_MENU_CARD', visible: true, order: 2 },
    { id: 'SHOPPING_LIST_CARD', visible: true, order: 3 },
];

export const MOCK_PANTRY: Ingredient[] = [
    { id: '1', name: 'Leche Entera', quantity: 2, unit: 'l', category: 'Dairy', expiryDate: '2024-03-15', lowStockThreshold: 1 },
    { id: '2', name: 'Huevos L', quantity: 4, unit: 'pcs', category: 'Dairy', expiryDate: '2024-03-10', lowStockThreshold: 6 },
    { id: '3', name: 'Arroz Redondo', quantity: 1.5, unit: 'kg', category: 'Pantry', lowStockThreshold: 0.5 },
];

export const MOCK_RECIPES: Recipe[] = [
    {
        id: '1', name: 'Pasta Carbonara', prepTime: 20, calories: 550, tags: ['Italian', 'Quick', 'Dinner'], rating: 5, baseServings: 2,
        image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?q=80&w=800&auto=format&fit=crop',
        ingredients: [
            { name: 'Espaguetis', quantity: 200, unit: 'g' },
            { name: 'Huevos', quantity: 3, unit: 'pcs' },
            { name: 'Bacon', quantity: 100, unit: 'g' },
            { name: 'Parmesano', quantity: 50, unit: 'g' }
        ],
        instructions: ['Hervir agua y cocer pasta', 'Freír bacon hasta que esté crujiente', 'Mezclar huevos con queso y pimienta', 'Mezclar todo fuera del fuego con un poco de agua de cocción'],
        macros: { protein: 25, carbs: 65, fat: 22 }
    },
    {
        id: '2', name: 'Bowl de Yogur con Frutas', prepTime: 5, calories: 250, tags: ['Breakfast', 'Healthy', 'Quick'], rating: 4.9, baseServings: 1,
        image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=800&auto=format&fit=crop',
        ingredients: [
            { name: 'Yogur Griego', quantity: 1, unit: 'pcs' },
            { name: 'Fresas', quantity: 5, unit: 'pcs' },
            { name: 'Arándanos', quantity: 10, unit: 'pcs' },
            { name: 'Miel', quantity: 1, unit: 'cda' },
            { name: 'Nueces', quantity: 20, unit: 'g' }
        ],
        instructions: ['Servir el yogur en un bol', 'Lavar y cortar las fresas', 'Añadir las frutas y nueces por encima', 'Rociar con miel al gusto'],
        macros: { protein: 12, carbs: 35, fat: 8 }
    },
    {
        id: '3', name: 'Salmón al Horno con Verduras', prepTime: 35, calories: 450, tags: ['Dinner', 'Healthy', 'Fish'], rating: 4.5, baseServings: 2,
        image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800&auto=format&fit=crop',
        ingredients: [
            { name: 'Lomos de Salmón', quantity: 2, unit: 'pcs' },
            { name: 'Espárragos', quantity: 1, unit: 'manojo' },
            { name: 'Limón', quantity: 1, unit: 'pcs' },
            { name: 'Aceite de Oliva', quantity: 10, unit: 'ml' }
        ],
        instructions: ['Precalentar horno a 200°C', 'Colocar salmón y verduras en bandeja', 'Rociar con aceite y limón', 'Hornear 15-20 minutos'],
        macros: { protein: 34, carbs: 12, fat: 28 }
    },
    {
        id: '4', name: 'Pollo al Curry con Arroz', prepTime: 40, calories: 600, tags: ['Lunch', 'Spicy', 'Asian'], rating: 4.7, baseServings: 4,
        image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=800&auto=format&fit=crop',
        ingredients: [
            { name: 'Pechuga de Pollo', quantity: 500, unit: 'g' },
            { name: 'Leche de Coco', quantity: 400, unit: 'ml' },
            { name: 'Arroz Basmati', quantity: 300, unit: 'g' },
            { name: 'Curry en polvo', quantity: 2, unit: 'cda' }
        ],
        instructions: ['Cocer el arroz', 'Sofreír pollo troceado', 'Añadir curry y leche de coco', 'Cocinar a fuego lento 15 min y servir con arroz'],
        macros: { protein: 42, carbs: 55, fat: 18 }
    },
    {
        id: '5', name: 'Ensalada César', prepTime: 15, calories: 380, tags: ['Lunch', 'Salad', 'Quick'], rating: 4.2, baseServings: 2,
        image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?q=80&w=800&auto=format&fit=crop',
        ingredients: [
            { name: 'Lechuga Romana', quantity: 1, unit: 'pcs' },
            { name: 'Pechuga Pollo', quantity: 200, unit: 'g' },
            { name: 'Picatostes', quantity: 50, unit: 'g' },
            { name: 'Salsa César', quantity: 50, unit: 'ml' },
            { name: 'Queso Parmesano', quantity: 30, unit: 'g' }
        ],
        instructions: ['Lavar y cortar lechuga', 'Hacer pollo a la plancha y cortar', 'Mezclar todo en un bol con la salsa y el queso'],
        macros: { protein: 28, carbs: 15, fat: 22 }
    },
    {
        id: '6', name: 'Tortitas de Avena y Plátano', prepTime: 15, calories: 280, tags: ['Breakfast', 'Healthy', 'Kids'], rating: 4.9, baseServings: 2,
        image: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?q=80&w=800&auto=format&fit=crop',
        ingredients: [
            { name: 'Avena', quantity: 100, unit: 'g' },
            { name: 'Plátano Maduro', quantity: 2, unit: 'pcs' },
            { name: 'Huevos', quantity: 2, unit: 'pcs' },
            { name: 'Canela', quantity: 1, unit: 'cdta' }
        ],
        instructions: ['Triturar todos los ingredientes', 'Calentar sartén antiadherente', 'Cocinar tortitas vuelta y vuelta', 'Servir con fruta o miel'],
        macros: { protein: 12, carbs: 45, fat: 6 }
    },
    {
        id: '7', name: 'Gazpacho Andaluz', prepTime: 20, calories: 150, tags: ['Lunch', 'Summer', 'Spanish'], rating: 4.6, baseServings: 4,
        image: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?q=80&w=800&auto=format&fit=crop',
        ingredients: [
            { name: 'Tomates Maduros', quantity: 1, unit: 'kg' },
            { name: 'Pimiento Verde', quantity: 1, unit: 'pcs' },
            { name: 'Pepino', quantity: 1, unit: 'pcs' },
            { name: 'Ajo', quantity: 2, unit: 'dientes' },
            { name: 'Aceite de Oliva', quantity: 50, unit: 'ml' }
        ],
        instructions: ['Lavar y trocear verduras', 'Triturar todo muy fino', 'Añadir aceite, vinagre y sal', 'Colar y enfriar en nevera'],
        macros: { protein: 3, carbs: 18, fat: 8 }
    },
    {
        id: '8', name: 'Tostada de Aguacate y Huevo', prepTime: 10, calories: 340, tags: ['Breakfast', 'Healthy', 'Quick'], rating: 4.8, baseServings: 1,
        image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?q=80&w=800&auto=format&fit=crop',
        ingredients: [
            { name: 'Pan Integral', quantity: 1, unit: 'rebanada' },
            { name: 'Aguacate', quantity: 0.5, unit: 'pcs' },
            { name: 'Huevo', quantity: 1, unit: 'pcs' },
            { name: 'Limón', quantity: 0.5, unit: 'pcs' },
            { name: 'Chile en escamas', quantity: 1, unit: 'pizca' }
        ],
        instructions: ['Tostar el pan', 'Machacar el aguacate con limón y sal', 'Escalfar o freír el huevo', 'Montar la tostada y decorar con chile'],
        macros: { protein: 14, carbs: 28, fat: 18 }
    },
    {
        id: '9', name: 'Tacos de Ternera', prepTime: 25, calories: 420, tags: ['Dinner', 'Mexican', 'Lunch'], rating: 4.7, baseServings: 3,
        image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=800&auto=format&fit=crop',
        ingredients: [
            { name: 'Tortillas de Maíz', quantity: 6, unit: 'pcs' },
            { name: 'Carne Picada', quantity: 300, unit: 'g' },
            { name: 'Cebolla Morada', quantity: 1, unit: 'pcs' },
            { name: 'Cilantro', quantity: 1, unit: 'manojo' },
            { name: 'Lima', quantity: 2, unit: 'pcs' }
        ],
        instructions: ['Sofreír la carne con especias', 'Calentar las tortillas', 'Picar cebolla y cilantro', 'Servir la carne en tortillas con guarnición y lima'],
        macros: { protein: 32, carbs: 42, fat: 18 }
    },
    {
        id: '10', name: 'Salteado de Verduras y Tofu', prepTime: 20, calories: 290, tags: ['Lunch', 'Healthy', 'Asian', 'Vegan'], rating: 4.6, baseServings: 2,
        image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=800&auto=format&fit=crop',
        ingredients: [
            { name: 'Tofu Firme', quantity: 200, unit: 'g' },
            { name: 'Brócoli', quantity: 1, unit: 'cabeza' },
            { name: 'Zanahoria', quantity: 2, unit: 'pcs' },
            { name: 'Salsa de Soja', quantity: 30, unit: 'ml' },
            { name: 'Aceite de Sésamo', quantity: 10, unit: 'ml' }
        ],
        instructions: ['Prensar y cortar el tofu en cubos', 'Saltear el tofu hasta que esté dorado', 'Añadir verduras troceadas y cocinar al dente', 'Añadir salsa de soja y aceite de sésamo'],
        macros: { protein: 22, carbs: 18, fat: 12 }
    },
    {
        id: '11', name: 'Risotto de Setas', prepTime: 45, calories: 510, tags: ['Dinner', 'Italian'], rating: 4.9, baseServings: 4,
        image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?q=80&w=800&auto=format&fit=crop',
        ingredients: [
            { name: 'Arroz Arborio', quantity: 300, unit: 'g' },
            { name: 'Setas Variadas', quantity: 250, unit: 'g' },
            { name: 'Caldo de Verduras', quantity: 1, unit: 'l' },
            { name: 'Vino Blanco', quantity: 100, unit: 'ml' },
            { name: 'Parmesano', quantity: 50, unit: 'g' }
        ],
        instructions: ['Sofreír setas y reservar', 'Tostar el arroz y añadir vino', 'Añadir caldo caliente poco a poco removiendo', 'Mantecar con queso y añadir setas al final'],
        macros: { protein: 15, carbs: 75, fat: 16 }
    },
    {
        id: '12', name: 'Smoothie Bowl de Frutos Rojos', prepTime: 10, calories: 340, tags: ['Breakfast', 'Healthy', 'Summer'], rating: 4.8, baseServings: 1,
        image: 'https://images.unsplash.com/photo-1626078436912-e7059737e9e0?q=80&w=800&auto=format&fit=crop',
        ingredients: [
            { name: 'Frutos Rojos Congelados', quantity: 150, unit: 'g' },
            { name: 'Plátano', quantity: 1, unit: 'pcs' },
            { name: 'Yogur Natural', quantity: 100, unit: 'g' },
            { name: 'Granola', quantity: 30, unit: 'g' },
            { name: 'Semillas de Chía', quantity: 10, unit: 'g' }
        ],
        instructions: ['Triturar frutas con yogur hasta tener textura cremosa', 'Servir en un bol', 'Decorar con granola, fruta fresca y semillas'],
        macros: { protein: 10, carbs: 55, fat: 9 }
    },
];

export const MOCK_TRIPS: Trip[] = [
    {
        id: 'trip-1',
        destination: 'Japón',
        country: 'Japón',
        startDate: '2026-08-01',
        endDate: '2026-08-15',
        budget: 5000,
        spent: 2200,
        status: 'UPCOMING',
        image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop',
        flights: [
            {
                id: 'f-1',
                airline: 'Iberia',
                flightNumber: 'IB3250',
                origin: 'MAD',
                destination: 'NRT',
                departureTime: '2026-08-01T10:00:00Z',
                arrivalTime: '2026-08-02T12:30:00Z',
                price: 1180,
                bookingUrl: 'https://www.iberia.com'
            }
        ],
        accommodations: [
            {
                id: 'a-1',
                name: 'Hotel Gracery Shinjuku',
                address: '1-19-1 Kabukicho, Shinjuku City',
                checkIn: '2026-08-02',
                checkOut: '2026-08-08',
                price: 1020,
                bookingUrl: 'https://gracery.com/shinjuku'
            }
        ],
        itinerary: [
            { id: 'i-1', time: '14:00', activity: 'Llegada a Tokio y Check-in', location: 'Shinjuku', type: 'TRANSPORT' },
            { id: 'i-2', time: '17:00', activity: 'Paseo por Shibuya', location: 'Tokio', type: 'ACTIVITY' },
            { id: 'i-3', time: '20:00', activity: 'Cena Sushi', location: 'Tokio', type: 'FOOD' },
        ],
        checklist: [
            { id: 'c-1', task: 'Pasaportes vigentes', completed: true },
            { id: 'c-2', task: 'Seguro de viaje contratado', completed: true },
            { id: 'c-3', task: 'Japan Rail Pass', completed: false },
            { id: 'c-4', task: 'Adaptador de enchufes', completed: false }
        ],
        linkedGoalId: '2' // Links to Goal ID 2 in financeSeed
    }
];

export const MOCK_FAMILY: FamilyMember[] = [
    {
        id: 'p1',
        name: 'Josué',
        relationship: 'Padre',
        role: 'PARENT',
        avatar: '👨‍💼',
        balance: 1250.75,
        weeklyAllowance: 0,
        birthDate: '1990-06-25',
        email: 'josue@example.com',
        phone: '+34 600 000 000',
        isEmergencyContact: true,
        growthHistory: []
    },
    {
        id: 'p2',
        name: 'Elena',
        relationship: 'Madre',
        role: 'PARENT',
        avatar: '👩‍💼',
        balance: 980.20,
        weeklyAllowance: 0,
        birthDate: '1992-03-12',
        email: 'elena@example.com',
        phone: '+34 611 111 111',
        isEmergencyContact: true,
        growthHistory: []
    },
    {
        id: 'k1',
        name: 'Joel',
        relationship: 'Hijo',
        role: 'CHILD',
        avatar: '👦',
        balance: 45.50,
        weeklyAllowance: 10,
        birthDate: '2018-05-15',
        email: '',
        phone: '',
        isEmergencyContact: false,
        growthHistory: [
            { date: '2023-01-15', height: 110, weight: 19.5 },
            { date: '2023-04-15', height: 112, weight: 20.2 },
            { date: '2023-07-15', height: 114, weight: 21.0 },
            { date: '2023-10-15', height: 115, weight: 21.8 },
            { date: '2024-01-15', height: 117, weight: 22.5 }
        ]
    },
    {
        id: 'k2',
        name: 'Sofía',
        relationship: 'Hija',
        role: 'CHILD',
        avatar: '👧',
        balance: 15.00,
        weeklyAllowance: 5,
        birthDate: '2021-11-20',
        email: '',
        phone: '',
        isEmergencyContact: false,
        growthHistory: [
            { date: '2023-01-20', height: 85, weight: 12.0 },
            { date: '2023-07-20', height: 88, weight: 13.5 },
            { date: '2024-01-20', height: 92, weight: 14.8 }
        ]
    }
];

export const MOCK_CHORES: Chore[] = [
    { id: 'c1', title: 'Hacer la cama', reward: 1, assignedTo: 'k1', status: 'PENDING', recurrence: 'DAILY', icon: 'Bed' },
];

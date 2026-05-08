import { faker } from "@faker-js/faker";

type province = 'Buenos Aires' | 'Capital Federal'  | 'Catamarca' | 'Chaco' | 'Chubut' | 'Cordoba' | 'Corrientes' | 'Entre Rios' | 'Formosa' | 'Jujuy' | 'La Pampa' | 'La Rioja' | 'Mendoza' | 'Misiones' | 'Neuquen' | 'Rio Negro' | 'Salta' | 'San Juan' | 'San Luis' | 'Santa Cruz' | 'Santa Fe' | 'Santiago del Estero' | 'Tierra del Fuego' | 'Tucuman'

export interface Remitter {
    REMITTER_NAME: string;
    REMITTER_LASTNAME: string;
    REMITTER_COMPANY: string;
    REMITTER_ADDRESS: string;
    REMITTER_NUMBER: string;
    REMITTER_FLOOR: number;
    REMITTER_POSTALCODE: number;
    REMITTER_PROVINCE: province;
    REMITTER_LOCALITY: string;
}

export function createRandomRemitter(): Remitter {
    return {
        REMITTER_NAME: faker.person.firstName(),
        REMITTER_LASTNAME: faker.person.lastName(),
        REMITTER_COMPANY: faker.company.name(),
        REMITTER_ADDRESS: faker.location.street(),
        REMITTER_NUMBER: faker.location.buildingNumber(),
        REMITTER_FLOOR: faker.number.int({ min: 1, max: 10 }),
        REMITTER_POSTALCODE: 1827,
        REMITTER_PROVINCE: faker.helpers.arrayElement(['Buenos Aires']),
        REMITTER_LOCALITY: 'San Justo'
    };
}

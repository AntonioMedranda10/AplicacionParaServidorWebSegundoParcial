export declare enum EstadoEspacio {
    DISPONIBLE = "DISPONIBLE",
    MANTENIMIENTO = "MANTENIMIENTO",
    CLAUSURADO = "CLAUSURADO"
}
export declare class Espacio {
    id: string;
    nombre: string;
    capacidad: number;
    tipo: string;
    estado: EstadoEspacio;
}

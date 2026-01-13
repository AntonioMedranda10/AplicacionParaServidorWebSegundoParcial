import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

// Exportamos el Enum para usarlo en los DTOs
export enum EstadoEspacio {
  DISPONIBLE = 'DISPONIBLE',
  MANTENIMIENTO = 'MANTENIMIENTO',
  CLAUSURADO = 'CLAUSURADO'
}

@Entity()
export class Espacio {
  @PrimaryGeneratedColumn('uuid') // ID único y seguro
  id: string;

  @Column()
  nombre: string;

  @Column('int')
  capacidad: number;

  @Column()
  tipo: string; // Ej: Auditorio, Sala

  @Column({
    type: 'simple-enum',
    enum: EstadoEspacio,
    default: EstadoEspacio.DISPONIBLE
  })
  estado: EstadoEspacio;
}
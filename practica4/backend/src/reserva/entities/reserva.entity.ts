import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Espacio } from '../../espacio/entities/espacio.entity'; 

export enum EstadoReserva {
  PENDIENTE = 'PENDIENTE',
  CONFIRMADA = 'CONFIRMADA',
  CANCELADA = 'CANCELADA',
  FINALIZADA = 'FINALIZADA',
}

@Entity()
export class Reserva {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Guardamos la fecha/hora exacta de creación (Auditoría)
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  fechaInicio: Date;

  @Column()
  fechaFin: Date;

  @Column({
    type: 'simple-enum',
    enum: EstadoReserva,
    default: EstadoReserva.PENDIENTE
  })
  estado: EstadoReserva;

  // --- RELACIONES (Buenas Prácticas) ---
  
  @ManyToOne(() => Espacio, (espacio) => espacio.id, { nullable: false })
  espacio: Espacio;

  @Column()
  espacioId: string;

  @Column()
  usuarioId: string; 
}
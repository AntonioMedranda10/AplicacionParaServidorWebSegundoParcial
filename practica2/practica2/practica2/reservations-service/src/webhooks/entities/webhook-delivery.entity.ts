import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'webhook_deliveries' })
export class WebhookDelivery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'subscription_id' })
  subscriptionId: number;

  @Column({ name: 'event_id' })
  eventId: string;

  @Column({ name: 'attempt_number' })
  attemptNumber: number;

  @Column({ name: 'status_code', nullable: true })
  statusCode?: number;

  @Column({ length: 20 })
  status: 'success' | 'failed' | 'pending';

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string;

  @CreateDateColumn({ name: 'delivered_at', type: 'timestamptz' })
  deliveredAt: Date;

  @Column({ name: 'duration_ms', type: 'int', nullable: true })
  durationMs?: number;
}
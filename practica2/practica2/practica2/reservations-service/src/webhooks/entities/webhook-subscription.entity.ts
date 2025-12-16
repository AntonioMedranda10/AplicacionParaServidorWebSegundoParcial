import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'webhook_subscriptions' })
export class WebhookSubscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'event_type', length: 100 })
  eventType: string;

  @Column({ length: 500 })
  url: string;

  @Column({ length: 255 })
  secret: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'retry_config', type: 'jsonb', nullable: true })
  retryConfig?: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @Column({ name: 'last_triggered_at', type: 'timestamptz', nullable: true })
  lastTriggeredAt?: Date;
}
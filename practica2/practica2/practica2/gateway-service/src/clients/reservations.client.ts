import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { timeout } from 'rxjs/operators';

@Injectable()
export class ReservationsClient implements OnModuleInit {
  private client!: ClientProxy;
  private readonly logger = new Logger(ReservationsClient.name);

  onModuleInit() {
    const rmqUrl = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [rmqUrl],
        queue: 'gateway_to_reservations_queue',
        queueOptions: { durable: true },
      },
    });
  }

  async createReservation(data: any, idempotencyKey?: string): Promise<any> {
    const payload = { data, idempotencyKey };
    try {
      const obs = this.client.send('create_reservation', payload).pipe(timeout(5000));
      return await firstValueFrom(obs);
    } catch (err) {
      this.logger.error('Error calling reservations service', err as any);
      throw err;
    }
  }

  async getReservation(id: string): Promise<any> {
    try {
      const obs = this.client.send('get_reservation', { id }).pipe(timeout(5000));
      return await firstValueFrom(obs);
    } catch (err) {
      this.logger.error('Error getting reservation', err as any);
      throw err;
    }
  }

  async getAllReservations(): Promise<any[]> {
    try {
      const obs = this.client.send('get_all_reservations', {}).pipe(timeout(5000));
      return await firstValueFrom(obs);
    } catch (err) {
      this.logger.error('Error getting all reservations', err as any);
      throw err;
    }
  }

  async updateReservation(id: string, data: any): Promise<any> {
    return this.client.send('update_reservation', { id, data }).toPromise();
  }

  async deleteReservation(id: string): Promise<any> {
    return this.client.send('delete_reservation', { id }).toPromise();
  }
}
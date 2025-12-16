import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SpaceDto } from './dtos/space.dto';

@Injectable()
export class SpacesClient {
  private readonly baseUrl: string;

  constructor(private readonly httpService: HttpService) {
    // Por defecto usar el hostname del servicio en docker-compose y el puerto interno
    // Evita usar localhost dentro del contenedor (apunta al propio contenedor)
    this.baseUrl = process.env.SPACES_SERVICE_URL || 'http://spaces-service:3000';
  }

  getAllSpaces(): Observable<any> {
    return this.httpService.get(`${this.baseUrl}/spaces`).pipe(map((r: any) => r.data));
  }

  getSpaceById(id: string): Observable<any> {
    return this.httpService.get(`${this.baseUrl}/spaces/${id}`).pipe(map((r: any) => r.data));
  }

  createSpace(spaceDto: SpaceDto): Observable<any> {
    return this.httpService.post(`${this.baseUrl}/spaces`, spaceDto).pipe(map((r: any) => r.data));
  }

  updateSpace(id: string, spaceDto: SpaceDto): Observable<any> {
    return this.httpService.put(`${this.baseUrl}/spaces/${id}`, spaceDto).pipe(map((r: any) => r.data));
  }

  deleteSpace(id: string): Observable<any> {
    return this.httpService.delete(`${this.baseUrl}/spaces/${id}`).pipe(map((r: any) => r.data));
  }
}
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'personas',
})
export class personas {
  @PrimaryGeneratedColumn()
  idpersona: number;

  @Column({ type: 'text' })
  nombres: string;

  @Column({ type: 'text' })
  apellidopaterno: string;

  @Column({ type: 'text' })
  apellidomaterno: string;

  @Column({ type: 'text' })
  razonsocial: string;
}

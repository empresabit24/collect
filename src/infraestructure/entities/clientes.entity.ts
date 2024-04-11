import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'clientes',
})
export class clientes {
  @PrimaryGeneratedColumn()
  idcliente: number;

  @Column({ type: 'numeric' })
  codigodirecto: number;

  @Column({ type: 'numeric' })
  idestado: number;

  @Column({ type: 'numeric' })
  idusuario: number;
}

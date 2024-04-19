import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { collect } from './collect.entity';
import { clientes } from '../../infraestructure/entities';

@Entity({
  name: 'receivable',
})
export class receivable {
  @PrimaryGeneratedColumn()
  id_receivable: number;

  @Column({ type: 'numeric' })
  idcliente: number; // tabla: sch_main.clientes

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'numeric' })
  iddocumentoventa: number; //tabla: sch_main.documentosventa

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  pending_amount: number;

  @CreateDateColumn()
  payday_limit: Date;

  @Column({ type: 'numeric' })
  state: number;

  @OneToMany(() => collect, (collect) => collect.receivable)
  @JoinColumn({ name: 'id_collect' })
  collects: collect[];

  @OneToOne(() => clientes)
  @JoinColumn({ name: 'idcliente' })
  infoCliente: clientes;

  @ManyToOne(() => clientes, (cliente) => cliente.receivables)
  @JoinColumn({ name: 'idcliente' })
  cliente: clientes;

  @BeforeInsert()
  formatAmount(): void {
    // Redondear el valor de total_amount a dos decimales e igualar total_amount con pending
    this.total_amount = Math.round(this.total_amount * 100) / 100;
    this.pending_amount = this.total_amount;
  }
}

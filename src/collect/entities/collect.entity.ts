import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity, JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { receivable } from './receivable.entity';

@Entity({
  name: 'collect',
})
export class collect {
  @PrimaryGeneratedColumn()
  id_collect: number;

  @Column({ type: 'numeric' })
  id_receivable: number;

  @Column({ type: 'numeric' })
  idformapago: number; //tabla: sch_main.formaspago

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @CreateDateColumn()
  payment_date: Date;

  @ManyToOne(() => receivable, (receivable) => receivable.collects)
  @JoinColumn({ name: 'id_receivable' })
  receivable: receivable;

  @BeforeInsert()
  formatAmount() {
    // Redondear el valor de amount a dos decimales
    this.amount = Math.round(this.amount * 100) / 100;
  }
}

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class TemporaryMetadata {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  dataId: string;

  @Column({ nullable: true })
  fileType: string;

  @Column()
  userId: string;

  @Column({ type: 'text', nullable: true })
  fieldsEncrypted: string; // JSON string for SQLite compatibility

  @Column({ nullable: true })
  encryptedFilePath: string;

  @Column({ nullable: true })
  selfDestructScript: string;

  @Column({ type: 'text', nullable: true })
  storageConfig: string; // JSON string for SQLite compatibility

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ default: false })
  processed: boolean;

  @Column({ nullable: true })
  expiresAt: Date;
}

import { share } from '../../../connection';
import { BlobStorage, type ListedBlobRecord } from '../../../storage';
import { BlobIDBConnection } from './db';

/**
 * @deprecated readonly
 */
export class IndexedDBV1BlobStorage extends BlobStorage {
  readonly connection = share(new BlobIDBConnection(this.spaceId));

  get db() {
    return this.connection.inner;
  }

  override async get(key: string) {
    const trx = this.db.transaction('blob', 'readonly');
    const blob = await trx.store.get(key);
    if (!blob) {
      return null;
    }

    return {
      key,
      mime: '',
      createdAt: new Date(),
      data: new Uint8Array(blob),
    };
  }

  override async delete(key: string, permanently: boolean) {
    if (permanently) {
      const trx = this.db.transaction('blob', 'readwrite');
      await trx.store.delete(key);
    }
  }

  override async list() {
    const trx = this.db.transaction('blob', 'readonly');
    const it = trx.store.iterate();

    const records: ListedBlobRecord[] = [];

    for await (const { key, value } of it) {
      records.push({
        key,
        mime: '',
        size: value.byteLength,
        createdAt: new Date(),
      });
    }

    return records;
  }

  override async set() {
    // no more writes
  }

  override async release() {
    // no more writes
  }
}
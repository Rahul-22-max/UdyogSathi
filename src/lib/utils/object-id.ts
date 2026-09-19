import mongoose from 'mongoose';

export function isValidObjectId(id?: string | null): boolean {
  if (!id || typeof id !== 'string') return false;
  return mongoose.Types.ObjectId.isValid(id);
}

export function toObjectId(id: string): mongoose.Types.ObjectId {
  if (!isValidObjectId(id)) {
    throw new Error(`Invalid Mongo ObjectId string: "${id}"`);
  }
  return new mongoose.Types.ObjectId(id);
}

export function serializeDocument<T = any>(doc: any): T {
  if (!doc) return doc;
  if (Array.isArray(doc)) {
    return doc.map(serializeDocument) as unknown as T;
  }
  if (typeof doc === 'object' && doc !== null) {
    const clone: any = { ...doc };
    if (clone._id) {
      clone.id = clone._id.toString();
    }
    for (const key of Object.keys(clone)) {
      if (clone[key] && typeof clone[key] === 'object' && clone[key]._bsontype === 'ObjectID') {
        clone[key] = clone[key].toString();
      }
    }
    return clone;
  }
  return doc;
}

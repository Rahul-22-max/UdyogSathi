if (typeof window !== 'undefined') {
  throw new Error('Server-only module');
}
import { connectToDatabase } from "@/lib/db/mongoose";
import { UserModel, IUser } from "@/lib/models/user.model";

export async function findUserByEmail(email: string): Promise<IUser | null> {
  await connectToDatabase();
  return UserModel.findOne({ email: email.toLowerCase().trim() }).exec();
}

export async function findUserById(id: string): Promise<IUser | null> {
  await connectToDatabase();
  return UserModel.findById(id).exec();
}

export async function createUser(data: Partial<IUser>): Promise<IUser> {
  await connectToDatabase();
  const user = new UserModel(data);
  return user.save();
}

export async function updateUserProfile(id: string, updates: Partial<IUser>): Promise<IUser | null> {
  await connectToDatabase();
  return UserModel.findByIdAndUpdate(id, { $set: updates }, { new: true }).exec();
}
